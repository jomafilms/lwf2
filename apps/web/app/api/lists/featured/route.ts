import { NextResponse } from "next/server";
import demoLists from "@/lib/data/demo-lists.json";

/** GET /api/lists/featured — returns the demo seed lists as featured collections */
export async function GET() {
  try {
    return NextResponse.json(demoLists.lists);
  } catch (error) {
    console.error("Failed to load featured lists:", error);
    return NextResponse.json(
      { error: "Failed to load featured lists" },
      { status: 500 }
    );
  }
}