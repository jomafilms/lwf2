import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, properties } from "@lwf/database";
import { eq, desc } from "drizzle-orm";

/** POST /api/properties — create a new property */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { address, lat, lng, parcelBoundary, structureFootprints, fireZones } =
    body;

  if (!address || lat == null || lng == null) {
    return NextResponse.json(
      { error: "address, lat, and lng are required" },
      { status: 400 }
    );
  }

  const [property] = await db
    .insert(properties)
    .values({
      ownerId: user.id,
      address,
      lat,
      lng,
      parcelBoundary: parcelBoundary ?? null,
      structureFootprints: structureFootprints ?? null,
      fireZones: fireZones ?? null,
    })
    .returning();

  return NextResponse.json(property, { status: 201 });
}

/** GET /api/properties — list current user's properties */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(properties)
    .where(eq(properties.ownerId, user.id))
    .orderBy(desc(properties.createdAt));

  return NextResponse.json(rows);
}
