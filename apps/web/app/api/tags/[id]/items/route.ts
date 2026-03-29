import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, tags, tagAssignments } from "@lwf/database";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET /api/tags/[id]/items — get all items with this tag */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id: tagId } = await params;
  const user = await getCurrentUser();

  // Get tag — check visibility
  const [tag] = await db.select().from(tags).where(eq(tags.id, tagId));
  if (!tag) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  if (tag.visibility !== "public" && (!user || tag.ownerId !== user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const items = await db
    .select()
    .from(tagAssignments)
    .where(eq(tagAssignments.tagId, tagId));

  return NextResponse.json({
    tag,
    items,
  });
}
