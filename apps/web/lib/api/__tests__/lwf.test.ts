/**
 * LWF API Client — Integration Tests
 *
 * These hit the real API at https://lwf-api.vercel.app/api/v1.
 * Run with: npx vitest run lib/api/__tests__/lwf.test.ts
 *   or:     npx tsx --test lib/api/__tests__/lwf.test.ts  (Node 18+ built-in)
 *
 * Using Node built-in test runner + assert for zero-dep execution.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  getPlants,
  getPlant,
  getPlantValues,
  getPlantImages,
  getPlantRiskReduction,
  getAttributes,
  getHierarchicalAttributes,
  getNurseries,
  getKeyTerms,
  getFilterPresets,
  getResources,
  getSources,
  getStatus,
  getPlantFieldsGuide,
} from '../lwf';

const KNOWN_PLANT_ID = '1b78126d-1f69-44b0-a06b-47116e41270d'; // Glossy Abelia

describe('LWF API Client', { timeout: 30_000 }, () => {
  // ── Plants ───────────────────────────────────────────────────────────────

  it('getPlants returns data with pagination', async () => {
    const result = await getPlants({ limit: 5 });
    assert.ok(Array.isArray(result.data), 'data should be an array');
    assert.ok(result.data.length > 0, 'should return at least one plant');
    assert.ok(result.meta?.pagination, 'should have pagination meta');
    assert.equal(typeof result.meta.pagination.total, 'number');
    assert.equal(typeof result.meta.pagination.hasMore, 'boolean');
    assert.equal(result.meta.pagination.limit, 5);
  });

  it('getPlant returns Glossy Abelia by known ID', async () => {
    const plant = await getPlant(KNOWN_PLANT_ID);
    assert.ok(plant, 'should return a plant');
    assert.equal(plant.id, KNOWN_PLANT_ID);
    assert.equal(typeof plant.genus, 'string');
    assert.equal(typeof plant.species, 'string');
    // Glossy Abelia
    assert.ok(
      plant.commonName?.toLowerCase().includes('abelia') ||
        plant.genus.toLowerCase().includes('abelia'),
      `expected Abelia, got genus=${plant.genus} commonName=${plant.commonName}`,
    );
  });

  it('getPlantValues returns resolved values for known plant', async () => {
    const values = await getPlantValues(KNOWN_PLANT_ID);
    assert.ok(Array.isArray(values), 'should return an array');
    assert.ok(values.length > 0, 'should have at least one value');
    const first = values[0];
    assert.ok(first.attributeId, 'value should have attributeId');
    assert.ok(first.attributeName, 'value should have attributeName');
  });

  it('getPlantImages returns images for known plant', async () => {
    const result = await getPlantImages(KNOWN_PLANT_ID);
    assert.ok(result, 'should return image data');
    assert.ok(Array.isArray(result.images), 'should have images array');
  });

  it('getPlantRiskReduction returns score for known plant', async () => {
    const result = await getPlantRiskReduction(KNOWN_PLANT_ID);
    assert.ok(result, 'should return risk reduction data');
    assert.equal(result.plantId, KNOWN_PLANT_ID);
    assert.ok(result.plant, 'should include plant info');
    assert.ok(result.placement, 'should include placement');
    assert.ok(Array.isArray(result.triggeredRules), 'triggeredRules should be array');
  });

  it('search works — finds plants matching "oak"', async () => {
    const result = await getPlants({ search: 'oak', limit: 10 });
    assert.ok(result.data.length > 0, 'search for "oak" should return results');
  });

  // ── Attributes ───────────────────────────────────────────────────────────

  it('getAttributes returns paginated attributes', async () => {
    const result = await getAttributes({ limit: 5 });
    assert.ok(Array.isArray(result.data));
    assert.ok(result.data.length > 0);
    assert.ok(result.meta?.pagination);
    const attr = result.data[0];
    assert.ok(attr.id, 'attribute should have id');
    assert.ok(attr.name, 'attribute should have name');
  });

  it('getHierarchicalAttributes returns tree structure', async () => {
    const attrs = await getHierarchicalAttributes();
    assert.ok(Array.isArray(attrs), 'should return an array');
    assert.ok(attrs.length > 0, 'should have attributes');
    // At least one root should have children
    const withChildren = attrs.filter(
      (a) => a.children && a.children.length > 0,
    );
    assert.ok(
      withChildren.length > 0,
      'at least one attribute should have children',
    );
  });

  // ── Nurseries ────────────────────────────────────────────────────────────

  it('getNurseries returns data', async () => {
    const result = await getNurseries({ limit: 5 });
    assert.ok(Array.isArray(result.data));
    assert.ok(result.data.length > 0, 'should have at least one nursery');
    assert.ok(result.data[0].name, 'nursery should have name');
  });

  // ── Other endpoints ──────────────────────────────────────────────────────

  it('getKeyTerms returns data', async () => {
    const result = await getKeyTerms({ limit: 5 });
    assert.ok(Array.isArray(result.data));
  });

  it('getFilterPresets returns data', async () => {
    const result = await getFilterPresets();
    assert.ok(Array.isArray(result.data));
  });

  it('getResources returns data', async () => {
    const result = await getResources();
    assert.ok(Array.isArray(result.data));
  });

  it('getSources returns data', async () => {
    const result = await getSources({ limit: 5 });
    assert.ok(Array.isArray(result.data));
    assert.ok(result.data.length > 0);
  });

  // ── Status ───────────────────────────────────────────────────────────────

  it('getStatus returns ok', async () => {
    const status = await getStatus();
    assert.ok(status, 'should return status');
    // The status endpoint returns { status: "ok", ... }
    assert.ok(
      status.status === 'ok' || status.status === 'healthy',
      `expected ok/healthy status, got: ${status.status}`,
    );
  });
});
