import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, orgMembers, properties, plans } from "@lwf/database";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = params.id;

    // Check if user is a member
    const membership = await db
      .select()
      .from(orgMembers)
      .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, user.id)))
      .limit(1);

    if (membership.length === 0) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    // Get all members with their properties and compliance status
    const { user: userTable } = await import("@lwf/database");
    
    const membersData = await db
      .select({
        memberId: orgMembers.id,
        memberRole: orgMembers.role,
        joinedAt: orgMembers.joinedAt,
        userId: orgMembers.userId,
        userName: userTable.name,
        userEmail: userTable.email,
        propertyId: properties.id,
        propertyAddress: properties.address,
        planId: plans.id,
        complianceScore: plans.complianceScore,
        planStatus: plans.status,
      })
      .from(orgMembers)
      .leftJoin(userTable, eq(userTable.id, orgMembers.userId))
      .leftJoin(properties, eq(properties.ownerId, orgMembers.userId))
      .leftJoin(plans, eq(plans.propertyId, properties.id))
      .where(eq(orgMembers.orgId, orgId));

    // Group by member and aggregate their properties
    const memberMap = new Map();
    
    membersData.forEach(row => {
      const { userId, userName, userEmail, memberRole, joinedAt } = row;
      
      if (!memberMap.has(userId)) {
        memberMap.set(userId, {
          userId,
          name: userName,
          email: userEmail,
          role: memberRole,
          joinedAt,
          properties: [],
          totalProperties: 0,
          assessedProperties: 0,
          avgComplianceScore: 0,
          complianceStatus: 'unassessed',
        });
      }
      
      const member = memberMap.get(userId);
      
      if (row.propertyId) {
        member.totalProperties++;
        
        const property = {
          id: row.propertyId,
          address: row.propertyAddress,
          complianceScore: row.complianceScore,
          planStatus: row.planStatus,
        };
        
        member.properties.push(property);
        
        if (row.complianceScore !== null) {
          member.assessedProperties++;
        }
      }
    });

    // Calculate compliance status and average scores
    const members = Array.from(memberMap.values()).map(member => {
      if (member.assessedProperties > 0) {
        const scores = member.properties
          .filter(p => p.complianceScore !== null)
          .map(p => p.complianceScore);
        
        member.avgComplianceScore = Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length
        );
        
        if (member.avgComplianceScore >= 80) {
          member.complianceStatus = 'compliant';
        } else if (member.avgComplianceScore >= 60) {
          member.complianceStatus = 'partial';
        } else {
          member.complianceStatus = 'non-compliant';
        }
      } else if (member.totalProperties > 0) {
        member.complianceStatus = 'unassessed';
      } else {
        member.complianceStatus = 'no-property';
      }
      
      return member;
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}