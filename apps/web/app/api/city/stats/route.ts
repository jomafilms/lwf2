import { NextRequest } from "next/server";
import { db, properties, plans, userProfiles, user } from "@lwf/database";
import { count, avg, sql, eq, isNotNull, gte } from "drizzle-orm";
import { getCurrentUserRole } from "@/lib/user-role";

export async function GET(request: NextRequest) {
  // Require city_admin role
  const role = await getCurrentUserRole();
  if (role !== "city_admin") {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Total properties in the system
    const [totalPropertiesResult] = await db
      .select({ count: count() })
      .from(properties);

    // Total plans created
    const [totalPlansResult] = await db
      .select({ count: count() })
      .from(plans);

    // Properties with plans (assessed)
    const [assessedPropertiesResult] = await db
      .select({ count: count() })
      .from(properties)
      .innerJoin(plans, eq(properties.id, plans.propertyId));

    // Average compliance scores (only for properties with scores)
    const [avgScoreResult] = await db
      .select({ avg: avg(plans.complianceScore) })
      .from(plans)
      .where(isNotNull(plans.complianceScore));

    // Score distribution (compliance tiers)
    const scoreDistribution = await db
      .select({
        tier: sql<string>`
          CASE 
            WHEN compliance_score >= 80 THEN 'compliant'
            WHEN compliance_score >= 50 THEN 'needs-work'
            WHEN compliance_score < 50 THEN 'non-compliant'
            ELSE 'unassessed'
          END
        `,
        count: count(),
      })
      .from(plans)
      .where(isNotNull(plans.readinessScore))
      .groupBy(sql`
        CASE 
          WHEN readiness_score >= 80 THEN 'fire-ready'
          WHEN readiness_score >= 50 THEN 'needs-work'
          WHEN readiness_score < 50 THEN 'needs attention'
          ELSE 'unassessed'
        END
      `);

    // Time series data - properties assessed by month
    const timeSeries = await db
      .select({
        month: sql<string>`TO_CHAR(${plans.createdAt}, 'YYYY-MM')`,
        count: count(),
      })
      .from(plans)
      .where(isNotNull(plans.createdAt))
      .groupBy(sql`TO_CHAR(${plans.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${plans.createdAt}, 'YYYY-MM')`);

    // User roles breakdown
    const roleStats = await db
      .select({
        role: userProfiles.role,
        count: count(),
      })
      .from(userProfiles)
      .groupBy(userProfiles.role);

    // Calculate progress toward 90% goal
    const totalProperties = totalPropertiesResult.count;
    const assessedProperties = assessedPropertiesResult.count;
    const assessmentProgress = totalProperties > 0 ? (assessedProperties / totalProperties) * 100 : 0;
    const targetCoverage = totalProperties * 0.9; // 90% goal

    // Transform score distribution to ensure all tiers are represented
    const allTiers = ["compliant", "needs-work", "non-compliant"];
    const distributionMap = new Map(scoreDistribution.map(d => [d.tier, d.count]));
    const completeDistribution = allTiers.map(tier => ({
      tier,
      count: distributionMap.get(tier) || 0,
    }));

    // Add unassessed properties
    const unassessedCount = totalProperties - assessedProperties;
    if (unassessedCount > 0) {
      completeDistribution.push({
        tier: "unassessed",
        count: unassessedCount,
      });
    }

    const response = {
      overview: {
        totalProperties: totalProperties,
        totalPlans: totalPlansResult.count,
        propertiesAssessed: assessedProperties,
        averageScore: avgScoreResult.avg ? Math.round(Number(avgScoreResult.avg)) : null,
        assessmentProgress: Math.round(assessmentProgress * 100) / 100,
        targetCoverage: Math.round(targetCoverage),
        progressTowardGoal: Math.round((assessedProperties / targetCoverage) * 100 * 100) / 100,
      },
      scoreDistribution: completeDistribution,
      timeSeries: timeSeries.map(item => ({
        month: item.month,
        count: item.count,
        monthLabel: new Date(item.month + '-01').toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        }),
      })),
      roleStats: roleStats,
      lastUpdated: new Date().toISOString(),
    };

    return Response.json(response);
  } catch (error) {
    console.error("Error fetching city stats:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}