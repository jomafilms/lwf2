/**
 * Score calculation library for landscape plans.
 *
 * Calculates four scores (0–100): Fire Safety, Pollinator,
 * Water Efficiency, and Deer Resistance.
 */

import type {
  PlanPlant,
  ScoreResult,
  ScoreBreakdownItem,
  CategoryScore,
  ScoreSuggestion,
  Zone,
} from "./types";

// ─── Constants ───────────────────────────────────────────────────────────────

/** Zone placement compliance mapping: placementCode → allowed zones */
const PLACEMENT_ZONE_MAP: Record<string, Zone[]> = {
  A: ["zone0", "zone1", "zone2"], // all zones
  B: ["zone1", "zone2"], // zones 1-2 only
  C: ["zone2"], // zone 2 only (furthest from structure)
  D: ["zone1", "zone2"], // similar to B
};

/** Target plant counts per zone for coverage calculation */
const ZONE_COVERAGE_TARGETS: Record<Zone, number> = {
  zone0: 3, // closest to structure — fewer, carefully chosen
  zone1: 5, // transition zone
  zone2: 8, // outer zone — more plants
};

/** Water needs value → score mapping */
const WATER_SCORE_MAP: Record<string, number> = {
  low: 100,
  "very low": 100,
  "low to moderate": 80,
  moderate: 60,
  "moderate to high": 40,
  high: 20,
  "very high": 20,
};

/** Deer resistance value → score mapping */
const DEER_SCORE_MAP: Record<string, number> = {
  high: 100,
  "highly resistant": 100,
  moderate: 60,
  "moderately resistant": 60,
  low: 20,
  "not resistant": 20,
  none: 20,
};

/** Bloom seasons for pollinator diversity scoring */
const BLOOM_SEASONS = ["spring", "summer", "fall", "winter"] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function plantName(plant: PlanPlant): string {
  return plant.plantName || plant.plantId;
}

function normalizeValue(value: string): string {
  return value.toLowerCase().trim();
}

function findAttribute(
  attributes: Record<string, string> | undefined,
  ...keys: string[]
): string | undefined {
  if (!attributes) return undefined;
  for (const key of keys) {
    const lower = key.toLowerCase();
    for (const [attrName, attrValue] of Object.entries(attributes)) {
      if (attrName.toLowerCase().includes(lower)) {
        return attrValue;
      }
    }
  }
  return undefined;
}

// ─── Fire Safety Score ───────────────────────────────────────────────────────

function calculateFireScore(plants: PlanPlant[]): CategoryScore {
  if (plants.length === 0) {
    return { score: 0, breakdown: [] };
  }

  const breakdown: ScoreBreakdownItem[] = [];
  let totalCharacterScore = 0;
  let charScoreCount = 0;
  let compliantCount = 0;

  // Per-zone plant counts for coverage
  const zoneCounts: Record<Zone, number> = { zone0: 0, zone1: 0, zone2: 0 };

  for (const plant of plants) {
    zoneCounts[plant.zone]++;

    // Character score component
    const charScore = plant.characterScore ?? 50; // default to neutral
    totalCharacterScore += charScore;
    charScoreCount++;

    // Zone compliance check
    const code = plant.placementCode?.toUpperCase() ?? "A";
    const allowedZones = PLACEMENT_ZONE_MAP[code] ?? PLACEMENT_ZONE_MAP.A;
    const isCompliant = allowedZones.includes(plant.zone);

    if (isCompliant) {
      compliantCount++;
      breakdown.push({
        plantId: plant.plantId,
        plantName: plantName(plant),
        contribution: clamp(charScore, -100, 100),
        reason: `Character score ${charScore}/100, correctly placed in ${plant.zone}`,
      });
    } else {
      breakdown.push({
        plantId: plant.plantId,
        plantName: plantName(plant),
        contribution: clamp(charScore * -0.5, -100, 0),
        reason: `Placement code ${code} not recommended for ${plant.zone} (should be ${allowedZones.join(", ")})`,
      });
    }
  }

  // Average character score (0–100)
  const avgCharScore =
    charScoreCount > 0 ? totalCharacterScore / charScoreCount : 0;

  // Zone compliance percentage (0–1)
  const compliancePct =
    plants.length > 0 ? compliantCount / plants.length : 0;

  // Coverage factor: how well are zones filled? (0–1)
  let coverageSum = 0;
  let zoneCount = 0;
  for (const zone of Object.keys(ZONE_COVERAGE_TARGETS) as Zone[]) {
    const target = ZONE_COVERAGE_TARGETS[zone];
    const actual = zoneCounts[zone];
    coverageSum += Math.min(actual / target, 1);
    zoneCount++;
  }
  const coverageFactor = zoneCount > 0 ? coverageSum / zoneCount : 0;

  // Final formula: avg(characterScore) × compliance% × coverage
  const score = clamp(avgCharScore * compliancePct * coverageFactor);

  return { score, breakdown };
}

// ─── Pollinator Score ────────────────────────────────────────────────────────

function calculatePollinatorScore(plants: PlanPlant[]): CategoryScore {
  if (plants.length === 0) {
    return { score: 0, breakdown: [] };
  }

  const breakdown: ScoreBreakdownItem[] = [];
  let pollinatorCount = 0;
  const bloomSeasons = new Set<string>();

  for (const plant of plants) {
    const pollinatorVal = findAttribute(
      plant.attributes,
      "pollinator",
      "wildlife",
      "butterfly",
      "bee",
      "hummingbird",
    );

    const isPollinatorFriendly = pollinatorVal
      ? !["none", "no", "false", "0"].includes(normalizeValue(pollinatorVal))
      : false;

    if (isPollinatorFriendly) {
      pollinatorCount++;
      breakdown.push({
        plantId: plant.plantId,
        plantName: plantName(plant),
        contribution: 100,
        reason: `Supports pollinators: ${pollinatorVal}`,
      });
    } else {
      breakdown.push({
        plantId: plant.plantId,
        plantName: plantName(plant),
        contribution: 0,
        reason: "No pollinator support identified",
      });
    }

    // Check bloom time for diversity
    const bloomVal = findAttribute(plant.attributes, "bloom", "flower");
    if (bloomVal) {
      const lower = normalizeValue(bloomVal);
      for (const season of BLOOM_SEASONS) {
        if (lower.includes(season)) {
          bloomSeasons.add(season);
        }
      }
    }
  }

  // Pollinator percentage (0–1)
  const pollinatorPct = pollinatorCount / plants.length;

  // Diversity bonus: seasons covered / total seasons (0–1)
  const diversityBonus = bloomSeasons.size / BLOOM_SEASONS.length;

  // Formula: pollinator_pct × 70 + diversity_bonus × 30
  const score = clamp(pollinatorPct * 70 + diversityBonus * 30);

  return { score, breakdown };
}

// ─── Water Efficiency Score ──────────────────────────────────────────────────

function calculateWaterScore(plants: PlanPlant[]): CategoryScore {
  if (plants.length === 0) {
    return { score: 0, breakdown: [] };
  }

  const breakdown: ScoreBreakdownItem[] = [];
  let totalWaterPoints = 0;

  for (const plant of plants) {
    const waterVal = findAttribute(plant.attributes, "water", "irrigation");
    let waterPoints = 60; // default to moderate

    if (waterVal) {
      const normalized = normalizeValue(waterVal);
      // Try exact match first, then partial
      waterPoints =
        WATER_SCORE_MAP[normalized] ??
        Object.entries(WATER_SCORE_MAP).find(([key]) =>
          normalized.includes(key),
        )?.[1] ??
        60;
    }

    totalWaterPoints += waterPoints;
    breakdown.push({
      plantId: plant.plantId,
      plantName: plantName(plant),
      contribution: waterPoints,
      reason: waterVal
        ? `Water needs: ${waterVal} (${waterPoints}/100)`
        : "Water needs unknown — scored as moderate",
    });
  }

  const score = clamp(totalWaterPoints / plants.length);

  return { score, breakdown };
}

// ─── Deer Resistance Score ───────────────────────────────────────────────────

function calculateDeerScore(plants: PlanPlant[]): CategoryScore {
  if (plants.length === 0) {
    return { score: 0, breakdown: [] };
  }

  const breakdown: ScoreBreakdownItem[] = [];
  let totalDeerPoints = 0;

  for (const plant of plants) {
    const deerVal = findAttribute(plant.attributes, "deer");
    let deerPoints = 60; // default to moderate

    if (deerVal) {
      const normalized = normalizeValue(deerVal);
      deerPoints =
        DEER_SCORE_MAP[normalized] ??
        Object.entries(DEER_SCORE_MAP).find(([key]) =>
          normalized.includes(key),
        )?.[1] ??
        60;
    }

    totalDeerPoints += deerPoints;
    breakdown.push({
      plantId: plant.plantId,
      plantName: plantName(plant),
      contribution: deerPoints,
      reason: deerVal
        ? `Deer resistance: ${deerVal} (${deerPoints}/100)`
        : "Deer resistance unknown — scored as moderate",
    });
  }

  const score = clamp(totalDeerPoints / plants.length);

  return { score, breakdown };
}

// ─── Main Calculator ─────────────────────────────────────────────────────────

export function calculateScores(plants: PlanPlant[]): ScoreResult {
  return {
    fire: calculateFireScore(plants),
    pollinator: calculatePollinatorScore(plants),
    water: calculateWaterScore(plants),
    deer: calculateDeerScore(plants),
  };
}

// ─── Suggestion Generator ────────────────────────────────────────────────────

export function generateSuggestions(
  scores: ScoreResult,
  plants: PlanPlant[],
): ScoreSuggestion[] {
  const suggestions: ScoreSuggestion[] = [];

  // Fire suggestions: flag non-compliant placements
  for (const item of scores.fire.breakdown) {
    if (item.contribution < 0) {
      const plant = plants.find((p) => p.plantId === item.plantId);
      if (plant) {
        const code = plant.placementCode?.toUpperCase() ?? "A";
        const allowedZones = PLACEMENT_ZONE_MAP[code] ?? PLACEMENT_ZONE_MAP.A;
        suggestions.push({
          category: "fire",
          plantId: plant.plantId,
          plantName: plantName(plant),
          suggestion: `Move ${plantName(plant)} to ${allowedZones[0]} (currently in ${plant.zone}, not recommended for placement code ${code})`,
          estimatedImprovement: Math.abs(item.contribution),
        });
      }
    }
  }

  // Water suggestions: flag high-water plants
  for (const item of scores.water.breakdown) {
    if (item.contribution <= 40) {
      suggestions.push({
        category: "water",
        plantId: item.plantId,
        plantName: item.plantName,
        suggestion: `Replace ${item.plantName} with a low-water alternative to improve water efficiency by ~${60 - item.contribution} points`,
        estimatedImprovement: 60 - item.contribution,
      });
    }
  }

  // Deer suggestions: flag low-resistance plants
  for (const item of scores.deer.breakdown) {
    if (item.contribution <= 40) {
      suggestions.push({
        category: "deer",
        plantId: item.plantId,
        plantName: item.plantName,
        suggestion: `Replace ${item.plantName} with a deer-resistant alternative to improve deer resistance by ~${60 - item.contribution} points`,
        estimatedImprovement: 60 - item.contribution,
      });
    }
  }

  // Pollinator: if score is low, suggest adding pollinator-friendly plants
  if (scores.pollinator.score < 50) {
    const nonPollinators = scores.pollinator.breakdown.filter(
      (b) => b.contribution === 0,
    );
    for (const item of nonPollinators.slice(0, 3)) {
      suggestions.push({
        category: "pollinator",
        plantId: item.plantId,
        plantName: item.plantName,
        suggestion: `Replace ${item.plantName} with a pollinator-friendly plant to improve pollinator score`,
        estimatedImprovement: Math.round(70 / plants.length),
      });
    }
  }

  // Sort by estimated improvement descending
  suggestions.sort((a, b) => b.estimatedImprovement - a.estimatedImprovement);

  return suggestions;
}
