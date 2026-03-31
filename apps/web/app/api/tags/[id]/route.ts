import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, tags, tagAssignments } from "@lwf/database";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET /api/tags/[id] — get a single tag */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const user = await getCurrentUser();

  const [tag] = await db.select().from(tags).where(eq(tags.id, id));

  if (!tag) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  // Allow public tags to be viewed by anyone
  if (tag.visibility !== "public" && (!user || tag.ownerId !== user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(tag);
}

/** PUT /api/tags/[id] — update a tag */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const [existing] = await db
    .select()
    .from(tags)
    .where(and(eq(tags.id, id), eq(tags.ownerId, user.id)));

  if (!existing) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.color !== undefined) updates.color = body.color;
  if (body.visibility !== undefined) {
    const validVisibility = ["private", "public", "org"];
    if (validVisibility.includes(body.visibility)) {
      updates.visibility = body.visibility;
    }
  }
  if (body.removeOwner === true) updates.ownerId = null;

  const [updated] = await db
    .update(tags)
    .set(updates)
    .where(eq(tags.id, id))
    .returning();

  return NextResponse.json(updated);
}

/** DELETE /api/tags/[id] — delete a tag and its assignments */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [existing] = await db
    .select()
    .from(tags)
    .where(and(eq(tags.id, id), eq(tags.ownerId, user.id)));

  if (!existing) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  // Cascade delete handles assignments via FK
  await db.delete(tags).where(eq(tags.id, id));

  return NextResponse.json({ ok: true });
}
