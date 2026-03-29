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
            images: p.images?.slice(0, 1),
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
        const bulkResult = await getValuesBulk({
          attributeIds: [HIZ_ATTRIBUTE_ID],
          resolve: true,
        });
        // Filter to plants matching the requested zone
        const matching: { plantId: string; value: string }[] = [];
        if (bulkResult && typeof bulkResult === "object") {
          for (const [key, val] of Object.entries(bulkResult)) {
            const v = val as { value?: string; resolved?: { value?: string } };
            const resolved = v.resolved?.value || v.value || "";
            if (resolved.includes(zone)) {
              matching.push({
                plantId: key.split("/")[0] || key,
                value: resolved,
              });
            }
          }
        }
        return JSON.stringify({
          zone,
          matchCount: matching.length,
          plants: matching.slice(0, 15),
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
                zones: hizVals
                  .map((v) => v.resolved?.value)
                  .filter(Boolean) as string[],
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

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ error: message });
  }
}
