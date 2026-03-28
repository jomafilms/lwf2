/**
 * LWF API TypeScript Types
 *
 * Generated from the OpenAPI spec at https://lwf-api.vercel.app/api/v1/docs-raw
 * Source of truth for all LWF API response shapes.
 */

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: PaginationMeta;
  };
}

// ─── Plants ──────────────────────────────────────────────────────────────────

export interface Plant {
  id: string;
  genus: string;
  species: string;
  subspeciesVarieties?: string | null;
  commonName?: string | null;
  urls?: string[] | null;
  notes?: string | null;
  lastUpdated?: string | null;
  /** Included when fetched with includeImages or single-plant endpoint */
  primaryImage?: PlantImage | null;
  /** Included on single-plant detail endpoint */
  images?: PlantImage[];
}

// ─── Plant Images ────────────────────────────────────────────────────────────

export interface PlantImage {
  id: string;
  plantId: string;
  imageUrl: string;
  imageType?: string | null;
  source?: string | null;
  copyright?: string | null;
  isPrimary: boolean;
  matchScore?: number | null;
  needsVerification?: boolean | null;
}

export interface PlantImagesResponse {
  plantId: string;
  primary: PlantImage | null;
  images: PlantImage[];
}

// ─── Attributes ──────────────────────────────────────────────────────────────

export type ValueType = 'text' | 'boolean' | 'integer' | 'decimal';
export type SelectionType = 'single' | 'multi';

export interface AllowedValue {
  id: string;
  displayName: string;
  description?: string | null;
}

export interface Attribute {
  id: string;
  name: string;
  parentAttributeId?: string | null;
  valueType: ValueType;
  selectionType?: SelectionType;
  valuesAllowed?: AllowedValue[] | null;
  valueUnits?: string | null;
  notes?: string | null;
  isCalculated?: boolean;
  calculatedFrom?: string[] | null;
  calculationLogic?: string | null;
  calculationDescription?: string | null;
  /** Present in hierarchical endpoint */
  children?: Attribute[];
}

// ─── Resolved Values ─────────────────────────────────────────────────────────

export type ResolvedType = 'enum' | 'boolean' | 'integer' | 'number' | 'text' | 'reference';

export interface ResolvedInfo {
  id: string;
  value: string;
  description?: string | null;
  raw: string;
  type: ResolvedType;
}

export interface ResolvedValue {
  id: string;
  attributeId: string;
  attributeName: string;
  plantId: string;
  rawValue?: string | null;
  resolved?: ResolvedInfo;
  sourceId?: string | null;
  sourceValue?: string | null;
  urls?: string[] | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

// ─── Risk Reduction ──────────────────────────────────────────────────────────

export interface RiskReductionPlant {
  genus: string;
  species: string;
  commonName?: string | null;
}

export interface RiskReductionPlacement {
  code?: string | null;
  meaning?: string | null;
}

export interface RiskReduction {
  plantId: string;
  plant: RiskReductionPlant;
  characterScore?: number | null;
  placement: RiskReductionPlacement;
  riskReductionText?: string | null;
  triggeredRules: string[];
}

// ─── Sources ─────────────────────────────────────────────────────────────────

export interface Source {
  id: string;
  name: string;
  url?: string | null;
  address?: string | null;
  phone?: string | null;
  region?: string | null;
  targetLocation?: string | null;
  topicsAddressed?: string | null;
  attribution?: string | null;
  notes?: string | null;
  refCode?: string | null;
  fileLink?: string | null;
}

// ─── Nurseries ───────────────────────────────────────────────────────────────

export interface Nursery {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  url?: string | null;
  notes?: string | null;
}

// ─── Key Terms ───────────────────────────────────────────────────────────────

export interface KeyTerm {
  id: string;
  term: string;
  definition?: string | null;
  sortOrder?: number | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

// ─── Filter Presets ──────────────────────────────────────────────────────────

export interface FilterPreset {
  id: string;
  name: string;
  description?: string | null;
  filters: Record<string, unknown>;
  columns?: string[] | null;
  isDefault?: boolean;
  showOnHomePage?: boolean;
  showInGenerator?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string | null;
}

// ─── Resources ───────────────────────────────────────────────────────────────

export interface ResourceLink {
  title: string;
  url: string;
  description?: string | null;
  duration?: string | null;
}

export interface ResourceSubsection {
  title: string;
  description?: string | null;
  links: ResourceLink[];
}

export interface ResourceSection {
  id: string;
  title: string;
  description?: string | null;
  subsections?: ResourceSubsection[] | null;
  links?: ResourceLink[] | null;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string | null;
}

// ─── Risk Reduction Snippets ─────────────────────────────────────────────────

export interface RiskReductionSnippet {
  id: string;
  key: string;
  text: string;
  description?: string | null;
  sortOrder?: number;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

// ─── Attribute Sources ───────────────────────────────────────────────────────

export interface AttributeSource {
  id: string;
  attributeId: string;
  sourceId: string;
  attributeName?: string | null;
  sourceName?: string | null;
  sourceRefCode?: string | null;
  valuesAllowed?: Record<string, unknown> | null;
  valueNotes?: string | null;
  notes?: string | null;
}

// ─── API Error ───────────────────────────────────────────────────────────────

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'DATABASE_ERROR';

export interface ApiError {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ─── Status ──────────────────────────────────────────────────────────────────

export interface ApiStatus {
  status: string;
  version: string;
  timestamp: string;
}
