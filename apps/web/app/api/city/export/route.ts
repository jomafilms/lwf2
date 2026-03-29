import { NextRequest } from "next/server";
import { db, properties, plans, user } from "@lwf/database";
import { eq, isNotNull, sql } from "drizzle-orm";
import { getCurrentUserRole } from "@/lib/user-role";

export async function GET(request: NextRequest) {
  // Require city_admin role
  const role = await getCurrentUserRole();
  if (role !== "city_admin") {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Fetch aggregate data for export
    const exportData = await db
      .select({
        propertyId: properties.id,
        address: properties.address,
        lat: properties.lat,
        lng: properties.lng,
        propertyCreated: properties.createdAt,
        hasFireZones: sql<boolean>`${properties.fireZones} IS NOT NULL`,
        planId: plans.id,
        planStatus: plans.status,
        complianceScore: plans.complianceScore,
        estimatedCost: plans.estimatedCost,
        planCreated: plans.createdAt,
        planSubmitted: plans.submittedAt,
        ownerEmail: user.email,
      })
      .from(properties)
      .leftJoin(plans, eq(properties.id, plans.propertyId))
      .leftJoin(user, eq(properties.ownerId, user.id))
      .orderBy(properties.createdAt);

    // Convert to CSV
    const headers = [
      "Property ID",
      "Address", 
      "Latitude",
      "Longitude",
      "Property Created",
      "Has Fire Zones",
      "Plan ID",
      "Plan Status", 
      "Compliance Score",
      "Estimated Cost",
      "Plan Created",
      "Plan Submitted",
      "Owner Email",
    ];

    const csvRows = [
      headers.join(","),
      ...exportData.map(row => [
        row.propertyId,
        `"${row.address}"`, // Quote address in case of commas
        row.lat,
        row.lng,
        row.propertyCreated ? new Date(row.propertyCreated).toISOString().split('T')[0] : "",
        row.hasFireZones ? "Yes" : "No",
        row.planId || "",
        row.planStatus || "",
        row.complianceScore || "",
        row.estimatedCost || "",
        row.planCreated ? new Date(row.planCreated).toISOString().split('T')[0] : "",
        row.planSubmitted ? new Date(row.planSubmitted).toISOString().split('T')[0] : "",
        `"${row.ownerEmail}"`, // Quote email in case of special characters
      ].join(","))
    ];

    const csvContent = csvRows.join("\n");
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `ashland-wildfire-progress-${timestamp}.csv`;

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating export:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}