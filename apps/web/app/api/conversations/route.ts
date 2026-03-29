import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversations } from "@lwf2/database/schema/core";
import { getCurrentUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

// GET /api/conversations - list user's conversations
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userConversations = await db
      .select({
        id: conversations.id,
        title: conversations.title,
        updatedAt: conversations.updatedAt,
        createdAt: conversations.createdAt,
        propertyId: conversations.propertyId,
      })
      .from(conversations)
      .where(eq(conversations.userId, user.id))
      .orderBy(desc(conversations.updatedAt));

    return NextResponse.json({ conversations: userConversations });
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/conversations - create new conversation
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, propertyId } = await req.json();

    const [conversation] = await db
      .insert(conversations)
      .values({
        userId: user.id,
        title: title || null,
        messages: [],
        propertyId: propertyId || null,
      })
      .returning();

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}