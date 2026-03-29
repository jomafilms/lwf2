import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, tags, tagAssignments } from "@lwf/database";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** POST /api/tags/[id]/assign — assign a tag to a target */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id: tagId } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify tag ownership
  const [tag] = await db
    .select()
    .from(tags)
    .where(and(eq(tags.id, tagId), eq(tags.ownerId, user.id)));

  if (!tag) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  const body = await req.json();
  const { targetType, targetId } = body;

  const validTypes = ["plant", "nursery", "property", "plan"];
  if (!validTypes.includes(targetType) || !targetId) {
    return NextResponse.json(
      { error: "targetType and targetId are required" },
      { status: 400 }
    );
  }

  // Check if assignment already exists
  const existing = await db
    .select()
    .from(tagAssignments)
    .where(
      and(
        eq(tagAssignments.tagId, tagId),
        eq(tagAssignments.targetId, targetId),
        eq(tagAssignments.targetType, targetType)
      )
    );

  if (existing.length > 0) {
    return NextResponse.json(existing[0]);
  }

  const [assignment] = await db
    .insert(tagAssignments)
    .values({ tagId, targetType, targetId })
    .returning();

  return NextResponse.json(assignment, { status: 201 });
}

/** GET /api/tags/[id]/assign — get all assignments for a tag (alias for /items) */
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

  const assignments = await db
    .select()
    .from(tagAssignments)
    .where(eq(tagAssignments.tagId, tagId));

  return NextResponse.json(assignments);
}
