import buffer from "@turf/buffer";
import difference from "@turf/difference";
import { polygon, featureCollection } from "@turf/helpers";
import { ZONE_COLORS } from "@/lib/design-tokens";
import type { Feature, Polygon, FeatureCollection } from "geojson";

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
