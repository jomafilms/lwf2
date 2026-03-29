import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getUserRole } from "@/lib/user-role";
import { db, landscaperClients, properties, user } from "@lwf/database";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const role = await getUserRole(currentUser.id);
    
    if (role !== "landscaper") {
      return NextResponse.json(
        { error: "Unauthorized: Landscaper role required" },
        { status: 403 }
      );
    }

    const clients = await db
      .select({
        id: properties.id,
        address: properties.address,
        lat: properties.lat,
        lng: properties.lng,
        fireZones: properties.fireZones,
        ownerName: user.name,
        ownerEmail: user.email,
        status: landscaperClients.status,
        notes: landscaperClients.notes,
        clientSince: landscaperClients.createdAt,
      })
      .from(landscaperClients)
      .innerJoin(properties, eq(landscaperClients.propertyId, properties.id))
      .innerJoin(user, eq(properties.ownerId, user.id))
      .where(eq(landscaperClients.landscaperId, currentUser.id))
      .orderBy(desc(landscaperClients.createdAt));

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Error fetching landscaper clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const role = await getUserRole(currentUser.id);
    
    if (role !== "landscaper") {
      return NextResponse.json(
        { error: "Unauthorized: Landscaper role required" },
        { status: 403 }
      );
    }

    const { propertyId, notes } = await request.json();

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    // Check if property exists
    const property = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (property.length === 0) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Check if client relationship already exists
    const existing = await db
      .select({ id: landscaperClients.id })
      .from(landscaperClients)
      .where(
        eq(landscaperClients.landscaperId, currentUser.id) &&
        eq(landscaperClients.propertyId, propertyId)
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Client relationship already exists" },
        { status: 409 }
      );
    }

    // Create client relationship
    const result = await db
      .insert(landscaperClients)
      .values({
        landscaperId: currentUser.id,
        propertyId,
        notes: notes || null,
      })
      .returning();

    return NextResponse.json({ 
      message: "Client added successfully",
      client: result[0] 
    });
  } catch (error) {
    console.error("Error adding landscaper client:", error);
    return NextResponse.json(
      { error: "Failed to add client" },
      { status: 500 }
    );
  }
}