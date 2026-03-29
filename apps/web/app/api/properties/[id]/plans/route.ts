import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, properties, plans } from "@lwf/database";
import { eq, and } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** POST /api/properties/[id]/plans — create plan for property */
export async function POST(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify property ownership
  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.ownerId, user.id)));

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, plantPlacements, estimatedCost, readinessScore, notes } = body;

  const [plan] = await db
    .insert(plans)
    .values({
      propertyId: id,
      createdBy: user.id,
      name: name ?? "Untitled Plan",
      plantPlacements: plantPlacements ?? null,
      estimatedCost: estimatedCost ?? null,
      readinessScore: readinessScore ?? null,
      notes: notes ?? null,
    })
    .returning();

  return NextResponse.json(plan, { status: 201 });
}

/** GET /api/properties/[id]/plans — list plans for property */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify property ownership
  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.ownerId, user.id)));

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const rows = await db
    .select()
    .from(plans)
    .where(eq(plans.propertyId, id));

  return NextResponse.json(rows);
}
