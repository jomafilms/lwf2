import { NextRequest, NextResponse } from "next/server";
import { db } from "@lwf/database";
import { nurseries, nurseryInventory } from "@lwf/database";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const inventory = await db
      .select()
      .from(nurseryInventory)
      .where(eq(nurseryInventory.nurseryId, id));

    return NextResponse.json({
      data: {
        ...nursery,
        inventory,
        inventoryCount: inventory.length,
      },
    });
  } catch (error) {
    console.error("Error fetching nursery:", error);
    return NextResponse.json(
      { error: "Failed to fetch nursery" },
      { status: 500 }
    );
  }
}
