/**
 * Building Footprint Service - Ashland GIS Integration
 * 
 * Adapted from Fireshire project (MIT License) by Robert Head
 * https://github.com/robert-fireshire/fireshire
 * 
 * Client-side service to fetch building footprints for fire-reluctant zone computation.
 */

import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson';

export interface BuildingFootprintResponse {
  success: boolean;
  buildings?: FeatureCollection<Polygon | MultiPolygon>;
  error?: string;
}

export interface BoundingBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

/**
 * Fetch building footprints from Ashland GIS within a bounding box
 */
export async function fetchBuildingFootprints(bbox: BoundingBox): Promise<BuildingFootprintResponse> {
  try {
    const params = new URLSearchParams({
      xmin: bbox.xmin.toString(),
      ymin: bbox.ymin.toString(),
      xmax: bbox.xmax.toString(),
      ymax: bbox.ymax.toString(),
    });

    const response = await fetch(`/api/buildings?${params}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const buildings: FeatureCollection<Polygon | MultiPolygon> = await response.json();
    
    return {
      success: true,
      buildings,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Get bounding box for a set of coordinates (used for parcel boundaries)
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
 * Get bounding box with buffer for parcel boundary coordinates
 * Useful for finding buildings near parcel edges
 */
export function getBufferedBoundingBox(
  coordinates: [number, number][], 
  bufferFeet: number = 200
): BoundingBox {
  const bbox = getBoundingBox(coordinates);
  
  // Convert feet to degrees (rough approximation for Oregon)
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