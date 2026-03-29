import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, tags, tagAssignments } from "@lwf/database";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** POST /api/tags/[id]/fork — creates a copy of a public list in the user's tags */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the original tag
    const [originalTag] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, id));

    if (!originalTag) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // Check if the list is public
    if (originalTag.visibility !== "public") {
      return NextResponse.json(
        { error: "Can only fork public lists" },
        { status: 403 }
      );
    }

    // Create a new tag for the user
    const [newTag] = await db
      .insert(tags)
      .values({
        name: `Copy of ${originalTag.name}`,
        ownerId: user.id,
        color: originalTag.color,
        visibility: "private", // Copies are private by default
      })
      .returning();

    // Get all assignments from the original tag
    const originalAssignments = await db
      .select()
      .from(tagAssignments)
      .where(eq(tagAssignments.tagId, id));

    // Copy all assignments to the new tag
    if (originalAssignments.length > 0) {
      await db.insert(tagAssignments).values(
        originalAssignments.map((assignment) => ({
          tagId: newTag.id,
          targetType: assignment.targetType,
          targetId: assignment.targetId,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      newTag,
      copiedItems: originalAssignments.length,
    });
  } catch (error) {
    console.error("Failed to fork list:", error);
    return NextResponse.json(
      { error: "Failed to fork list" },
      { status: 500 }
    );
  }
}