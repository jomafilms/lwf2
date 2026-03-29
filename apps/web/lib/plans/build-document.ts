/**
 * Plan Document Builder
 *
 * Takes raw plan data (plantPlacements) and enriches it with:
 * - Plant details from LWF API (name, botanical name, image)
 * - Nursery pricing from our DB
 * - Zone grouping
 * - Cost calculations
 *
 * Returns structured document data ready for rendering.
 */

import { getPlant } from "@/lib/api/lwf";
import { db, nurseries, nurseryInventory } from "@lwf/database";
import { eq, inArray } from "drizzle-orm";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlantPlacement {
  plantId: string;
  zone: number; // 0, 1, 2
  quantity: number;
  containerSize?: string;
}

export interface DocumentPlant {
  plantId: string;
  commonName: string;
  botanicalName: string;
  imageUrl: string | null;
  quantity: number;
  containerSize: string;
  unitPrice: number | null; // cents
  subtotal: number | null; // cents
  nurserySource: string | null;
}

export interface DocumentZone {
  zone: number;
  label: string;
  description: string;
  plants: DocumentPlant[];
  subtotal: number | null; // cents
}

export interface NurserySource {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  website: string | null;
  plantCount: number;
}

export interface PlanDocumentData {
  planId: string;
  planName: string;
  propertyAddress: string;
  generatedAt: string;
  zones: DocumentZone[];
  estimatedTotal: number | null; // cents
  nurserySources: NurserySource[];
}

// ─── Zone Metadata ───────────────────────────────────────────────────────────

const ZONE_META: Record<number, { label: string; description: string }> = {
  0: { label: "Zone 0 (0–5 ft)", description: "Immediate — Non-combustible" },
  1: { label: "Zone 1 (5–30 ft)", description: "Lean, Clean & Green" },
  2: { label: "Zone 2 (30–100 ft)", description: "Reduced Fuel" },
};

// ─── Builder ─────────────────────────────────────────────────────────────────

export async function buildPlanDocument(opts: {
  planId: string;
  planName: string;
  propertyAddress: string;
  plantPlacements: PlantPlacement[];
}): Promise<PlanDocumentData> {
  const { planId, planName, propertyAddress, plantPlacements } = opts;

  // Unique plant IDs
  const plantIds = [...new Set(plantPlacements.map((p) => p.plantId))];

  // Fetch plant details from LWF API (parallel)
  const plantDetailsMap = new Map<
    string,
    { commonName: string; botanicalName: string; imageUrl: string | null }
  >();

  const plantResults = await Promise.allSettled(
    plantIds.map(async (id) => {
      const plant = await getPlant(id);
      return {
        id,
        commonName: plant.commonName || "Unknown",
        botanicalName: [plant.genus, plant.species]
          .filter(Boolean)
          .join(" "),
        imageUrl: plant.primaryImage?.url ?? null,
      };
    })
  );

  for (const result of plantResults) {
    if (result.status === "fulfilled") {
      plantDetailsMap.set(result.value.id, result.value);
    }
  }

  // Fetch nursery inventory for these plants
  const inventoryRows =
    plantIds.length > 0
      ? await db
          .select({
            lwfPlantId: nurseryInventory.lwfPlantId,
            nurseryId: nurseryInventory.nurseryId,
            price: nurseryInventory.price,
            containerSize: nurseryInventory.containerSize,
            commonName: nurseryInventory.commonName,
          })
          .from(nurseryInventory)
          .where(inArray(nurseryInventory.lwfPlantId, plantIds))
      : [];

  // Build a price lookup: plantId -> cheapest inventory row
  const priceLookup = new Map<
    string,
    { price: number | null; containerSize: string | null; nurseryId: string | null }
  >();
  for (const row of inventoryRows) {
    if (!row.lwfPlantId) continue;
    const existing = priceLookup.get(row.lwfPlantId);
    if (
      !existing ||
      (row.price !== null &&
        (existing.price === null || row.price < existing.price))
    ) {
      priceLookup.set(row.lwfPlantId, {
        price: row.price,
        containerSize: row.containerSize,
        nurseryId: row.nurseryId,
      });
    }
  }

  // Fetch nursery details for sources
  const nurseryIds = [
    ...new Set(inventoryRows.map((r) => r.nurseryId).filter(Boolean)),
  ] as string[];
  const nurseryMap = new Map<
    string,
    { name: string; city: string | null; state: string | null; website: string | null }
  >();

  if (nurseryIds.length > 0) {
    const nurseryRows = await db
      .select({
        id: nurseries.id,
        name: nurseries.name,
        city: nurseries.city,
        state: nurseries.state,
        website: nurseries.website,
      })
      .from(nurseries)
      .where(inArray(nurseries.id, nurseryIds));

    for (const n of nurseryRows) {
      nurseryMap.set(n.id, n);
    }
  }

  // Group placements by zone
  const zoneGroups = new Map<number, PlantPlacement[]>();
  for (const p of plantPlacements) {
    const existing = zoneGroups.get(p.zone) ?? [];
    existing.push(p);
    zoneGroups.set(p.zone, existing);
  }

  // Build zone documents
  const zones: DocumentZone[] = [];
  let estimatedTotal: number | null = 0;
  const nurseryPlantCounts = new Map<string, number>();

  for (const zoneNum of [0, 1, 2]) {
    const placements = zoneGroups.get(zoneNum);
    if (!placements || placements.length === 0) continue;

    const meta = ZONE_META[zoneNum] ?? {
      label: `Zone ${zoneNum}`,
      description: "",
    };

    let zoneSubtotal: number | null = 0;
    const zonePlants: DocumentPlant[] = [];

    for (const placement of placements) {
      const details = plantDetailsMap.get(placement.plantId);
      const pricing = priceLookup.get(placement.plantId);

      const unitPrice = pricing?.price ?? null;
      const containerSize =
        placement.containerSize ?? pricing?.containerSize ?? "1 gal";
      const subtotal =
        unitPrice !== null ? unitPrice * placement.quantity : null;

      if (subtotal !== null && zoneSubtotal !== null) {
        zoneSubtotal += subtotal;
      } else if (subtotal === null) {
        zoneSubtotal = null;
      }

      // Track nursery source
      if (pricing?.nurseryId) {
        nurseryPlantCounts.set(
          pricing.nurseryId,
          (nurseryPlantCounts.get(pricing.nurseryId) ?? 0) + 1
        );
      }

      const nurseryName = pricing?.nurseryId
        ? nurseryMap.get(pricing.nurseryId)?.name ?? null
        : null;

      zonePlants.push({
        plantId: placement.plantId,
        commonName: details?.commonName ?? "Unknown Plant",
        botanicalName: details?.botanicalName ?? "",
        imageUrl: details?.imageUrl ?? null,
        quantity: placement.quantity,
        containerSize,
        unitPrice,
        subtotal,
        nurserySource: nurseryName,
      });
    }

    if (zoneSubtotal !== null && estimatedTotal !== null) {
      estimatedTotal += zoneSubtotal;
    } else {
      estimatedTotal = null;
    }

    zones.push({
      zone: zoneNum,
      label: meta.label,
      description: meta.description,
      plants: zonePlants,
      subtotal: zoneSubtotal,
    });
  }

  // Build nursery sources list
  const nurserySources: NurserySource[] = [];
  for (const [nId, count] of nurseryPlantCounts) {
    const n = nurseryMap.get(nId);
    if (n) {
      nurserySources.push({
        id: nId,
        name: n.name,
        city: n.city,
        state: n.state,
        website: n.website,
        plantCount: count,
      });
    }
  }
  nurserySources.sort((a, b) => b.plantCount - a.plantCount);

  return {
    planId,
    planName,
    propertyAddress,
    generatedAt: new Date().toISOString(),
    zones,
    estimatedTotal,
    nurserySources,
  };
}
