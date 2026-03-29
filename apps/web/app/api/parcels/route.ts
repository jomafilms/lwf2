import { NextRequest, NextResponse } from 'next/server';
import { ParcelService } from '@/lib/regional/parcel-service';

/**
 * GET /api/parcels?lat={lat}&lng={lng}
 * 
 * Look up parcel boundary and property information by coordinates.
 * This endpoint abstracts county-specific GIS APIs into a common interface.
 * 
 * Example response:
 * {
 *   "found": true,
 *   "parcel": {
 *     "boundary": [[[lng1, lat1], [lng2, lat2], ...]], 
 *     "address": "123 Main St",
 *     "acreage": 0.25,
 *     "accountNumber": "R123456",
 *     "county": "jackson-county-or"
 *   }
 * }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  // Validate required parameters
  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'lat and lng parameters are required' },
      { status: 400 }
    );
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  // Validate coordinate ranges
  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      { error: 'lat and lng must be valid numbers' },
      { status: 400 }
    );
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json(
      { error: 'Invalid coordinate ranges' },
      { status: 400 }
    );
  }

  try {
    const result = await ParcelService.lookupParcel(latitude, longitude);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Parcel lookup error:', error);
    return NextResponse.json(
      { 
        found: false,
        error: 'Internal server error during parcel lookup'
      },
      { status: 500 }
    );
  }
}