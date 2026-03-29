import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversations } from "@lwf2/database/schema/core";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

interface ChatItem {
  type: "message" | "plants" | "rich_plants";
  role?: "user" | "assistant";
  content?: string;
  plants?: unknown[];
  richPlants?: unknown[];
}

// GET /api/conversations/[id] - load conversation messages
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, user.id)));

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Failed to load conversation:", error);
    return NextResponse.json(
      { error: "Failed to load conversation" },
      { status: 500 }
    );
  }
}

// PUT /api/conversations/[id] - update/save messages
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { messages, title } = await req.json();

    // Auto-generate title from first user message if not provided
    let finalTitle = title;
    if (!finalTitle && messages?.length > 0) {
      const firstUserMessage = messages.find(
        (msg: ChatItem) => msg.type === "message" && msg.role === "user"
      );
      if (firstUserMessage?.content) {
        finalTitle = firstUserMessage.content.slice(0, 50);
        if (firstUserMessage.content.length > 50) {
          finalTitle += "...";
        }
      }
    }

    const [conversation] = await db
      .update(conversations)
      .set({
        messages: messages as unknown as Record<string, unknown>,
        title: finalTitle,
        updatedAt: new Date(),
      })
      .where(and(eq(conversations.id, id), eq(conversations.userId, user.id)))
      .returning();

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Failed to update conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id] - delete conversation
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [deleted] = await db
      .delete(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, user.id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}