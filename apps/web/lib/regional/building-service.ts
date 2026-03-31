/**
 * Building Footprint Service — Hybrid Source Routing
 *
 * Fetches building footprints from the best available source:
 *   - Ashland GIS for addresses within Ashland city limits (high-quality official data)
 *   - OSM Overpass for everywhere else (global coverage)
 *
 * Adapted from Fireshire project (MIT License) by Robert Head
 * https://github.com/robert-fireshire/fireshire
 */

import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson';

export type BuildingSource = 'ashland-gis' | 'overpass';

export interface BuildingFootprintResponse {
  success: boolean;
  buildings?: FeatureCollection<Polygon | MultiPolygon>;
  source?: BuildingSource;
  error?: string;
}

export interface BoundingBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

// Ashland, OR city limits (approximate bounding box)
const ASHLAND_BOUNDS = {
  latMin: 42.17,
  latMax: 42.22,
  lngMin: -122.73,
  lngMax: -122.66,
};

/**
 * Detect which building data source to use based on coordinates.
 * Ashland GIS has higher-quality official building data for its coverage area.
 */
export function detectBuildingSource(lat: number, lng: number): BuildingSource {
  if (
    lat >= ASHLAND_BOUNDS.latMin &&
    lat <= ASHLAND_BOUNDS.latMax &&
    lng >= ASHLAND_BOUNDS.lngMin &&
    lng <= ASHLAND_BOUNDS.lngMax
  ) {
    return 'ashland-gis';
  }
  return 'overpass';
}

/**
 * Fetch building footprints from the appropriate source.
 */
export async function fetchBuildingFootprints(
  bbox: BoundingBox,
  source: BuildingSource = 'ashland-gis',
): Promise<BuildingFootprintResponse> {
  const endpoint = source === 'ashland-gis' ? '/api/buildings' : '/api/buildings/overpass';

  try {
    const params = new URLSearchParams({
      xmin: bbox.xmin.toString(),
      ymin: bbox.ymin.toString(),
      xmax: bbox.xmax.toString(),
      ymax: bbox.ymax.toString(),
    });

    const response = await fetch(`${endpoint}?${params}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return {
        success: false,
        source,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const buildings: FeatureCollection<Polygon | MultiPolygon> = await response.json();

    return { success: true, buildings, source };
  } catch (error) {
    return {
      success: false,
      source,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Get bounding box for a set of coordinates
 */
export function getBoundingBox(coordinates: [number, number][]): BoundingBox {
  if (coordinates.length === 0) {
    throw new Error('Cannot create bounding box from empty coordinates');
  }

  let xmin = Infinity;
  let ymin = Infinity;
  let xmax = -Infinity;
  let ymax = -Infinity;

  for (const [lng, lat] of coordinates) {
    if (lng < xmin) xmin = lng;
    if (lat < ymin) ymin = lat;
    if (lng > xmax) xmax = lng;
    if (lat > ymax) ymax = lat;
  }

  return { xmin, ymin, xmax, ymax };
}

/**
 * Get bounding box with buffer — useful for finding buildings near parcel edges.
 * Default 200ft buffer. Approximation valid for mid-latitudes (~42N).
 */
export function getBufferedBoundingBox(
  coordinates: [number, number][],
  bufferFeet: number = 200,
): BoundingBox {
  const bbox = getBoundingBox(coordinates);

  // 1 degree lat ≈ 364,000 ft, 1 degree lng ≈ 271,000 ft at 42N
  const latBuffer = bufferFeet / 364_000;
  const lngBuffer = bufferFeet / 271_000;

  return {
    xmin: bbox.xmin - lngBuffer,
    ymin: bbox.ymin - latBuffer,
    xmax: bbox.xmax + lngBuffer,
    ymax: bbox.ymax + latBuffer,
  };
}
