import type Anthropic from "@anthropic-ai/sdk";
import {
  getPlants,
  getPlant,
  getPlantValues,
  getPlantRiskReduction,
  getValuesBulk,
} from "@/lib/api/lwf";
import { db, userProfiles } from "@lwf/database";
import { eq } from "drizzle-orm";

// HIZ attribute ID from IMPLEMENTATION.md
const HIZ_ATTRIBUTE_ID = "b908b170-70c9-454d-a2ed-d86f98cb3de1";

// Cache zone data (1MB response, avoid re-fetching per chat message)
let zoneCache: { data: Record<string, string[]>; timestamp: number } | null = null;
const ZONE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getZoneMap(): Promise<Record<string, string[]>> {
  if (zoneCache && Date.now() - zoneCache.timestamp < ZONE_CACHE_TTL) {
    return zoneCache.data;
  }
  const bulkResult = await getValuesBulk({
    attributeIds: [HIZ_ATTRIBUTE_ID],
    resolve: true,
  });
  const zoneMap: Record<string, string[]> = {};
  if (bulkResult && typeof bulkResult === "object") {
    // API returns { data: { values: { plantId: { attrId: [...] } } } }
    const raw = bulkResult as Record<string, unknown>;
    const dataObj = raw.data as Record<string, unknown> | undefined;
    const valuesObj = (dataObj?.values || dataObj || raw) as Record<string, unknown>;
    for (const [plantId, plantData] of Object.entries(valuesObj)) {
      if (!plantData || typeof plantData !== "object" || plantId === "meta") continue;
      const zones: string[] = [];
      for (const attrValues of Object.values(plantData as Record<string, unknown>)) {
        if (!Array.isArray(attrValues)) continue;
        for (const v of attrValues) {
          const val = v as { resolved?: { value?: string }; value?: string };
          const resolved = val.resolved?.value || val.value || "";
          if (resolved) zones.push(resolved);
        }
      }
      if (zones.length > 0) zoneMap[plantId] = zones;
    }
  }
  zoneCache = { data: zoneMap, timestamp: Date.now() };
  return zoneMap;
}

export const toolDefinitions: Anthropic.Tool[] = [
  {
    name: "search_plants",
    description:
      "Search the plant database by name. Returns a list of plants with basic info.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description:
            "Search term — plant common name, genus, or species",
        },
        limit: {
          type: "number",
          description: "Max results (default 10)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_plant_details",
    description:
      "Get full details for a specific plant including all attribute values, fire risk data, and source provenance. Use this to give nuanced, property-specific advice — character scores, placement codes, triggered rules, water needs, native status, deer resistance, and more. Always cite what the data shows.",
    input_schema: {
      type: "object" as const,
      properties: {
        plantId: {
          type: "string",
          description: "The plant UUID",
        },
      },
      required: ["plantId"],
    },
  },
  {
    name: "get_zone_recommendations",
    description:
      "Get plants recommended for a specific fire zone (Home Ignition Zone). Returns plants with their HIZ values.",
    input_schema: {
      type: "object" as const,
      properties: {
        zone: {
          type: "string",
          enum: ["0-5", "5-10", "10-30", "30-100", "50-100"],
          description: "Fire zone distance range in feet",
        },
      },
      required: ["zone"],
    },
  },
  {
    name: "get_plant_risk_reduction",
    description:
      "Get fire risk reduction analysis for a specific plant — character score, placement code, triggered rules, and risk reduction text. This tells you WHY a plant is safe or risky, not just whether it is. Use this to explain tradeoffs to homeowners.",
    input_schema: {
      type: "object" as const,
      properties: {
        plantId: {
          type: "string",
          description: "The plant UUID",
        },
      },
      required: ["plantId"],
    },
  },
  {
    name: "get_user_preferences",
    description:
      "Load the current user's saved preferences (deer resistance, water needs, native-only, max height, aesthetic prefs, etc.). Call this at the start of every conversation to personalize recommendations.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "save_user_preference",
    description:
      "Save a user preference for future conversations. Use when the user mentions a constraint like 'I have deer', 'only low-water plants', 'no plants taller than 6 feet', 'only Oregon natives', or aesthetic preferences like 'no pink flowers'.",
    input_schema: {
      type: "object" as const,
      properties: {
        key: {
          type: "string",
          description:
            "Preference key, e.g. 'deerResistant', 'waterNeeds', 'nativeOnly', 'maxHeight', 'aestheticPrefs', 'maintenance', 'notes'",
        },
        value: {
          description:
            "Preference value — can be a string, number, boolean, or array of strings",
        },
      },
      required: ["key", "value"],
    },
  },
  {
    name: "compare_plants",
    description:
      "Compare 2-3 plants side-by-side to help users make informed decisions. Returns a link to the comparison page and summarizes key differences. Use when a user asks to compare specific plants or when you want to suggest comparing alternatives for their situation.",
    input_schema: {
      type: "object" as const,
      properties: {
        plantIds: {
          type: "array",
          items: { type: "string" },
          description: "Array of 2-3 plant UUIDs to compare",
          minItems: 2,
          maxItems: 3,
        },
        context: {
          type: "string",
          description: "Brief context for why you're suggesting this comparison (e.g. 'for your Zone 1 area' or 'low-water options')",
        },
      },
      required: ["plantIds"],
    },
  },
];

// Context passed from the chat route to identify the current user
export interface ToolContext {
  userId?: string;
}

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  context?: ToolContext
): Promise<string> {
  try {
    switch (name) {
      case "search_plants": {
        const result = await getPlants({
          search: input.query as string,
          limit: (input.limit as number) || 10,
          includeImages: true,
        });
        return JSON.stringify({
          total: result.meta.pagination.total,
          plants: result.data.map((p) => ({
            id: p.id,
            commonName: p.commonName,
            genus: p.genus,
            species: p.species,
            imageUrl: p.primaryImage?.url || null,
          })),
        });
      }

      case "get_plant_details": {
        const [plant, values, riskReduction] = await Promise.all([
          getPlant(input.plantId as string),
          getPlantValues(input.plantId as string),
          getPlantRiskReduction(input.plantId as string).catch(() => null),
        ]);
        return JSON.stringify({
          plant: {
            id: plant.id,
            commonName: plant.commonName,
            genus: plant.genus,
            species: plant.species,
            notes: plant.notes,
          },
          attributes: values.map((v) => ({
            attribute: v.attributeName || v.attributeId,
            value: v.resolved?.value || v.rawValue,
            description: v.resolved?.description,
            source: v.sourceId || undefined,
            sourceNotes: v.sourceValue || undefined,
            notes: v.notes || undefined,
          })),
          riskReduction: riskReduction
            ? {
                characterScore: riskReduction.characterScore,
                placement: riskReduction.placement,
                riskReductionText: riskReduction.riskReductionText,
                triggeredRules: riskReduction.triggeredRules,
              }
            : null,
        });
      }

      case "get_zone_recommendations": {
        const zone = input.zone as string;
        const zoneMap = await getZoneMap();
        const matchingIds: string[] = [];
        for (const [plantId, zones] of Object.entries(zoneMap)) {
          if (zones.includes(zone)) {
            matchingIds.push(plantId);
          }
        }
        // Fetch basic info + risk data for top matches to help agent filter
        const enriched = await Promise.all(
          matchingIds.slice(0, 20).map(async (plantId) => {
            try {
              const [plant, rr] = await Promise.all([
                getPlant(plantId),
                getPlantRiskReduction(plantId).catch(() => null),
              ]);
              return {
                plantId,
                commonName: plant.commonName,
                genus: plant.genus,
                species: plant.species,
                imageUrl: plant.primaryImage?.url || null,
                characterScore: rr?.characterScore ?? null,
                placement: rr?.placement ?? null,
                riskReductionText: rr?.riskReductionText ?? null,
                triggeredRules: rr?.triggeredRules ?? [],
              };
            } catch {
              return { plantId, commonName: "Unknown", characterScore: null };
            }
          })
        );
        // Sort by character score (lower = safer) so agent sees safest first
        enriched.sort((a, b) => (a.characterScore ?? 99) - (b.characterScore ?? 99));
        return JSON.stringify({
          zone,
          matchCount: matchingIds.length,
          plants: enriched,
          note: "Plants sorted by fire safety (lowest character score = safest). Check characterScore and placement before recommending. Do NOT recommend plants with characterScore > 10 for Zone 0-1.",
        });
      }

      case "get_plant_risk_reduction": {
        const rr = await getPlantRiskReduction(input.plantId as string);
        return JSON.stringify(rr);
      }

      case "display_plants": {
        const plantEntries = input.plants as {
          plantId: string;
          note?: string;
        }[];
        const cards = await Promise.all(
          plantEntries.map(async (entry) => {
            try {
              const [plant, values, riskReduction] = await Promise.all([
                getPlant(entry.plantId),
                getPlantValues(entry.plantId),
                getPlantRiskReduction(entry.plantId).catch(() => null),
              ]);

              const hizVals = values.filter(
                (v) => v.attributeId === HIZ_ATTRIBUTE_ID
              );
              const waterVal = values.find(
                (v) =>
                  v.attributeId === "d9174148-6563-4f92-9673-01feb6a529ce"
              );
              const nativeVal = values.find(
                (v) =>
                  v.attributeId === "d5fb9f61-41dd-4e4e-bc5e-47eb24ecab46"
              );
              const deerVal = values.find(
                (v) =>
                  v.attributeId === "ff4c4d0e-35d5-4804-aea3-2a6334ef8cb5"
              );
              const benefitsVals = values.filter(
                (v) =>
                  v.attributeId === "ff75e529-5b5c-4461-8191-0382e33a4bd5"
              );

              return {
                id: plant.id,
                commonName: plant.commonName,
                genus: plant.genus,
                species: plant.species,
                imageUrl: plant.primaryImage?.url || null,
                characterScore: riskReduction?.characterScore ?? null,
                placement: riskReduction?.placement ?? null,
                zones: (() => {
                  const allZones = hizVals
                    .map((v) => v.resolved?.value)
                    .filter(Boolean) as string[];
                  if (allZones.length === 0) return [];
                  const order = ["0-5", "5-10", "10-30", "30-100", "50-100"];
                  const closest = allZones.reduce((min, z) =>
                    order.indexOf(z) < order.indexOf(min) ? z : min
                  );
                  return [closest];
                })(),
                waterNeeds: waterVal?.resolved?.value || null,
                isNative: nativeVal?.resolved?.value === "Yes",
                isDeerResistant:
                  deerVal?.resolved?.value === "High (Usually)" ||
                  deerVal?.resolved?.value === "Some",
                isPollinatorFriendly: benefitsVals.some((v) =>
                  v.resolved?.value?.toLowerCase().includes("pollinator")
                ),
                note: entry.note || undefined,
              };
            } catch {
              return null;
            }
          })
        );
        const validCards = cards.filter(Boolean);
        return JSON.stringify({
          displayed: validCards.length,
          plantIds: validCards.map((c) => c!.id),
          _cards: validCards,
        });
      }

      case "get_user_preferences": {
        if (!context?.userId) {
          return JSON.stringify({
            preferences: {},
            note: "User is not logged in — no saved preferences available.",
          });
        }

        const profile = await db
          .select({ preferences: userProfiles.preferences })
          .from(userProfiles)
          .where(eq(userProfiles.userId, context.userId))
          .limit(1);

        const preferences =
          (profile[0]?.preferences as Record<string, unknown>) ?? {};
        return JSON.stringify({ preferences });
      }

      case "save_user_preference": {
        if (!context?.userId) {
          return JSON.stringify({
            error:
              "User is not logged in — preferences cannot be saved. Let the user know they can sign in to save preferences.",
          });
        }

        const key = input.key as string;
        const value = input.value;

        // Upsert the preference
        const existing = await db
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.userId, context.userId))
          .limit(1);

        let merged: Record<string, unknown>;

        if (existing.length > 0) {
          const current =
            (existing[0].preferences as Record<string, unknown>) ?? {};
          merged = { ...current, [key]: value };
          await db
            .update(userProfiles)
            .set({ preferences: merged })
            .where(eq(userProfiles.userId, context.userId));
        } else {
          merged = { [key]: value };
          await db.insert(userProfiles).values({
            userId: context.userId,
            preferences: merged,
          });
        }

        return JSON.stringify({
          saved: { key, value },
          allPreferences: merged,
        });
      }

      case "compare_plants": {
        const plantIds = input.plantIds as string[];
        const context = input.context as string | undefined;
        
        if (plantIds.length < 2 || plantIds.length > 3) {
          return JSON.stringify({ 
            error: "Can only compare 2-3 plants at a time" 
          });
        }

        // Fetch basic info for all plants to verify they exist and get names
        const plants = await Promise.all(
          plantIds.map(async (id) => {
            try {
              const plant = await getPlant(id);
              const riskReduction = await getPlantRiskReduction(id).catch(() => null);
              return {
                id: plant.id,
                commonName: plant.commonName,
                botanicalName: `${plant.genus} ${plant.species}`.trim(),
                characterScore: riskReduction?.characterScore || null,
              };
            } catch {
              return null;
            }
          })
        );

        const validPlants = plants.filter(Boolean);
        
        if (validPlants.length !== plantIds.length) {
          return JSON.stringify({ 
            error: "One or more plants not found" 
          });
        }

        // Generate comparison URL
        const compareUrl = `/plants/compare?ids=${plantIds.join(',')}`;
        
        // Create brief summary of key differences
        const plantNames = validPlants.map((p) => p!.commonName);
        const scores = validPlants.map((p) => p!.characterScore).filter(Boolean);
        
        let summary = `Comparing ${plantNames.join(', ')}`;
        if (context) {
          summary += ` ${context}`;
        }
        
        if (scores.length > 1) {
          const maxScore = Math.max(...scores.filter((s): s is number => s !== null));
          const minScore = Math.min(...scores.filter((s): s is number => s !== null));
          const bestPlant = validPlants.find((p) => p!.characterScore === maxScore)?.commonName;
          
          summary += `. Fire safety: ${bestPlant} has the highest fire character score (${maxScore}/100) vs ${minScore}/100.`;
        }

        return JSON.stringify({
          compareUrl,
          summary,
          plants: validPlants,
          message: `[View detailed comparison](${compareUrl})`,
        });
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ error: message });
  }
}
