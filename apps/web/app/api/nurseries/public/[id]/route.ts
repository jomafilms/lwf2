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

    // Fetch nursery data
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

    // Fetch inventory (only in-stock and limited items for public view)
    const inventory = await db
      .select({
        id: nurseryInventory.id,
        botanicalName: nurseryInventory.botanicalName,
        commonName: nurseryInventory.commonName,
        price: nurseryInventory.price,
        containerSize: nurseryInventory.containerSize,
        availability: nurseryInventory.availability,
        lwfPlantId: nurseryInventory.lwfPlantId,
        lastUpdated: nurseryInventory.lastUpdated,
      })
      .from(nurseryInventory)
      .where(eq(nurseryInventory.nurseryId, id));

    // Return public-safe data only
    const publicNurseryData = {
      id: nursery.id,
      name: nursery.name,
      address: nursery.address,
      city: nursery.city,
      state: nursery.state,
      zip: nursery.zip,
      phone: nursery.phone,
      email: nursery.email,
      website: nursery.website,
      description: nursery.description,
      isRetail: nursery.isRetail,
      isWholesale: nursery.isWholesale,
      servesLandscapers: nursery.servesLandscapers,
      inventory,
    };

    return NextResponse.json({
      data: publicNurseryData,
    });
  } catch (error) {
    console.error("Error fetching public nursery data:", error);
    return NextResponse.json(
      { error: "Failed to fetch nursery data" },
      { status: 500 }
    );
  }
}