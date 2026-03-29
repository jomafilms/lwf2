import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, properties } from "@lwf/database";
import { eq, and } from "drizzle-orm";
import type { AssessmentData } from "@/components/assessment/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** POST /api/properties/[id]/assessment — save assessment data */
export async function POST(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const assessmentData: AssessmentData = await req.json();
    
    // Verify user owns this property
    const [property] = await db
      .select()
      .from(properties)
      .where(and(eq(properties.id, id), eq(properties.ownerId, user.id)));

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Update property with assessment data
    await db
      .update(properties)
      .set({
        assessment: assessmentData as unknown as Record<string, unknown>,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, id));

    return NextResponse.json({ 
      success: true,
      message: "Assessment saved successfully" 
    });

  } catch (error) {
    console.error("Failed to save assessment:", error);
    return NextResponse.json(
      { error: "Failed to save assessment" }, 
      { status: 500 }
    );
  }
}

/** GET /api/properties/[id]/assessment — retrieve assessment data */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [property] = await db
      .select({ assessment: properties.assessment })
      .from(properties)
      .where(and(eq(properties.id, id), eq(properties.ownerId, user.id)));

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json(property.assessment || null);

  } catch (error) {
    console.error("Failed to fetch assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" }, 
      { status: 500 }
    );
  }
}