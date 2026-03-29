import { NextResponse } from "next/server";
import { db } from "@lwf/database";
import { nurseries } from "@lwf/database";

export async function GET() {
  try {
    const allNurseries = await db.select().from(nurseries);
    return NextResponse.json({ data: allNurseries });
  } catch (error) {
    console.error("Error fetching nurseries:", error);
    return NextResponse.json(
      { error: "Failed to fetch nurseries" },
      { status: 500 }
    );
  }
}
