import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, properties, plans } from "@lwf/database";
import { eq, and } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** GET /api/properties/[id] — get single property with its plans */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.ownerId, user.id)));

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const propertyPlans = await db
    .select()
    .from(plans)
    .where(eq(plans.propertyId, id));

  return NextResponse.json({ ...property, plans: propertyPlans });
}

/** DELETE /api/properties/[id] — delete (owner only) */
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.ownerId, user.id)));

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(properties).where(eq(properties.id, id));

  return NextResponse.json({ success: true });
}
