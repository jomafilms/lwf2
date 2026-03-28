/**
 * LWF API Client
 *
 * Typed client for the Living With Fire plant database API.
 * All GET endpoints are public — no auth required.
 *
 * Base URL from env: NEXT_PUBLIC_LWF_API_BASE
 * Fallback: https://lwf-api.vercel.app/api/v1
 */

import type {
  ApiStatus,
  Attribute,
  FilterPreset,
  KeyTerm,
  Nursery,
  PaginatedResponse,
  Plant,
  PlantImagesResponse,
  ResolvedValue,
  ResourceSection,
  RiskReduction,
  Source,
} from '@lwf/types';

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_LWF_API_BASE) ||
  'https://lwf-api.vercel.app/api/v1';

// ─── Helpers ─────────────────────────────────────────────────────────────────

export class LwfApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'LwfApiError';
  }
}

function buildUrl(path: string, params?: Record<string, unknown>): string {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const url = buildUrl(path, params);
  const res = await fetch(url);

  if (!res.ok) {
    let code = 'UNKNOWN';
    let message = `HTTP ${res.status}`;
    let details: Record<string, unknown> | undefined;

    try {
      const body = await res.json();
      if (body?.error) {
        code = body.error.code || code;
        message = body.error.message || message;
        details = body.error.details;
      }
    } catch {
      // ignore parse errors — use default message
    }

    throw new LwfApiError(res.status, code, message, details);
  }

  return res.json() as Promise<T>;
}

// ─── Plants ──────────────────────────────────────────────────────────────────

export interface GetPlantsParams {
  search?: string;
  limit?: number;
  offset?: number;
  includeImages?: boolean;
  genus?: string;
  species?: string;
  commonName?: string;
}

export async function getPlants(
  params?: GetPlantsParams,
): Promise<PaginatedResponse<Plant>> {
  const query: Record<string, unknown> = { ...params };
  if (params?.includeImages !== undefined) {
    query.includeImages = String(params.includeImages);
  }
  return request<PaginatedResponse<Plant>>('/plants', query);
}

export async function getPlant(id: string): Promise<Plant> {
  const res = await request<{ data: Plant }>(`/plants/${id}`);
  return res.data;
}

export async function getPlantValues(id: string): Promise<ResolvedValue[]> {
  const res = await request<{ data: ResolvedValue[] }>(`/plants/${id}/values`);
  return res.data;
}

export async function getPlantImages(id: string): Promise<PlantImagesResponse> {
  const res = await request<{ data: PlantImagesResponse }>(`/plants/${id}/images`);
  return res.data;
}

export async function getPlantRiskReduction(id: string): Promise<RiskReduction> {
  const res = await request<{ data: RiskReduction }>(`/plants/${id}/risk-reduction`);
  return res.data;
}

// ─── Attributes ──────────────────────────────────────────────────────────────

export interface GetAttributesParams {
  search?: string;
  limit?: number;
  offset?: number;
  valueType?: string;
  selectionType?: string;
  parentAttributeId?: string;
}

export async function getAttributes(
  params?: GetAttributesParams,
): Promise<PaginatedResponse<Attribute>> {
  return request<PaginatedResponse<Attribute>>('/attributes', params as Record<string, unknown>);
}

export async function getHierarchicalAttributes(): Promise<Attribute[]> {
  const res = await request<{ data: Attribute[] }>('/attributes/hierarchical');
  return res.data;
}

// ─── Values ──────────────────────────────────────────────────────────────────

export interface GetValuesBulkParams {
  attributeIds?: string[];
  plantIds?: string[];
  resolve?: boolean;
}

export async function getValuesBulk(
  params: GetValuesBulkParams,
): Promise<Record<string, unknown>> {
  const query: Record<string, unknown> = {};
  if (params.attributeIds?.length) query.attributeIds = params.attributeIds.join(',');
  if (params.plantIds?.length) query.plantIds = params.plantIds.join(',');
  if (params.resolve !== undefined) query.resolve = String(params.resolve);
  return request<Record<string, unknown>>('/values/bulk', query);
}

// ─── Filter Presets ──────────────────────────────────────────────────────────

export async function getFilterPresets(): Promise<PaginatedResponse<FilterPreset>> {
  return request<PaginatedResponse<FilterPreset>>('/filter-presets');
}

// ─── Key Terms ───────────────────────────────────────────────────────────────

export interface GetKeyTermsParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getKeyTerms(
  params?: GetKeyTermsParams,
): Promise<PaginatedResponse<KeyTerm>> {
  return request<PaginatedResponse<KeyTerm>>('/key-terms', params as Record<string, unknown>);
}

// ─── Nurseries ───────────────────────────────────────────────────────────────

export interface GetNurseriesParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getNurseries(
  params?: GetNurseriesParams,
): Promise<PaginatedResponse<Nursery>> {
  return request<PaginatedResponse<Nursery>>('/nurseries', params as Record<string, unknown>);
}

// ─── Resources ───────────────────────────────────────────────────────────────

export interface GetResourcesParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getResources(
  params?: GetResourcesParams,
): Promise<PaginatedResponse<ResourceSection>> {
  return request<PaginatedResponse<ResourceSection>>('/resources', params as Record<string, unknown>);
}

// ─── Sources ─────────────────────────────────────────────────────────────────

export interface GetSourcesParams {
  search?: string;
  limit?: number;
  offset?: number;
  region?: string;
}

export async function getSources(
  params?: GetSourcesParams,
): Promise<PaginatedResponse<Source>> {
  return request<PaginatedResponse<Source>>('/sources', params as Record<string, unknown>);
}

// ─── Plant Fields Guide ──────────────────────────────────────────────────────

export async function getPlantFieldsGuide(): Promise<Record<string, unknown>> {
  // plant-fields.json is served from the root, not under /api/v1
  const baseOrigin = BASE_URL.replace(/\/api\/v1\/?$/, '');
  const res = await fetch(`${baseOrigin}/plant-fields.json`);
  if (!res.ok) {
    throw new LwfApiError(res.status, 'FETCH_ERROR', `Failed to fetch plant-fields.json`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}

// ─── Status ──────────────────────────────────────────────────────────────────

export async function getStatus(): Promise<ApiStatus> {
  const res = await request<{ data: ApiStatus } | ApiStatus>('/status');
  // status endpoint may return { status, version, timestamp } directly or wrapped in data
  if ('data' in res && typeof res.data === 'object') {
    return res.data as ApiStatus;
  }
  return res as ApiStatus;
}
