/**
 * Property Compliance Report API
 * 
 * Generates compliance reports for saved properties with their landscaping plans.
 */

import { NextRequest, NextResponse } from "next/server";
import { db, properties, plans } from "@lwf/database";
import { eq, desc } from "drizzle-orm";
import { generateComplianceReport } from "@/lib/compliance/generate-report";
import type { PlanPlant } from "@/lib/scoring/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const { propertyId } = params;

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    // Fetch property details
    const property = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (property.length === 0) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Fetch the most recent approved or submitted plan for this property
    const plan = await db
      .select()
      .from(plans)
      .where(eq(plans.propertyId, propertyId))
      .orderBy(desc(plans.updatedAt))
      .limit(1);

    if (plan.length === 0) {
      return NextResponse.json(
        { error: "No landscaping plan found for this property" },
        { status: 404 }
      );
    }

    const plantPlacements = plan[0].plantPlacements as any[];
    
    if (!plantPlacements || plantPlacements.length === 0) {
      return NextResponse.json(
        { error: "No plant placements found in the landscaping plan" },
        { status: 400 }
      );
    }

    // Convert plant placements to the format expected by the compliance generator
    const planPlants: PlanPlant[] = plantPlacements.map((placement: any) => ({
      plantId: placement.plantId || placement.id || 'unknown',
      plantName: placement.plantName || placement.name,
      zone: placement.zone || 'zone0', // Default to most restrictive zone
      characterScore: placement.characterScore || placement.fireScore || 50,
      placementCode: placement.placementCode || 'A',
      attributes: placement.attributes || {}
    }));

    // Generate compliance report
    const complianceReport = generateComplianceReport(
      property[0].address,
      planPlants
    );

    return NextResponse.json(complianceReport);

  } catch (error) {
    console.error("Error generating compliance report:", error);
    return NextResponse.json(
      { error: "Failed to generate compliance report" },
      { status: 500 }
    );
  }
}

// Export named exports for other HTTP methods if needed in the future
export async function POST() {
  return NextResponse.json(
    { error: "POST method not supported for compliance reports" },
    { status: 405 }
  );
}