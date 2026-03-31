/**
 * Plant Data Presentation Layer
 * 
 * Maps raw API attribute values to human-friendly display format.
 * Only shows fields that Charisse approved via filter-presets columns.
 * Everything else is backend-only.
 */

import type { Plant, ResolvedValue } from "@lwf/types";

// ─── Shared Helpers ─────────────────────────────────────────────────────────

/** Canonical botanical name from a Plant object. */
export function getBotanicalName(plant: Pick<Plant, "genus" | "species">): string {
  return [plant.genus, plant.species].filter(Boolean).join(" ");
}

/** Plant image URL with fallback to images array (API shape varies). */
export function getPlantImageUrl(plant: Plant): string | undefined {
  return plant.primaryImage?.url ||
    (plant as unknown as { images?: { url: string }[] })?.images?.[0]?.url;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlantPresentation {
  // Hero section (always show)
  zones: ZoneBadge[];
  characterScore: { value: number; label: string; level: "low" | "moderate" | "high" } | null;
  listChoice: string | null; // "Approved", "Consider", "Avoid", etc.

  // Fire section (show prominently)
  flammabilityNotes: string | null;
  riskMitigationNotes: string | null;

  // Quick facts (badges)
  plantStructure: string | null;   // "Shrub", "Tree", "Groundcover"
  height: string | null;           // "3-6 ft"
  width: string | null;            // "4-8 ft"  
  lightNeeds: string | null;       // "Full Sun", "Partial Shade"
  waterNeeds: string | null;       // "Low", "Moderate", "High"
  droughtTolerant: boolean | null;
  nativeStatus: string | null;     // "Native to Oregon", or null
  deerResistance: string | null;   // "Resistant", "Sometimes Browsed", etc.
  evergreen: boolean | null;
  flowerColor: string | null;

  // Benefits & cautions
  benefits: string[];              // ["Pollinator", "Bird habitat", "Erosion control"]
  invasive: string | null;         // Warning text if invasive
  restrictions: string | null;     // City restrictions

  // All values (for "show more" / advanced view)
  allDisplayValues: DisplayValue[];
}

export interface ZoneBadge {
  zone: string;       // "0-5", "10-30", etc.
  label: string;      // "Zone 0 (0-5ft)"
  description?: string;
}

export interface DisplayValue {
  label: string;
  value: string;
  sourceId?: string;
  notes?: string;
}

// ─── Attribute name mapping ──────────────────────────────────────────────────

/** Fields to HIDE from public display (backend-only) */
const HIDDEN_ATTRIBUTES = new Set([
  // Numeric column headers (backend-only)
  "2", "3", "4", "7", "9", "11", "13", "18", "20",
  // Boolean "Has X" flags (backend calculation)
  "Has Availability", "Has Climate Rating", "Has Deer Resistance",
  "Has Drought Tolerant", "Has Easy to Grow", "Has Edible Plant",
  "Has Erosion Control", "Has Flammability Rating", "Has Landscape Use",
  "Has Native Status", "Has Soils Rating", "Has Water Amount",
  // Calculation intermediaries
  "Value Sum Total", "Wildlife Sum", "Wildlife Sum (Calculated)",
  "Wildlife Sum Component", "Invasive Component",
  // Already shown in main sections (don't duplicate in "Show all data")
  "Flammability Notes", "Risk Reduction Notes - Best Practices",
  "Flammability",
  // Internal
  "Shrub", "<2 ft tall",
]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findValue(values: ResolvedValue[], name: string): string | null {
  const v = values.find(
    (val) => val.attributeName?.toLowerCase() === name.toLowerCase()
  );
  return v?.resolved?.value?.toString() || v?.rawValue || null;
}

function findAllValues(values: ResolvedValue[], name: string): ResolvedValue[] {
  return values.filter(
    (val) => val.attributeName?.toLowerCase() === name.toLowerCase()
  );
}

function findBoolean(values: ResolvedValue[], name: string): boolean | null {
  const v = findValue(values, name);
  if (v === null) return null;
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return null;
}

// ─── Character Score ─────────────────────────────────────────────────────────

function parseCharacterScore(
  values: ResolvedValue[]
): PlantPresentation["characterScore"] {
  const raw = findValue(values, "Character Score");
  if (!raw) return null;
  const num = parseInt(raw, 10);
  if (isNaN(num)) return null;

  let label: string;
  let level: "low" | "moderate" | "high";

  if (num <= 3) {
    label = "Low flammability";
    level = "low";
  } else if (num <= 6) {
    label = "Moderate flammability";
    level = "moderate";
  } else {
    label = "High flammability";
    level = "high";
  }

  return { value: num, label, level };
}

// ─── Height ──────────────────────────────────────────────────────────────────

function parseHeight(values: ResolvedValue[]): string | null {
  const min = findValue(values, "Min Mature Height");
  const max = findValue(values, "Max Mature Height");
  if (!min && !max) return null;
  if (min && max && min !== max) return `${min}–${max} ft`;
  return `${max || min} ft`;
}

// ─── Benefits ────────────────────────────────────────────────────────────────

function parseBenefits(values: ResolvedValue[]): string[] {
  const benefitVals = findAllValues(values, "Benefits");
  return benefitVals
    .map((v) => v.resolved?.value?.toString() || v.rawValue)
    .filter(Boolean) as string[];
}

// ─── Zone Badges ─────────────────────────────────────────────────────────────

const ZONE_LABELS: Record<string, string> = {
  "0-5": "Zone 0 (0-5ft)",
  "5-10": "Zone 1 (5-10ft)",
  "10-30": "Zone 1 (10-30ft)",
  "30-100": "Zone 2 (30-100ft)",
  "50-100": "Zone 2 (50-100ft)",
};

function parseZones(values: ResolvedValue[]): ZoneBadge[] {
  const hizValues = findAllValues(values, "Home Ignition Zone (HIZ)");
  return hizValues
    .map((v) => {
      const zone = v.resolved?.value?.toString();
      if (!zone) return null;
      return {
        zone,
        label: ZONE_LABELS[zone] || `Zone (${zone}ft)`,
        description: v.resolved?.description || undefined,
      };
    })
    .filter(Boolean) as ZoneBadge[];
}

// ─── Main Presenter ──────────────────────────────────────────────────────────

export function presentPlant(values: ResolvedValue[]): PlantPresentation {
  // Filter to only displayable values for "all values" section
  const displayableValues = values
    .filter((v) => !HIDDEN_ATTRIBUTES.has(v.attributeName || ""))
    .filter((v) => v.attributeName !== "Home Ignition Zone (HIZ)") // shown as badges
    .filter((v) => v.attributeName !== "Character Score") // shown as score widget
    .filter((v) => v.attributeName !== "List Choice") // shown separately
    .map((v) => ({
      label: v.attributeName || "Unknown",
      value: v.resolved?.value?.toString() || v.rawValue || "",
      sourceId: v.sourceId || undefined,
      notes: v.notes || undefined,
    }));

  return {
    zones: parseZones(values),
    characterScore: parseCharacterScore(values),
    listChoice: findValue(values, "List Choice"),

    flammabilityNotes: findValue(values, "Flammability Notes"),
    riskMitigationNotes: findValue(values, "Risk Reduction Notes - Best Practices"),

    plantStructure: findValue(values, "Plant Structure"),
    height: parseHeight(values),
    width: null, // not in current data — add when available
    lightNeeds: findValue(values, "Light Needs"),
    waterNeeds: findValue(values, "Has Water Amount") === "true" 
      ? findValue(values, "Water Amount") 
      : null,
    droughtTolerant: findBoolean(values, "Drought Tolerant"),
    nativeStatus: findValue(values, "Has Native Status") === "true" 
      ? "Native" 
      : null,
    deerResistance: (() => {
      const raw = findValue(values, "Deer Resistance");
      if (raw === "High (Usually)" || raw === "Some") return raw;
      if (findBoolean(values, "Has Deer Resistance")) return "Yes";
      return null;
    })(),
    evergreen: findBoolean(values, "Evergreen"),
    flowerColor: findValue(values, "Flower Color"),

    benefits: parseBenefits(values),
    invasive: (() => {
      const v = findValue(values, "Invasive Component");
      if (!v) return null;
      // Numeric score: -1 = not invasive, 0 = unknown, positive = invasive
      const num = parseInt(v, 10);
      if (!isNaN(num)) {
        if (num <= 0) return null; // Not invasive or unknown
        return "Yes — check local invasive species lists";
      }
      // Text values
      if (v === "false" || v === "none" || v === "None" || v === "No") return null;
      return v;
    })(),
    restrictions: null, // add when restriction data available

    allDisplayValues: displayableValues,
  };
}
