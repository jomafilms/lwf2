import { NextRequest } from "next/server";
import { db, properties, plans } from "@lwf/database";
import { count, avg, sql, isNotNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  // Public endpoint - no auth required
  try {
    // Basic aggregate stats - no individual property data
    const [totalPropertiesResult] = await db
      .select({ count: count() })
      .from(properties);

    const [assessedPropertiesResult] = await db
      .select({ count: count() })
      .from(properties)
      .innerJoin(plans, sql`${properties.id} = ${plans.propertyId}`);

    const [avgScoreResult] = await db
      .select({ avg: avg(plans.readinessScore) })
      .from(plans)
      .where(isNotNull(plans.readinessScore));

    // Score distribution without individual property details
    const scoreDistribution = await db
      .select({
        tier: sql<string>`
          CASE 
            WHEN readiness_score >= 80 THEN 'fire-ready'
            WHEN readiness_score >= 50 THEN 'needs-work'
            WHEN readiness_score < 50 THEN 'needs attention'
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

    // Monthly progress for public display
    const monthlyProgress = await db
      .select({
        month: sql<string>`TO_CHAR(${plans.createdAt}, 'YYYY-MM')`,
        count: count(),
      })
      .from(plans)
      .where(isNotNull(plans.createdAt))
      .groupBy(sql`TO_CHAR(${plans.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${plans.createdAt}, 'YYYY-MM')`);

    const totalProperties = totalPropertiesResult.count;
    const assessedProperties = assessedPropertiesResult.count;
    const assessmentProgress = totalProperties > 0 ? (assessedProperties / totalProperties) * 100 : 0;
    
    // 90% goal calculation
    const targetCoverage = totalProperties * 0.9;
    const progressTowardGoal = targetCoverage > 0 ? (assessedProperties / targetCoverage) * 100 : 0;

    // Complete score distribution
    const allTiers = ["compliant", "needs-work", "non-compliant"];
    const distributionMap = new Map(scoreDistribution.map(d => [d.tier, d.count]));
    const completeDistribution = allTiers.map(tier => ({
      tier,
      count: distributionMap.get(tier) || 0,
    }));

    const unassessedCount = totalProperties - assessedProperties;
    if (unassessedCount > 0) {
      completeDistribution.push({
        tier: "unassessed",
        count: unassessedCount,
      });
    }

    const response = {
      community: {
        totalProperties: totalProperties,
        propertiesAssessed: assessedProperties,
        averageScore: avgScoreResult.avg ? Math.round(Number(avgScoreResult.avg)) : null,
        assessmentProgress: Math.round(assessmentProgress * 100) / 100,
        progressTowardGoal: Math.round(progressTowardGoal * 100) / 100,
        targetCoverage: Math.round(targetCoverage),
      },
      scoreDistribution: completeDistribution,
      monthlyProgress: monthlyProgress.map(item => ({
        month: item.month,
        count: item.count,
        monthLabel: new Date(item.month + '-01').toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        }),
      })),
      lastUpdated: new Date().toISOString(),
    };

    return Response.json(response);
  } catch (error) {
    console.error("Error fetching community stats:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}