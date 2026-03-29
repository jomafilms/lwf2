import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, tags } from "@lwf/database";
import { eq, and, desc } from "drizzle-orm";

/** POST /api/tags — create a new tag/list */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, color, visibility } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  const validVisibility = ["private", "public", "org"];
  const vis = validVisibility.includes(visibility) ? visibility : "private";

  const [tag] = await db
    .insert(tags)
    .values({
      name: name.trim(),
      ownerId: user.id,
      color: color || null,
      visibility: vis,
    })
    .returning();

  return NextResponse.json(tag, { status: 201 });
}

/** GET /api/tags — list current user's tags */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userTags = await db
    .select()
    .from(tags)
    .where(eq(tags.ownerId, user.id))
    .orderBy(desc(tags.createdAt));

  return NextResponse.json(userTags);
}
