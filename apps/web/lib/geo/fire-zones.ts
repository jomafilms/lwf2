import buffer from "@turf/buffer";
import difference from "@turf/difference";
import { union } from "@turf/union";
import { polygon, featureCollection } from "@turf/helpers";
import { ZONE_COLORS } from "@/lib/design-tokens";
import type { Feature, Polygon, MultiPolygon, FeatureCollection } from "geojson";

export interface FireZones {
  zone0: Feature<Polygon>; // 0-5ft from structure
  zone1: Feature<Polygon>; // 5-30ft
  zone2: Feature<Polygon>; // 30-100ft
}

const FEET_TO_KILOMETERS = 0.0003048;

/**
 * Calculate fire zones from a structure footprint polygon.
 * Uses Turf.js buffer to create concentric zones per NFPA/IBHS guidelines.
 */
export function calculateFireZones(
  structureCoords: [number, number][]
): FireZones {
  // Close the ring if not already closed
  const coords = [...structureCoords];
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    coords.push([...first] as [number, number]);
  }

  const structure = polygon([coords]);

  // Create buffers at each distance
  const buffer5ft = buffer(structure, 5 * FEET_TO_KILOMETERS, {
    units: "kilometers",
  }) as Feature<Polygon>;
  const buffer30ft = buffer(structure, 30 * FEET_TO_KILOMETERS, {
    units: "kilometers",
  }) as Feature<Polygon>;
  const buffer100ft = buffer(structure, 100 * FEET_TO_KILOMETERS, {
    units: "kilometers",
  }) as Feature<Polygon>;

  // Create ring zones by subtracting inner areas from outer areas
  const zone0 = buffer5ft; // 0-5ft: just the 5ft buffer
  
  const zone1 = difference(featureCollection([buffer30ft, buffer5ft])) as Feature<Polygon>; // 5-30ft: 30ft buffer minus 5ft buffer
  
  const zone2 = difference(featureCollection([buffer100ft, buffer30ft])) as Feature<Polygon>; // 30-100ft: 100ft buffer minus 30ft buffer

  return { zone0, zone1, zone2 };
}

/**
 * Convert fire zones to a GeoJSON FeatureCollection for Mapbox rendering.
 * Each feature has a `zone` property for styling.
 */
export function fireZonesToGeoJSON(
  zones: FireZones
): FeatureCollection<Polygon> {
  return featureCollection([
    { ...zones.zone2, properties: { zone: "zone2", label: "Zone 2 (30-100ft)" } },
    { ...zones.zone1, properties: { zone: "zone1", label: "Zone 1 (5-30ft)" } },
    { ...zones.zone0, properties: { zone: "zone0", label: "Zone 0 (0-5ft)" } },
  ]);
}

export const ZONE_OPACITY = {
  zone0: 0.4,
  zone1: 0.3,
  zone2: 0.2,
} as const;

// ─── Building-Based Zone Ring Computation (Fireshire Integration) ─────────────

/**
 * Building-based zone result from Fireshire integration
 * 
 * Adapted from Fireshire project (MIT License) by Robert Head
 * https://github.com/robert-fireshire/fireshire
 */
export interface BuildingZoneResult {
  zone1: FeatureCollection<Polygon | MultiPolygon>; // 0-5ft from buildings
  zone2: FeatureCollection<Polygon | MultiPolygon>; // 5-10ft  
  zone3: FeatureCollection<Polygon | MultiPolygon>; // 10-30ft
  zone4: FeatureCollection<Polygon | MultiPolygon>; // 30-100ft
}

/** Fireshire zone distance bands in feet */
const FIRESHIRE_ZONE_DISTANCES = [5, 10, 30, 100] as const;

/**
 * Compute concentric zone ring polygons around building footprints.
 * 
 * This is the core Fireshire algorithm for creating fire-reluctant zones
 * around existing building structures from GIS data.
 * 
 * For each building polygon, buffers are computed at 5, 10, 30, and 100 feet.
 * Ring differencing produces donut-shaped zones:
 *   zone1 = buffer(5ft) - building
 *   zone2 = buffer(10ft) - buffer(5ft)
 *   zone3 = buffer(30ft) - buffer(10ft)
 *   zone4 = buffer(100ft) - buffer(30ft)
 * 
 * Same-zone rings are unioned across all buildings for clean overlap handling.
 * Cross-building subtraction ensures each zone only covers its proper distance band.
 * 
 * @param buildings GeoJSON FeatureCollection of building footprints from Ashland GIS
 * @returns Zone ring polygons for fire-reluctant landscape planning
 */
export function computeBuildingZoneRings(
  buildings: FeatureCollection<Polygon | MultiPolygon>
): BuildingZoneResult {
  const emptyResult: BuildingZoneResult = {
    zone1: featureCollection([]),
    zone2: featureCollection([]),
    zone3: featureCollection([]),
    zone4: featureCollection([]),
  };

  if (!buildings.features || buildings.features.length === 0) {
    return emptyResult;
  }

  // Accumulate ring features per zone across all buildings
  const zoneRings: [
    Feature<Polygon | MultiPolygon>[],
    Feature<Polygon | MultiPolygon>[],
    Feature<Polygon | MultiPolygon>[],
    Feature<Polygon | MultiPolygon>[],
  ] = [[], [], [], []];

  for (const building of buildings.features) {
    try {
      // Compute buffers at each distance
      const buffers = FIRESHIRE_ZONE_DISTANCES.map((dist) =>
        buffer(building, dist, { units: "feet" })
      );

      // zone1: buffer(5ft) - building footprint
      const ring0 = difference(
        featureCollection([buffers[0]!, building])
      );
      if (ring0) {
        zoneRings[0].push(ring0 as Feature<Polygon | MultiPolygon>);
      }

      // zone2..4: buffer(n) - buffer(n-1)
      for (let i = 1; i < FIRESHIRE_ZONE_DISTANCES.length; i++) {
        const ring = difference(
          featureCollection([buffers[i]!, buffers[i - 1]!])
        );
        if (ring) {
          zoneRings[i].push(ring as Feature<Polygon | MultiPolygon>);
        }
      }
    } catch (error) {
      // Skip invalid geometries
      console.warn('Skipping building with invalid geometry:', error);
      continue;
    }
  }

  // Union same-zone rings across buildings
  const zones = zoneRings.map((rings) => {
    if (rings.length === 0) {
      return featureCollection([]);
    }
    if (rings.length === 1) {
      return featureCollection(rings);
    }
    try {
      const merged = union(featureCollection(rings));
      if (!merged) {
        return featureCollection([]);
      }
      return featureCollection([merged as Feature<Polygon | MultiPolygon>]);
    } catch (error) {
      // Union failed, return individual features
      console.warn('Zone union failed, using individual features:', error);
      return featureCollection(rings);
    }
  }) as [
    FeatureCollection<Polygon | MultiPolygon>,
    FeatureCollection<Polygon | MultiPolygon>,
    FeatureCollection<Polygon | MultiPolygon>,
    FeatureCollection<Polygon | MultiPolygon>,
  ];

  // Cross-building subtraction: punch inner zones out of outer zones
  // so that each zone only covers its proper distance band from ALL structures.
  for (let i = 1; i < zones.length; i++) {
    for (let j = 0; j < i; j++) {
      if (zones[i].features.length > 0 && zones[j].features.length > 0) {
        try {
          const subtracted = difference(
            featureCollection([zones[i].features[0]!, zones[j].features[0]!])
          );
          zones[i] = subtracted
            ? featureCollection([subtracted as Feature<Polygon | MultiPolygon>])
            : featureCollection([]);
        } catch (error) {
          // Difference operation failed, keep original
          console.warn('Zone difference failed:', error);
        }
      }
    }
  }

  return {
    zone1: zones[0],
    zone2: zones[1],
    zone3: zones[2],
    zone4: zones[3],
  };
}

/**
 * Convert building zone rings to GeoJSON FeatureCollection for Mapbox rendering.
 * Each feature has a `zone` property for styling and distance information.
 */
export function buildingZonesToGeoJSON(
  zones: BuildingZoneResult
): FeatureCollection<Polygon | MultiPolygon> {
  const features = [];

  // Add zones in reverse order (outermost first) for proper rendering layering
  if (zones.zone4.features.length > 0) {
    features.push(...zones.zone4.features.map(f => ({
      ...f,
      properties: { ...f.properties, zone: "zone4", label: "Zone 4 (30-100ft)", distance: "30-100ft" }
    })));
  }
  
  if (zones.zone3.features.length > 0) {
    features.push(...zones.zone3.features.map(f => ({
      ...f,
      properties: { ...f.properties, zone: "zone3", label: "Zone 3 (10-30ft)", distance: "10-30ft" }
    })));
  }
  
  if (zones.zone2.features.length > 0) {
    features.push(...zones.zone2.features.map(f => ({
      ...f,
      properties: { ...f.properties, zone: "zone2", label: "Zone 2 (5-10ft)", distance: "5-10ft" }
    })));
  }
  
  if (zones.zone1.features.length > 0) {
    features.push(...zones.zone1.features.map(f => ({
      ...f,
      properties: { ...f.properties, zone: "zone1", label: "Zone 1 (0-5ft)", distance: "0-5ft" }
    })));
  }

  return featureCollection(features);
}
