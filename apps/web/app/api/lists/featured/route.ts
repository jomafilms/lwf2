import { NextRequest, NextResponse } from "next/server";
import demoLists from "@/lib/data/demo-lists.json";

/** GET /api/lists/featured — get featured plant lists */
export async function GET(req: NextRequest) {
  return NextResponse.json(demoLists.lists);
}