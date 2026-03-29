import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, orgInvites, orgMembers } from "@lwf/database";
import { eq, and, isNull } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { inviteCode } = body;
    const { id: orgId } = await params;

    if (!inviteCode) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    // Find and validate invite
    const [invite] = await db
      .select()
      .from(orgInvites)
      .where(
        and(
          eq(orgInvites.code, inviteCode),
          eq(orgInvites.orgId, orgId),
          isNull(orgInvites.usedBy)
        )
      )
      .limit(1);

    if (!invite) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
    }

    // Check if invite is expired
    if (invite.expiresAt && new Date() > invite.expiresAt) {
      return NextResponse.json({ error: "Invite code has expired" }, { status: 400 });
    }

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(orgMembers)
      .where(
        and(
          eq(orgMembers.orgId, orgId),
          eq(orgMembers.userId, user.id)
        )
      )
      .limit(1);

    if (existingMember.length > 0) {
      return NextResponse.json({ error: "Already a member" }, { status: 400 });
    }

    // Add user as member
    await db.insert(orgMembers).values({
      orgId,
      userId: user.id,
      role: "member",
    });

    // Mark invite as used
    await db
      .update(orgInvites)
      .set({
        usedBy: user.id,
        usedAt: new Date(),
      })
      .where(eq(orgInvites.id, invite.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error joining organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}