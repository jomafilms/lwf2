/**
 * LWF API Types
 *
 * Type definitions for the Living With Fire plant database API.
 * Based on: https://lwf-api.vercel.app/api/v1/docs-raw
 */

// ─── Core ────────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

// ─── Plants ──────────────────────────────────────────────────────────────────

export interface PlantImage {
  url: string;
  type: string;
  source: string;
}

export interface Plant {
  id: string;
  genus: string;
  species: string;
  subspeciesVarieties: string | null;
  commonName: string;
  urls: string[] | null;
  notes: string | null;
  lastUpdated: string;
  primaryImage: PlantImage | null;
}

export interface PlantImagesResponse {
  plantId: string;
  images: PlantImage[];
}

// ─── Attributes & Values ─────────────────────────────────────────────────────

export interface AttributeValueAllowed {
  id: string;
  displayName?: string;
  description?: string;
}

export interface Attribute {
  id: string;
  name: string;
  parentAttributeId: string | null;
  valueType: string;
  selectionType: string;
  valuesAllowed: AttributeValueAllowed[] | null;
  valueUnits: string | null;
  notes: string | null;
  isCalculated: boolean;
  children: Attribute[];
}

export interface ResolvedValueData {
  id?: string;
  value: string;
  raw: string;
  type: string;
  description?: string;
}

export interface ResolvedValue {
  id: string;
  attributeId: string;
  attributeName: string;
  plantId: string;
  rawValue: string;
  resolved: ResolvedValueData;
  sourceId: string | null;
  sourceValue: string | null;
  urls: string[] | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
}

// ─── Risk Reduction ──────────────────────────────────────────────────────────

export interface RiskReduction {
  plantId: string;
  plant: {
    genus: string;
    species: string;
    commonName: string;
  };
  characterScore: number;
  placement: {
    code: string;
    meaning: string;
  };
  riskReductionText: string;
  triggeredRules: string[];
}

// ─── Filter Presets ──────────────────────────────────────────────────────────

export interface FilterPreset {
  id: string;
  name: string;
  description: string | null;
  filters: Record<string, unknown>;
}

// ─── Key Terms ───────────────────────────────────────────────────────────────

export interface KeyTerm {
  id: string;
  term: string;
  definition: string;
  category: string | null;
}

// ─── Nurseries (LWF API) ────────────────────────────────────────────────────

export interface Nursery {
  id: string;
  name: string;
  location: string | null;
  website: string | null;
  notes: string | null;
}

// ─── Resources ───────────────────────────────────────────────────────────────

export interface Resource {
  title: string;
  url: string;
  description: string | null;
}

export interface ResourceSection {
  id: string;
  name: string;
  resources: Resource[];
}

// ─── Sources ─────────────────────────────────────────────────────────────────

export interface Source {
  id: string;
  name: string;
  url: string | null;
  region: string | null;
  description: string | null;
}

// ─── Status ──────────────────────────────────────────────────────────────────

export interface ApiStatus {
  status: string;
  version: string;
  timestamp: string;
}
