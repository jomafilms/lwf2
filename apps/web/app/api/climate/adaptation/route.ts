import { NextRequest, NextResponse } from 'next/server';
import { assessClimateAdaptation } from '@/lib/climate/adaptation-service';

/**
 * POST /api/climate/adaptation
 * 
 * Assess climate adaptation for a plant species at a location.
 * 
 * Body:
 * {
 *   "plantId": "plant-123",
 *   "location": { "lat": 42.3, "lng": -122.8 },
 *   "scenario": "moderate"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plantId, location, scenario = 'moderate' } = body;

    // Validate required parameters
    if (!plantId) {
      return NextResponse.json(
        { error: 'plantId is required' },
        { status: 400 }
      );
    }

    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return NextResponse.json(
        { error: 'location with lat and lng is required' },
        { status: 400 }
      );
    }

    // Validate scenario
    const validScenarios = ['optimistic', 'moderate', 'pessimistic'];
    if (!validScenarios.includes(scenario)) {
      return NextResponse.json(
        { error: 'scenario must be one of: optimistic, moderate, pessimistic' },
        { status: 400 }
      );
    }

    // Assess climate adaptation
    const adaptation = await assessClimateAdaptation(plantId, location, scenario);
    
    if (!adaptation) {
      return NextResponse.json(
        { error: 'Could not assess climate adaptation for this plant' },
        { status: 404 }
      );
    }

    return NextResponse.json(adaptation);
  } catch (error) {
    console.error('Climate adaptation API error:', error);
    return NextResponse.json(
      { error: 'Failed to assess climate adaptation' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/climate/adaptation?region=pacific-northwest&scenario=moderate
 * 
 * Get general climate adaptation info for a region
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const region = searchParams.get('region') || 'pacific-northwest';
  const scenario = searchParams.get('scenario') || 'moderate';

  try {
    // Return general climate info for the region
    const climateInfo = {
      region: 'Pacific Northwest',
      scenario,
      generalTrends: [
        'Average temperatures increasing 2-4°F by 2050',
        'Summer precipitation decreasing 10-30%',
        'Increased frequency of extreme heat events',
        'Earlier snowmelt and longer dry seasons',
        'Increased wildfire risk and severity'
      ],
      adaptationPriorities: [
        'Select drought-tolerant species',
        'Improve water retention in soils',
        'Create defensible space for fire safety',
        'Plan for extended dry periods',
        'Consider native and adapted species'
      ],
      timeframes: {
        '5-year': 'Moderate changes, plan adaptation strategies',
        '10-year': 'Noticeable impacts, implement resilience measures',
        '20-year': 'Significant changes, major adaptation needed'
      }
    };

    return NextResponse.json(climateInfo);
  } catch (error) {
    console.error('Climate info API error:', error);
    return NextResponse.json(
      { error: 'Failed to get climate information' },
      { status: 500 }
    );
  }
}