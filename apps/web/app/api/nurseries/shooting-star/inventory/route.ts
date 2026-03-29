import { NextRequest, NextResponse } from 'next/server';
import { processShootingStarInventory, getFeaturedFireSafePlants } from '@/lib/data/shooting-star-integration';

/**
 * GET /api/nurseries/shooting-star/inventory?featured=true
 * 
 * Returns processed Shooting Star nursery inventory with fire safety data.
 * Real inventory levels from their website, enhanced with LWF plant database.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const featuredOnly = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    let plants;
    
    if (featuredOnly) {
      plants = await getFeaturedFireSafePlants();
    } else {
      plants = await processShootingStarInventory();
    }

    // Apply limit
    const limitedPlants = plants.slice(0, limit);

    return NextResponse.json({
      nursery: {
        name: "Shooting Star Nursery",
        location: "Central Point, OR",
        website: "https://roguevalleynursery.com",
        totalPlants: plants.length,
        inStock: plants.filter(p => p.sizes.some(s => s.status === 'in-stock')).length,
        lastUpdated: "2026-03-28"
      },
      plants: limitedPlants,
      meta: {
        total: plants.length,
        returned: limitedPlants.length,
        featured: featuredOnly
      }
    });
  } catch (error) {
    console.error('Shooting Star inventory error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load nursery inventory',
        nursery: {
          name: "Shooting Star Nursery",
          error: true
        },
        plants: []
      },
      { status: 500 }
    );
  }
}