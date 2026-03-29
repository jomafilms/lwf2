import { NextRequest, NextResponse } from "next/server";
import { db, nurseryInventory } from "@lwf/database";
import { requireAuth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

// PUT - update a single inventory item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    await requireAuth();
    const { id, itemId } = await params;
    const body = await request.json();

    const [updated] = await db
      .update(nurseryInventory)
      .set({
        botanicalName: body.botanicalName,
        commonName: body.commonName || null,
        price: body.price ?? null,
        containerSize: body.containerSize || null,
        availability: body.availability || null,
        lwfPlantId: body.lwfPlantId || null,
        lastUpdated: new Date(),
      })
      .where(
        and(
          eq(nurseryInventory.id, itemId),
          eq(nurseryInventory.nurseryId, id)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating inventory item:", error);
    return NextResponse.json(
      { error: "Failed to update inventory item" },
      { status: 500 }
    );
  }
}

// DELETE - remove a single inventory item
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    await requireAuth();
    const { id, itemId } = await params;

    const [deleted] = await db
      .delete(nurseryInventory)
      .where(
        and(
          eq(nurseryInventory.id, itemId),
          eq(nurseryInventory.nurseryId, id)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error deleting inventory item:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory item" },
      { status: 500 }
    );
  }
}
