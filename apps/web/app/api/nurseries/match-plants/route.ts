import { NextRequest, NextResponse } from "next/server";
import { getPlants } from "@/lib/api/lwf";

/**
 * POST /api/nurseries/match-plants
 * Takes an array of botanical names and tries to match them to LWF plant IDs.
 * Returns a map of botanicalName -> { plantId, matchedName } or null.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { botanicalNames } = body;

    if (!Array.isArray(botanicalNames)) {
      return NextResponse.json(
        { error: "botanicalNames array is required" },
        { status: 400 }
      );
    }

    // Fetch all plants from LWF API (paginated)
    const allPlants: Array<{ id: string; scientificName?: string; commonName?: string }> = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const result = await getPlants({ limit, offset });
      if (result.data && result.data.length > 0) {
        allPlants.push(
          ...result.data.map((p) => ({
            id: String(p.id),
            scientificName: (p as Record<string, unknown>).scientificName as string | undefined,
            commonName: (p as Record<string, unknown>).commonName as string | undefined,
          }))
        );
        offset += limit;
        hasMore = result.data.length === limit;
      } else {
        hasMore = false;
      }
    }

    // Build lookup maps (lowercased)
    const byScientific = new Map<string, { id: string; name: string }>();
    const byCommon = new Map<string, { id: string; name: string }>();

    for (const plant of allPlants) {
      if (plant.scientificName) {
        byScientific.set(plant.scientificName.toLowerCase().trim(), {
          id: plant.id,
          name: plant.scientificName,
        });
      }
      if (plant.commonName) {
        byCommon.set(plant.commonName.toLowerCase().trim(), {
          id: plant.id,
          name: plant.commonName,
        });
      }
    }

    // Match each botanical name
    const matches: Record<
      string,
      { plantId: string; matchedName: string } | null
    > = {};

    for (const name of botanicalNames) {
      const normalized = name.toLowerCase().trim();

      // Try exact scientific name match
      const sciMatch = byScientific.get(normalized);
      if (sciMatch) {
        matches[name] = { plantId: sciMatch.id, matchedName: sciMatch.name };
        continue;
      }

      // Try exact common name match
      const commonMatch = byCommon.get(normalized);
      if (commonMatch) {
        matches[name] = {
          plantId: commonMatch.id,
          matchedName: commonMatch.name,
        };
        continue;
      }

      // Try genus-level match (first word)
      const genus = normalized.split(/\s+/)[0];
      let genusMatch: { plantId: string; matchedName: string } | null = null;
      for (const [sciName, plant] of byScientific) {
        if (sciName.startsWith(genus + " ")) {
          // Partial match — take the first one found
          genusMatch = { plantId: plant.id, matchedName: plant.name };
          break;
        }
      }

      matches[name] = genusMatch;
    }

    const matched = Object.values(matches).filter(Boolean).length;
    const total = botanicalNames.length;

    return NextResponse.json({
      matches,
      stats: { matched, total, matchRate: total > 0 ? matched / total : 0 },
    });
  } catch (error) {
    console.error("Error matching plants:", error);
    return NextResponse.json(
      { error: "Failed to match plants" },
      { status: 500 }
    );
  }
}
