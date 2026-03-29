/**
 * Cost Estimation API
 * 
 * GET /api/cost/[propertyId]?budgetTier=starter|standard|comprehensive
 */

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, properties, plans } from "@lwf/database";
import { estimateCost, type NurseryPricing, type PropertyZoneData } from "../../../../lib/cost/estimate";
import type { PlanPlant } from "../../../../lib/scoring/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    const { searchParams } = new URL(request.url);
    const budgetTier = searchParams.get('budgetTier') as 'starter' | 'standard' | 'comprehensive' | null;
    
    // Fetch property and plans
    const property = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);
      
    if (property.length === 0) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    const planData = await db
      .select()
      .from(plans)
      .where(eq(plans.propertyId, propertyId))
      .orderBy(plans.createdAt)
      .limit(1);
    
    const plants: PlanPlant[] = planData[0]?.plantPlacements as PlanPlant[] || [];
    const nurseryPricing: NurseryPricing[] = [];
    
    const zoneData: PropertyZoneData = {
      zone0Area: 500,
      zone1Area: 1000,
      zone2Area: 1500,
      totalArea: 3000,
      structureCount: 1,
    };
    
    const estimate = estimateCost(plants, zoneData, nurseryPricing, budgetTier || undefined);
    
    return NextResponse.json(estimate);
    
  } catch (error) {
    console.error('Cost estimation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}