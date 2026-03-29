import { NextRequest, NextResponse } from "next/server";
import { db } from "@lwf/database";
import { nurseries, nurseryInventory } from "@lwf/database";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const lwfPlantId = searchParams.get("lwfPlantId");

    // Verify nursery exists
    const [nursery] = await db
      .select()
      .from(nurseries)
      .where(eq(nurseries.id, id));

    if (!nursery) {
      return NextResponse.json(
        { error: "Nursery not found" },
        { status: 404 }
      );
    }

    // Build query conditions
    const conditions = [eq(nurseryInventory.nurseryId, id)];
    if (lwfPlantId) {
      conditions.push(eq(nurseryInventory.lwfPlantId, lwfPlantId));
    }

    const inventory = await db
      .select()
      .from(nurseryInventory)
      .where(and(...conditions));

    return NextResponse.json({
      data: inventory,
      meta: {
        nurseryId: id,
        nurseryName: nursery.name,
        total: inventory.length,
        ...(lwfPlantId ? { filteredByLwfPlantId: lwfPlantId } : {}),
      },
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
