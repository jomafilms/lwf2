/**
 * Nursery Availability Utilities
 * Calculate which nurseries carry plants from a list
 */

import { db, nurseries, nurseryInventory } from "@lwf/database";
import { eq, inArray, and } from "drizzle-orm";

export interface NurseryMatch {
  nursery: {
    id: string;
    name: string;
  };
  availablePlants: string[]; // plant IDs
  percentage: number; // 0-100
  inventoryCount: number;
}

/**
 * Get nursery availability for a list of plants
 * @param plantIds Array of LWF plant IDs
 * @returns Array of nursery matches sorted by percentage (highest first)
 */
export async function getNurseryAvailability(plantIds: string[]): Promise<NurseryMatch[]> {
  if (plantIds.length === 0) return [];

  // Get all nursery inventory for the given plants
  const inventoryResults = await db
    .select({
      nurseryId: nurseryInventory.nurseryId,
      lwfPlantId: nurseryInventory.lwfPlantId,
      nursery: {
        id: nurseries.id,
        name: nurseries.name,
      },
    })
    .from(nurseryInventory)
    .leftJoin(nurseries, eq(nurseries.id, nurseryInventory.nurseryId))
    .where(
      and(
        inArray(nurseryInventory.lwfPlantId, plantIds),
        // Only include available inventory
        eq(nurseryInventory.availability, "in_stock")
      )
    );

  // Group by nursery
  const nurseryMap = new Map<string, NurseryMatch>();
  
  for (const item of inventoryResults) {
    if (!item.nursery || !item.lwfPlantId) continue;
    
    const nurseryId = item.nursery.id;
    
    if (!nurseryMap.has(nurseryId)) {
      nurseryMap.set(nurseryId, {
        nursery: {
          id: item.nursery.id,
          name: item.nursery.name,
        },
        availablePlants: [],
        percentage: 0,
        inventoryCount: 0,
      });
    }

    const match = nurseryMap.get(nurseryId)!;
    if (!match.availablePlants.includes(item.lwfPlantId)) {
      match.availablePlants.push(item.lwfPlantId);
      match.inventoryCount++;
    }
  }

  // Calculate percentages and sort
  const results = Array.from(nurseryMap.values()).map(match => ({
    ...match,
    percentage: Math.round((match.inventoryCount / plantIds.length) * 100),
  }));

  // Sort by percentage (highest first), then by name
  return results.sort((a, b) => {
    if (b.percentage !== a.percentage) {
      return b.percentage - a.percentage;
    }
    return a.nursery.name.localeCompare(b.nursery.name);
  });
}

/**
 * Get fire zone summary for a list of plants
 * @param plantIds Array of LWF plant IDs
 * @returns Fire zone breakdown and average character score
 */
export async function getFireZoneSummary(plantIds: string[]) {
  // This would require plant values from LWF API
  // For now, return a placeholder structure
  return {
    totalPlants: plantIds.length,
    zoneBreakdown: {
      zone0: 0, // Defense zone
      zone1: 0, // Near home
      zone2: 0, // Extended zone
    },
    averageCharacterScore: null as number | null,
    averageScoreText: "Unknown" as string,
  };
}