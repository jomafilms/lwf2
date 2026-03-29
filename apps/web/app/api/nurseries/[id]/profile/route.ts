import { NextRequest, NextResponse } from "next/server";
import { db } from "@lwf/database";
import { nurseries } from "@lwf/database";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Nursery name is required" },
        { status: 400 }
      );
    }

    // Update nursery profile
    const [updatedNursery] = await db
      .update(nurseries)
      .set({
        name: body.name.trim(),
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        state: body.state?.trim().toUpperCase() || null,
        zip: body.zip?.trim() || null,
        phone: body.phone?.trim() || null,
        email: body.email?.trim().toLowerCase() || null,
        website: body.website?.trim() || null,
        description: body.description?.trim() || null,
        isRetail: Boolean(body.isRetail),
        isWholesale: Boolean(body.isWholesale),
        servesLandscapers: Boolean(body.servesLandscapers),
      })
      .where(eq(nurseries.id, id))
      .returning();

    if (!updatedNursery) {
      return NextResponse.json(
        { error: "Nursery not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedNursery,
    });
  } catch (error) {
    console.error("Error updating nursery profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}