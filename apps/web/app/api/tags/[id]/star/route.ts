import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, tagAssignments } from "@lwf/database";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** POST /api/tags/[id]/star — toggle star for this list */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id: tagId } = await params;
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if already starred (reuse tagAssignments with targetType="list")
  const [existing] = await db
    .select()
    .from(tagAssignments)
    .where(
      and(
        eq(tagAssignments.targetType, "list"),
        eq(tagAssignments.targetId, tagId),
        eq(tagAssignments.tagId, user.id) // Store user ID in tagId field for starred lists
      )
    );

  if (existing) {
    // Unstar - remove the assignment
    await db
      .delete(tagAssignments)
      .where(eq(tagAssignments.id, existing.id));
    
    return NextResponse.json({ starred: false });
  } else {
    // Star - create new assignment
    const [assignment] = await db
      .insert(tagAssignments)
      .values({
        tagId: user.id, // Store user ID in tagId field for starred lists
        targetType: "list",
        targetId: tagId,
      })
      .returning();

    return NextResponse.json({ starred: true, assignment });
  }
}