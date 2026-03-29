import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, tagAssignments, tags } from "@lwf/database";
import { eq, and } from "drizzle-orm";

/** GET /api/tags/starred — get user's starred lists */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get starred list assignments for this user
  const starredAssignments = await db
    .select({
      assignment: tagAssignments,
      tag: tags,
    })
    .from(tagAssignments)
    .leftJoin(tags, eq(tags.id, tagAssignments.targetId))
    .where(
      and(
        eq(tagAssignments.targetType, "list"),
        eq(tagAssignments.tagId, user.id) // User ID stored in tagId field
      )
    );

  const starredLists = starredAssignments
    .filter((item) => item.tag !== null) // Filter out deleted tags
    .map((item) => ({
      assignment: item.assignment,
      tag: item.tag!,
    }));

  return NextResponse.json(starredLists);
}