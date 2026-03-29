import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, plans } from "@lwf/database";
import { eq, and } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** PUT /api/plans/[id] — update plan */
export async function PUT(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify plan ownership
  const [existing] = await db
    .select()
    .from(plans)
    .where(and(eq(plans.id, id), eq(plans.createdBy, user.id)));

  if (!existing) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (body.name !== undefined) updates.name = body.name;
  if (body.plantPlacements !== undefined)
    updates.plantPlacements = body.plantPlacements;
  if (body.estimatedCost !== undefined)
    updates.estimatedCost = body.estimatedCost;
  if (body.complianceScore !== undefined)
    updates.complianceScore = body.complianceScore;
  if (body.notes !== undefined) updates.notes = body.notes;
  if (body.status !== undefined) updates.status = body.status;

  const [updated] = await db
    .update(plans)
    .set(updates)
    .where(eq(plans.id, id))
    .returning();

  return NextResponse.json(updated);
}
