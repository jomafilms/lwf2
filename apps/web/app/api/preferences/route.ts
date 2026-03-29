import { getCurrentUser } from "@/lib/auth";
import { db, userProfiles } from "@lwf/database";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ preferences: {} });
  }

  const profile = await db
    .select({ preferences: userProfiles.preferences })
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);

  const preferences = (profile[0]?.preferences as Record<string, unknown>) ?? {};
  return NextResponse.json({ preferences });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to save preferences" },
      { status: 401 }
    );
  }

  const body = (await req.json()) as { preferences: Record<string, unknown> };
  if (!body.preferences || typeof body.preferences !== "object") {
    return NextResponse.json(
      { error: "Invalid preferences payload" },
      { status: 400 }
    );
  }

  // Upsert: get existing profile or create one, then merge preferences
  const existing = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);

  let merged: Record<string, unknown>;

  if (existing.length > 0) {
    const current = (existing[0].preferences as Record<string, unknown>) ?? {};
    merged = { ...current, ...body.preferences };
    await db
      .update(userProfiles)
      .set({ preferences: merged })
      .where(eq(userProfiles.userId, user.id));
  } else {
    merged = body.preferences;
    await db.insert(userProfiles).values({
      userId: user.id,
      preferences: merged,
    });
  }

  return NextResponse.json({ preferences: merged });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  const existing = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ preferences: {} });
  }

  const current = (existing[0].preferences as Record<string, unknown>) ?? {};

  if (key) {
    // Delete a single preference
    const { [key]: _, ...rest } = current;
    await db
      .update(userProfiles)
      .set({ preferences: rest })
      .where(eq(userProfiles.userId, user.id));
    return NextResponse.json({ preferences: rest });
  } else {
    // Clear all preferences
    await db
      .update(userProfiles)
      .set({ preferences: {} })
      .where(eq(userProfiles.userId, user.id));
    return NextResponse.json({ preferences: {} });
  }
}
