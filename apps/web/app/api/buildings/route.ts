/**
 * Building Footprints API - Ashland GIS Integration
 * 
 * Adapted from Fireshire project (MIT License) by Robert Head
 * https://github.com/robert-fireshire/fireshire
 * 
 * Queries Ashland GIS for building footprints within a bounding box.
 * Returns GeoJSON FeatureCollection for use in fire-reluctant zone calculations.
 */

import { NextRequest, NextResponse } from 'next/server';

const GIS_BASE_URL = 'https://gis.ashland.or.us';
const BUILDINGS_ENDPOINT = '/arcgis/rest/services/buildings/MapServer/0/query';
const BUILDING_FIELDS = 'OBJECTID,Bldg_name,BLDG_CLASS,ELEVATION,Floors,YR_BLT,SqFT,OCC_CODE';

// 100 feet buffer in degrees (approximate at Ashland's latitude ~42N)
// 1 degree lat ≈ 364,000 ft, 1 degree lng ≈ 271,000 ft at 42N
const BUFFER_FT = 10;
const LAT_BUFFER = BUFFER_FT / 364_000;
const LNG_BUFFER = BUFFER_FT / 271_000;

interface EsriFeature {
  attributes: Record<string, any>;
  geometry: {
    rings: number[][][];
  };
}

interface EsriResponse {
  features?: EsriFeature[];
  exceededTransferLimit?: boolean;
}

/**
 * Convert Esri JSON feature to GeoJSON Feature
 */
function esriToGeoJsonFeature(feature: EsriFeature) {
  const rings = feature.geometry?.rings || [];
  return {
    type: 'Feature' as const,
    properties: feature.attributes || {},
    geometry: {
      type: 'Polygon' as const,
      coordinates: rings,
    },
  };
}

/**
 * Query Ashland GIS for building footprints
 * GET /api/buildings?xmin=-122.7&ymin=42.18&xmax=-122.69&ymax=42.19
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const xmin = parseFloat(searchParams.get('xmin') || '');
  const ymin = parseFloat(searchParams.get('ymin') || '');
  const xmax = parseFloat(searchParams.get('xmax') || '');
  const ymax = parseFloat(searchParams.get('ymax') || '');

  // Validate required parameters
  if (isNaN(xmin) || isNaN(ymin) || isNaN(xmax) || isNaN(ymax)) {
    return NextResponse.json(
      { error: 'Missing or invalid bbox parameters: xmin, ymin, xmax, ymax required' },
      { status: 400 }
    );
  }

  try {
    // Expand bbox by buffer to catch buildings near edges
    const envelope = {
      xmin: xmin - LNG_BUFFER,
      ymin: ymin - LAT_BUFFER,
      xmax: xmax + LNG_BUFFER,
      ymax: ymax + LAT_BUFFER,
    };

    const allFeatures: any[] = [];
    let offset = 0;
    const pageSize = 2000;

    // Handle pagination for large result sets
    while (true) {
      const params = new URLSearchParams({
        geometry: `${envelope.xmin},${envelope.ymin},${envelope.xmax},${envelope.ymax}`,
        geometryType: 'esriGeometryEnvelope',
        inSR: '4326',
        spatialRel: 'esriSpatialRelIntersects',
        outFields: BUILDING_FIELDS,
        outSR: '4326',
        f: 'json',
        resultOffset: offset.toString(),
        resultRecordCount: pageSize.toString(),
      });

      const response = await fetch(`${GIS_BASE_URL}${BUILDINGS_ENDPOINT}?${params}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`GIS API responded with ${response.status}: ${response.statusText}`);
      }

      const data: EsriResponse = await response.json();
      
      if (!data.features) {
        break;
      }

      // Convert Esri features to GeoJSON
      const geoJsonFeatures = data.features.map(esriToGeoJsonFeature);
      allFeatures.push(...geoJsonFeatures);

      // Check if we need to fetch more pages
      if (data.exceededTransferLimit && data.features.length === pageSize) {
        offset += pageSize;
      } else {
        break;
      }
    }

    const featureCollection = {
      type: 'FeatureCollection' as const,
      features: allFeatures,
    };

    return NextResponse.json(featureCollection);

  } catch (error) {
    console.error('Building footprints API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch building data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}