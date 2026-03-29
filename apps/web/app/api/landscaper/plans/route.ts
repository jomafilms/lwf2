import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getUserRole } from "@/lib/user-role";
import { db, plans, properties } from "@lwf/database";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const role = await getUserRole(currentUser.id);
    
    if (role !== "landscaper") {
      return NextResponse.json(
        { error: "Unauthorized: Landscaper role required" },
        { status: 403 }
      );
    }

    const landscaperPlans = await db
      .select({
        id: plans.id,
        name: plans.name,
        status: plans.status,
        propertyId: plans.propertyId,
        propertyAddress: properties.address,
        complianceScore: plans.complianceScore,
        estimatedCost: plans.estimatedCost,
        plantPlacements: plans.plantPlacements,
        notes: plans.notes,
        createdAt: plans.createdAt,
        submittedAt: plans.submittedAt,
        updatedAt: plans.updatedAt,
      })
      .from(plans)
      .innerJoin(properties, eq(plans.propertyId, properties.id))
      .where(eq(plans.createdBy, currentUser.id))
      .orderBy(desc(plans.createdAt));

    return NextResponse.json({ plans: landscaperPlans });
  } catch (error) {
    console.error("Error fetching landscaper plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}