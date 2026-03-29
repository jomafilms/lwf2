/**
 * Cost Estimation API
 * 
 * GET /api/cost/[propertyId]?budgetTier=starter|standard|comprehensive
 * 
 * Calculates cost estimate for a property's plan using nursery pricing data.
 */

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "../../../../../packages/database";
import { properties, plans, nurseryInventory, nurseries } from "../../../../../packages/database/schema";
import { estimateCost, type NurseryPricing, type PropertyZoneData } from "../../../lib/cost/estimate";
import type { PlanPlant } from "../../../lib/scoring/types";

type BudgetTier = 'starter' | 'standard' | 'comprehensive';

// ─── Helper Functions ────────────────────────────────────────────────────────

function calculateZoneAreas(fireZones: any): PropertyZoneData {
  // Default fallback areas if zones not available
  let zone0Area = 500;  // sq ft
  let zone1Area = 1000;
  let zone2Area = 1500;
  let structureCount = 1;
  
  if (fireZones && typeof fireZones === 'object') {
    // Try to extract areas from zone GeoJSON features
    const zones = fireZones.features || [fireZones];
    
    for (const zone of zones) {
      if (zone.properties?.zone === '0' || zone.properties?.type === 'zone0') {
        zone0Area = zone.properties?.area || 500;
      } else if (zone.properties?.zone === '1' || zone.properties?.type === 'zone1') {
        zone1Area = zone.properties?.area || 1000;
      } else if (zone.properties?.zone === '2' || zone.properties?.type === 'zone2') {
        zone2Area = zone.properties?.area || 1500;
      }
    }
    
    // Count structures from structure footprints if available
    if (fireZones.structures && Array.isArray(fireZones.structures)) {
      structureCount = Math.max(1, fireZones.structures.length);
    }
  }
  
  return {
    zone0Area,
    zone1Area,
    zone2Area,
    totalArea: zone0Area + zone1Area + zone2Area,
    structureCount,
  };
}

async function fetchNurseryPricing(): Promise<NurseryPricing[]> {
  try {
    const inventory = await db
      .select({
        nurseryId: nurseryInventory.nurseryId,
        nurseryName: nurseries.name,
        plantId: nurseryInventory.lwfPlantId,
        botanicalName: nurseryInventory.botanicalName,
        commonName: nurseryInventory.commonName,
        price: nurseryInventory.price,
        containerSize: nurseryInventory.containerSize,
        availability: nurseryInventory.availability,
      })
      .from(nurseryInventory)
      .leftJoin(nurseries, eq(nurseryInventory.nurseryId, nurseries.id))
      .where(eq(nurseryInventory.availability, 'in_stock'));
    
    return inventory
      .filter(item => item.price && item.price > 0)
      .map(item => ({
        nurseryId: item.nurseryId || '',
        nurseryName: item.nurseryName || 'Unknown Nursery',
        plantId: item.plantId || '',
        botanicalName: item.botanicalName || '',
        commonName: item.commonName || '',
        price: item.price || 0,
        containerSize: item.containerSize || '1-gallon',
        availability: item.availability as 'in_stock' | 'limited' | 'out_of_stock' | 'seasonal',
      }));
  } catch (error) {
    console.error('Failed to fetch nursery pricing:', error);
    return [];
  }
}

// ─── Route Handler ───────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    const { searchParams } = new URL(request.url);
    const budgetTier = searchParams.get('budgetTier') as BudgetTier | null;
    
    // Validate budget tier parameter
    if (budgetTier && !['starter', 'standard', 'comprehensive'].includes(budgetTier)) {
      return NextResponse.json(
        { error: 'Invalid budgetTier. Must be starter, standard, or comprehensive.' },
        { status: 400 }
      );
    }
    
    // Fetch property and its plans
    const property = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);
      
    if (property.length === 0) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }
    
    // Get the most recent plan for this property
    const planData = await db
      .select()
      .from(plans)
      .where(eq(plans.propertyId, propertyId))
      .orderBy(plans.createdAt)
      .limit(1);
    
    if (planData.length === 0) {
      return NextResponse.json(
        { error: 'No landscape plan found for this property' },
        { status: 404 }
      );
    }
    
    const plan = planData[0];
    const plantPlacements = plan.plantPlacements as PlanPlant[] | null;
    
    if (!plantPlacements || plantPlacements.length === 0) {
      return NextResponse.json({
        plants: [],
        plantTotal: 0,
        laborEstimate: { min: 0, max: 0 },
        materialsEstimate: { min: 0, max: 0 },
        totalEstimate: { min: 0, max: 0 },
        budgetTier: budgetTier || 'starter',
        message: 'No plants in plan yet'
      });
    }
    
    // Calculate zone areas from fire zones data
    const zoneData = calculateZoneAreas(property[0].fireZones);
    
    // Fetch current nursery pricing
    const nurseryPricing = await fetchNurseryPricing();
    
    // Calculate cost estimate
    const costEstimate = estimateCost(
      plantPlacements,
      zoneData,
      nurseryPricing,
      budgetTier || undefined
    );
    
    return NextResponse.json(costEstimate);
    
  } catch (error) {
    console.error('Cost estimation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}