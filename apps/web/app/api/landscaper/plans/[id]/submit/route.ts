import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getUserRole } from "@/lib/user-role";
import { db, plans } from "@lwf/database";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const role = await getUserRole(currentUser.id);
    
    if (role !== "landscaper") {
      return NextResponse.json(
        { error: "Unauthorized: Landscaper role required" },
        { status: 403 }
      );
    }

    const { id: planId } = await params;

    // Check if plan exists and belongs to this landscaper
    const plan = await db
      .select({
        id: plans.id,
        status: plans.status,
        createdBy: plans.createdBy,
      })
      .from(plans)
      .where(
        and(
          eq(plans.id, planId),
          eq(plans.createdBy, currentUser.id)
        )
      )
      .limit(1);

    if (plan.length === 0) {
      return NextResponse.json(
        { error: "Plan not found or access denied" },
        { status: 404 }
      );
    }

    const currentPlan = plan[0];

    if (currentPlan.status !== "draft") {
      return NextResponse.json(
        { error: `Plan cannot be submitted. Current status: ${currentPlan.status}` },
        { status: 400 }
      );
    }

    // Update plan status to submitted
    const updatedPlan = await db
      .update(plans)
      .set({
        status: "submitted",
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(plans.id, planId))
      .returning();

    return NextResponse.json({
      message: "Plan submitted successfully",
      plan: updatedPlan[0],
    });
  } catch (error) {
    console.error("Error submitting plan:", error);
    return NextResponse.json(
      { error: "Failed to submit plan" },
      { status: 500 }
    );
  }
}