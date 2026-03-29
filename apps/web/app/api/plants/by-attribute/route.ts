import { NextRequest, NextResponse } from "next/server";
import { getPlants, getValuesBulk } from "@/lib/api/lwf";

/**
 * GET /api/plants/by-attribute?attributeId=xxx
 * Returns plants that have values for a given attribute, with plant details.
 * Used by featured lists backed by LWF API data.
 */
export async function GET(req: NextRequest) {
  const attributeId = req.nextUrl.searchParams.get("attributeId");
  if (!attributeId) {
    return NextResponse.json({ error: "attributeId required" }, { status: 400 });
  }

  try {
    // Get all plant IDs that have this attribute
    const bulkResult = await getValuesBulk({
      attributeIds: [attributeId],
      resolve: true,
    });

    const raw = bulkResult as Record<string, unknown>;
    const dataObj = raw.data as Record<string, unknown> | undefined;
    const valuesObj = (dataObj?.values || dataObj || raw) as Record<string, unknown>;

    const matchingIds = Object.keys(valuesObj).filter((k) => k !== "meta");
    const total = matchingIds.length;

    // Fetch first 10 plant details (with images)
    const displayIds = matchingIds.slice(0, 10);

    // Fetch all plants and filter to matching IDs
    const plantsResponse = await getPlants({
      limit: 200,
      includeImages: true,
    });

    const idSet = new Set(displayIds);
    const plants = plantsResponse.data.filter((p) => idSet.has(p.id));

    // If we didn't find enough in first 200, try second batch
    if (plants.length < displayIds.length) {
      const plantsResponse2 = await getPlants({
        limit: 200,
        offset: 200,
        includeImages: true,
      });
      const more = plantsResponse2.data.filter(
        (p) => idSet.has(p.id) && !plants.find((e) => e.id === p.id)
      );
      plants.push(...more);
    }

    return NextResponse.json({ total, plants });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
