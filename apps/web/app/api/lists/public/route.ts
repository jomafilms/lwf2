import { NextResponse } from "next/server";
import { db, tags, tagAssignments, user, orgMembers, orgs } from "@lwf/database";
import { eq, desc, count, or, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

/** GET /api/lists/public — get all public and org-visible lists with plant counts */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    // Get all public lists plus org lists the user can see
    const listsWithCounts = await db
      .select({
        id: tags.id,
        name: tags.name,
        ownerId: tags.ownerId,
        visibility: tags.visibility,
        color: tags.color,
        createdAt: tags.createdAt,
        ownerName: user.name,
        ownerEmail: user.email,
        orgName: orgs.name,
        orgType: orgs.type,
        itemCount: count(tagAssignments.id),
      })
      .from(tags)
      .leftJoin(tagAssignments, eq(tags.id, tagAssignments.tagId))
      .leftJoin(user, eq(tags.ownerId, user.id))
      .leftJoin(orgMembers, and(
        eq(orgMembers.userId, user.id),
        eq(tags.visibility, "org")
      ))
      .leftJoin(orgs, eq(orgMembers.orgId, orgs.id))
      .where(
        currentUser
          ? or(
              eq(tags.visibility, "public"),
              and(
                eq(tags.visibility, "org"),
                eq(orgMembers.userId, currentUser.id)
              )
            )
          : eq(tags.visibility, "public")
      )
      .groupBy(tags.id, user.name, user.email, orgs.name, orgs.type)
      .orderBy(desc(tags.createdAt));

    // Transform the result to match our expected format
    const result = listsWithCounts.map((list) => ({
      id: list.id,
      name: list.name,
      ownerId: list.ownerId,
      visibility: list.visibility,
      color: list.color,
      createdAt: list.createdAt,
      ownerName: list.ownerName,
      ownerEmail: list.ownerEmail,
      orgName: list.orgName,
      orgType: list.orgType,
      itemCount: Number(list.itemCount),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch public lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch public lists" },
      { status: 500 }
    );
  }
}