/**
 * Building Footprints API — OSM Overpass
 *
 * Queries OpenStreetMap via the Overpass API for building footprints
 * within a bounding box. Returns the same GeoJSON FeatureCollection
 * format as the Ashland GIS route so callers are source-agnostic.
 */

import { NextRequest, NextResponse } from 'next/server';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const TIMEOUT_S = 15;

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  nodes?: number[];
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

/**
 * Assemble Overpass nodes + ways into GeoJSON Polygon features.
 * Overpass returns nodes (with lat/lon) separately from ways (with node ID refs).
 */
function overpassToGeoJSON(elements: OverpassElement[]) {
  // Build node lookup: id → [lng, lat]
  const nodes = new Map<number, [number, number]>();
  for (const el of elements) {
    if (el.type === 'node' && el.lat != null && el.lon != null) {
      nodes.set(el.id, [el.lon, el.lat]);
    }
  }

  const features: Array<{
    type: 'Feature';
    properties: Record<string, string>;
    geometry: { type: 'Polygon'; coordinates: [number, number][][] };
  }> = [];

  for (const el of elements) {
    if (el.type !== 'way' || !el.nodes || el.nodes.length < 4) continue;

    // Resolve node refs to coordinates
    const coords: [number, number][] = [];
    let valid = true;
    for (const nodeId of el.nodes) {
      const coord = nodes.get(nodeId);
      if (!coord) { valid = false; break; }
      coords.push(coord);
    }
    if (!valid || coords.length < 4) continue;

    features.push({
      type: 'Feature',
      properties: {
        ...(el.tags?.name ? { name: el.tags.name } : {}),
        ...(el.tags?.building ? { building: el.tags.building } : {}),
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coords],
      },
    });
  }

  return {
    type: 'FeatureCollection' as const,
    features,
  };
}

/**
 * GET /api/buildings/overpass?xmin=&ymin=&xmax=&ymax=
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const xmin = parseFloat(searchParams.get('xmin') || '');
  const ymin = parseFloat(searchParams.get('ymin') || '');
  const xmax = parseFloat(searchParams.get('xmax') || '');
  const ymax = parseFloat(searchParams.get('ymax') || '');

  if (isNaN(xmin) || isNaN(ymin) || isNaN(xmax) || isNaN(ymax)) {
    return NextResponse.json(
      { error: 'Missing or invalid bbox parameters: xmin, ymin, xmax, ymax required' },
      { status: 400 },
    );
  }

  // Overpass bbox format: south,west,north,east
  const bbox = `${ymin},${xmin},${ymax},${xmax}`;
  const query = `[out:json][timeout:${TIMEOUT_S}];way["building"](${bbox});(._;>;);out body;`;

  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(TIMEOUT_S * 1000 + 5000),
    });

    if (res.status === 429) {
      return NextResponse.json(
        { error: 'Overpass API rate limited — try again in a few seconds' },
        { status: 429 },
      );
    }

    if (!res.ok) {
      throw new Error(`Overpass API responded with ${res.status}: ${res.statusText}`);
    }

    const data: OverpassResponse = await res.json();
    const geojson = overpassToGeoJSON(data.elements);

    return NextResponse.json(geojson);
  } catch (error) {
    console.error('Overpass API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch building data from OpenStreetMap',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
