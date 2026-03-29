import type Anthropic from "@anthropic-ai/sdk";
import {
  getPlants,
  getPlant,
  getPlantValues,
  getPlantRiskReduction,
  getValuesBulk,
} from "@/lib/api/lwf";

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
      "Get full details for a specific plant including all attribute values and fire risk info.",
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
      "Get fire risk reduction details for a specific plant — what makes it fire-reluctant or not.",
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
];

export async function executeTool(
  name: string,
  input: Record<string, unknown>
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
        const [plant, values] = await Promise.all([
          getPlant(input.plantId as string),
          getPlantValues(input.plantId as string),
        ]);
        return JSON.stringify({
          plant: {
            id: plant.id,
            commonName: plant.commonName,
            genus: plant.genus,
            species: plant.species,
          },
          values: values.map((v) => ({
            attribute: v.attributePath || v.attributeId,
            value: v.resolved?.value || v.value,
          })),
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

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ error: message });
  }
}
