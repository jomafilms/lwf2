import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, orgMembers, orgInvites } from "@lwf/database";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orgId } = await params;

    // Check if user is an admin
    const membership = await db
      .select()
      .from(orgMembers)
      .where(
        and(
          eq(orgMembers.orgId, orgId),
          eq(orgMembers.userId, user.id),
          eq(orgMembers.role, "admin")
        )
      )
      .limit(1);

    if (membership.length === 0) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Generate unique invite code
    let inviteCode: string;
    let isUnique = false;
    
    while (!isUnique) {
      inviteCode = nanoid(8).toLowerCase();
      const existing = await db
        .select()
        .from(orgInvites)
        .where(eq(orgInvites.code, inviteCode))
        .limit(1);
      isUnique = existing.length === 0;
    }

    // Set expiration to 30 days from now
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [invite] = await db
      .insert(orgInvites)
      .values({
        orgId,
        code: inviteCode!,
        createdBy: user.id,
        expiresAt,
      })
      .returning();

    return NextResponse.json({ 
      invite: {
        ...invite,
        inviteUrl: `${process.env.BETTER_AUTH_URL}/hoa/join/${invite.code}`
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}