import { NextRequest, NextResponse } from "next/server";
import { db, plans, properties } from "@lwf/database";
import { eq } from "drizzle-orm";
import {
  buildPlanDocument,
  type PlantPlacement,
} from "@/lib/plans/build-document";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** GET /api/plans/[id]/document — returns JSON data for plan document */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;

  // Fetch plan
  const [plan] = await db.select().from(plans).where(eq(plans.id, id));

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  // Fetch property
  const [property] = plan.propertyId
    ? await db
        .select()
        .from(properties)
        .where(eq(properties.id, plan.propertyId))
    : [null];

  if (!property) {
    return NextResponse.json(
      { error: "Property not found" },
      { status: 404 }
    );
  }

  // Parse plant placements
  const plantPlacements = Array.isArray(plan.plantPlacements)
    ? (plan.plantPlacements as PlantPlacement[])
    : [];

  if (plantPlacements.length === 0) {
    return NextResponse.json(
      { error: "Plan has no plant placements" },
      { status: 400 }
    );
  }

  try {
    const documentData = await buildPlanDocument({
      planId: plan.id,
      planName: plan.name ?? "Untitled Plan",
      propertyAddress: property.address,
      plantPlacements,
    });

    return NextResponse.json(documentData);
  } catch (error) {
    console.error("Failed to build plan document:", error);
    return NextResponse.json(
      { error: "Failed to generate document" },
      { status: 500 }
    );
  }
}
