/**
 * Maintenance API
 * 
 * GET /api/maintenance/[propertyId] - Generate maintenance schedule for a property's plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, plans, properties } from '@lwf/database';
import { eq, desc } from 'drizzle-orm';
import { generateMaintenanceSchedule } from '@/lib/maintenance/generate-schedule';
import type { PlanPlant } from '@/lib/scoring/types';

interface RouteContext {
  params: Promise<{ propertyId: string }>;
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  try {
    const { propertyId } = await ctx.params;

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Get the most recent plan for this property
    const plan = await db
      .select({
        id: plans.id,
        propertyId: plans.propertyId,
        plantPlacements: plans.plantPlacements,
        status: plans.status,
        createdAt: plans.createdAt,
      })
      .from(plans)
      .leftJoin(properties, eq(plans.propertyId, properties.id))
      .where(eq(plans.propertyId, propertyId))
      .orderBy(desc(plans.createdAt))
      .limit(1);

    if (!plan[0]) {
      return NextResponse.json(
        { error: 'No plan found for this property' },
        { status: 404 }
      );
    }

    const planData = plan[0];

    // Extract plant placements from the plan
    const plantPlacements = planData.plantPlacements as unknown;
    if (!plantPlacements || !Array.isArray(plantPlacements)) {
      return NextResponse.json(
        { error: 'No plant placements found in plan' },
        { status: 400 }
      );
    }

    // Convert plant placements to PlanPlant format
    const planPlants: PlanPlant[] = (plantPlacements as Array<unknown>).map((placement: any) => ({
      plantId: placement.plantId || placement.id || '',
      plantName: placement.plantName || placement.name || '',
      zone: placement.zone || 'zone2',
      characterScore: placement.characterScore || 50,
      placementCode: placement.placementCode || 'A',
      attributes: placement.attributes || {},
    }));

    // Generate the maintenance schedule
    const schedule = generateMaintenanceSchedule(planPlants, propertyId);

    return NextResponse.json({
      success: true,
      data: {
        schedule,
        planId: planData.id,
        planStatus: planData.status,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error generating maintenance schedule:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate maintenance schedule',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}