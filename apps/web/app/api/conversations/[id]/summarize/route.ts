import { NextResponse } from "next/server";
import { db, conversations } from "@lwf/database";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { saveConversationSummary } from "@/lib/rag/summaries";

interface ChatItem {
  type: "message" | "plants" | "rich_plants";
  role?: "user" | "assistant";
  content?: string;
}

// POST /api/conversations/[id]/summarize - generate and save a conversation summary
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Load the conversation
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(eq(conversations.id, id), eq(conversations.userId, user.id)),
      );

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Extract text messages from the conversation's ChatItem array
    const chatItems = (conversation.messages ?? []) as ChatItem[];
    const textMessages = chatItems
      .filter(
        (item) =>
          item.type === "message" && item.role && item.content,
      )
      .map((item) => ({
        role: item.role as string,
        content: item.content as string,
      }));

    if (textMessages.length < 2) {
      return NextResponse.json(
        { error: "Conversation too short to summarize" },
        { status: 400 },
      );
    }

    await saveConversationSummary(id, user.id, textMessages);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to summarize conversation:", error);
    return NextResponse.json(
      { error: "Failed to summarize conversation" },
      { status: 500 },
    );
  }
}
