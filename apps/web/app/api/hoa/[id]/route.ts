import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, orgs, orgMembers, properties, plans } from "@lwf/database";
import { eq, avg, count, and, isNotNull } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orgId } = await params;

    // Check if user is a member
    const membership = await db
      .select()
      .from(orgMembers)
      .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, user.id)))
      .limit(1);

    if (membership.length === 0) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    // Get organization details
    const [org] = await db.select().from(orgs).where(eq(orgs.id, orgId));

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Get member count
    const [memberCountResult] = await db
      .select({ count: count() })
      .from(orgMembers)
      .where(eq(orgMembers.orgId, orgId));

    const memberCount = memberCountResult.count;

    // Get properties and compliance stats
    const membersWithProperties = await db
      .select({
        userId: orgMembers.userId,
        propertyId: properties.id,
        propertyAddress: properties.address,
        planId: plans.id,
        readinessScore: plans.readinessScore,
      })
      .from(orgMembers)
      .leftJoin(properties, eq(properties.ownerId, orgMembers.userId))
      .leftJoin(plans, eq(plans.propertyId, properties.id))
      .where(eq(orgMembers.orgId, orgId));

    // Calculate aggregate scores
    const scoresData = membersWithProperties.filter(m => m.readinessScore !== null);
    const avgScore = scoresData.length > 0 
      ? scoresData.reduce((sum, m) => sum + m.readinessScore!, 0) / scoresData.length 
      : 0;

    // Calculate assessment progress
    const propertiesWithAssessments = membersWithProperties.filter(m => m.readinessScore !== null).length;
    const totalProperties = membersWithProperties.filter(m => m.propertyId !== null).length;
    const assessmentProgress = totalProperties > 0 ? (propertiesWithAssessments / totalProperties) * 100 : 0;

    return NextResponse.json({
      org,
      memberCount,
      stats: {
        avgComplianceScore: Math.round(avgScore),
        assessmentProgress: Math.round(assessmentProgress),
        propertiesAssessed: propertiesWithAssessments,
        totalProperties,
      },
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}