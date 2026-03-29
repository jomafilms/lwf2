import { NextRequest, NextResponse } from "next/server";
import { db, nurseryInventory } from "@lwf/database";
import { requireAuth } from "@/lib/auth";
import { eq, inArray, and } from "drizzle-orm";

// PUT - bulk update availability for multiple inventory items
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { itemIds, availability } = body;

    if (
      !Array.isArray(itemIds) ||
      itemIds.length === 0 ||
      !["in_stock", "limited", "out_of_stock", "seasonal"].includes(
        availability
      )
    ) {
      return NextResponse.json(
        { error: "Valid itemIds array and availability status required" },
        { status: 400 }
      );
    }

    const updated = await db
      .update(nurseryInventory)
      .set({
        availability,
        lastUpdated: new Date(),
      })
      .where(
        and(
          eq(nurseryInventory.nurseryId, id),
          inArray(nurseryInventory.id, itemIds)
        )
      )
      .returning();

    return NextResponse.json({ data: updated, count: updated.length });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error bulk updating inventory:", error);
    return NextResponse.json(
      { error: "Failed to bulk update inventory" },
      { status: 500 }
    );
  }
}
