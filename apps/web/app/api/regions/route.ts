import { NextResponse } from 'next/server';
import { getSupportedCounties } from '@/lib/regional/counties';

/**
 * GET /api/regions
 * 
 * Returns information about supported regions/counties.
 * Used for admin interfaces and regional feature detection.
 * 
 * Example response:
 * {
 *   "counties": [
 *     {
 *       "key": "jackson-county-or",
 *       "name": "Jackson County, OR",
 *       "gis": { "baseUrl": "...", ... },
 *       "resources": { "cwppUrl": "...", ... }
 *     }
 *   ]
 * }
 */
export async function GET() {
  try {
    const counties = getSupportedCounties();
    
    return NextResponse.json({
      counties: counties.map(({ key, config }) => ({
        key,
        name: `${config.name}, ${config.state}`,
        ...config
      }))
    });
  } catch (error) {
    console.error('Failed to get regions:', error);
    return NextResponse.json(
      { error: 'Failed to get regions' },
      { status: 500 }
    );
  }
}