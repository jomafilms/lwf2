/**
 * Sources API Route
 * 
 * Proxy to LWF API sources endpoint for client-side access
 */

import { NextRequest } from 'next/server';
import { getSources } from '@/lib/api/lwf';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    const params = {
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
      region: searchParams.get('region') || undefined,
    };

    const sources = await getSources(params);
    
    return Response.json(sources);
  } catch (error) {
    console.error('Failed to fetch sources:', error);
    return Response.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}