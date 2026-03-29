import { NextRequest, NextResponse } from "next/server";
import { getNurseryAvailability } from "@/lib/nursery-availability";

/** POST /api/nursery-availability — get nursery matches for plant list */
export async function POST(req: NextRequest) {
  try {
    const { plantIds } = await req.json();
    
    if (!Array.isArray(plantIds)) {
      return NextResponse.json(
        { error: "plantIds must be an array" },
        { status: 400 }
      );
    }

    const matches = await getNurseryAvailability(plantIds);
    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error getting nursery availability:", error);
    return NextResponse.json(
      { error: "Failed to get nursery availability" },
      { status: 500 }
    );
  }
}