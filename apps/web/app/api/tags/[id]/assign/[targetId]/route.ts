import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, tags, tagAssignments } from "@lwf/database";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string; targetId: string }>;
}

/** DELETE /api/tags/[id]/assign/[targetId] — remove a tag assignment */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id: tagId, targetId } = await params;
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

  await db
    .delete(tagAssignments)
    .where(
      and(
        eq(tagAssignments.tagId, tagId),
        eq(tagAssignments.targetId, targetId)
      )
    );

  return NextResponse.json({ ok: true });
}
