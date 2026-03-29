import { NextRequest, NextResponse } from "next/server";
import { db, tags, tagAssignments, user, orgs, orgMembers } from "@lwf/database";
import { eq, and, count } from "drizzle-orm";

/** GET /api/lists/public — get public lists with metadata */
export async function GET(req: NextRequest) {
  try {
    // Get public tags with owner/org info and item counts
    const publicLists = await db
      .select({
        tag: tags,
        ownerName: user.name,
        ownerEmail: user.email,
        orgName: orgs.name,
        orgType: orgs.type,
      })
      .from(tags)
      .leftJoin(user, eq(user.id, tags.ownerId))
      .leftJoin(orgMembers, eq(orgMembers.userId, tags.ownerId))
      .leftJoin(orgs, eq(orgs.id, orgMembers.orgId))
      .where(eq(tags.visibility, "public"));

    // Get item counts for each tag
    const withCounts = await Promise.all(
      publicLists.map(async (item) => {
        const [countResult] = await db
          .select({ count: count() })
          .from(tagAssignments)
          .where(
            and(
              eq(tagAssignments.tagId, item.tag.id),
              eq(tagAssignments.targetType, "plant")
            )
          );

        return {
          ...item.tag,
          itemCount: countResult.count,
          ownerName: item.ownerName,
          ownerEmail: item.ownerEmail,
          orgName: item.orgName,
          orgType: item.orgType,
        };
      })
    );

    // Sort by creation date (newest first)
    withCounts.sort((a, b) => {
      const aDate = new Date(a.createdAt ?? 0).getTime();
      const bDate = new Date(b.createdAt ?? 0).getTime();
      return bDate - aDate;
    });

    return NextResponse.json(withCounts);
  } catch (error) {
    console.error("Error fetching public lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch public lists" },
      { status: 500 }
    );
  }
}