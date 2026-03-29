/**
 * Cost Estimator for Fire-Safe Landscaping
 * 
 * Calculates total project costs including:
 * - Plants (from nursery pricing)
 * - Labor (based on zone area)
 * - Materials (mulch, hardscape, irrigation)
 * 
 * Supports budget tiers: starter, standard, comprehensive
 */

import type { PlanPlant } from "../scoring/types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlantCost {
  name: string;
  nursery: string;
  containerSize: string;
  price: number;
  quantity: number;
}

export interface CostRange {
  min: number;
  max: number;
}

export interface CostEstimate {
  plants: PlantCost[];
  plantTotal: number;
  laborEstimate: CostRange;
  materialsEstimate: CostRange;
  totalEstimate: CostRange;
  budgetTier: 'starter' | 'standard' | 'comprehensive';
}

export interface NurseryPricing {
  nurseryId: string;
  nurseryName: string;
  plantId: string;
  botanicalName: string;
  commonName: string;
  price: number; // in cents
  containerSize: string;
  availability: 'in_stock' | 'limited' | 'out_of_stock' | 'seasonal';
}

export interface PropertyZoneData {
  zone0Area: number; // square feet
  zone1Area: number;
  zone2Area: number;
  totalArea: number;
  structureCount: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** Default plant pricing when nursery data unavailable (in cents) */
const DEFAULT_PLANT_PRICING: Record<string, number> = {
  '1-gallon': 1500, // $15.00
  '5-gallon': 4500, // $45.00
  '15-gallon': 12000, // $120.00
  'tree': 15000, // $150.00
  'shrub': 2500, // $25.00
  'perennial': 1200, // $12.00
  'groundcover': 800, // $8.00
  'default': 2000, // $20.00
};

/** Labor rates per square foot by zone (in cents) */
const LABOR_RATES_PER_SQ_FT: Record<string, CostRange> = {
  zone0: { min: 300, max: 800 }, // $3-8/sq ft - intensive cleanup & careful planting
  zone1: { min: 200, max: 500 }, // $2-5/sq ft - moderate work
  zone2: { min: 100, max: 300 }, // $1-3/sq ft - basic planting & maintenance
};

/** Materials cost per square foot by zone (in cents) */
const MATERIALS_RATES_PER_SQ_FT: Record<string, CostRange> = {
  zone0: { min: 150, max: 400 }, // $1.50-4/sq ft - mulch, drip irrigation, hardscape
  zone1: { min: 100, max: 250 }, // $1-2.50/sq ft - mulch, basic irrigation
  zone2: { min: 50, max: 150 },  // $0.50-1.50/sq ft - mulch only
};

/** Budget tier thresholds and characteristics */
const BUDGET_TIERS = {
  starter: {
    maxBudget: 50000, // $500
    description: 'Zone 0 cleanup + a few replacement plants',
    plantCountMultiplier: 0.3, // reduce plant count
    laborMultiplier: 0.5, // DIY/basic labor
    materialsMultiplier: 0.5, // minimal materials
  },
  standard: {
    maxBudget: 500000, // $5,000
    description: 'Full Zone 0-1 makeover, new plants, basic hardscape',
    plantCountMultiplier: 1.0, // full plant count
    laborMultiplier: 1.0, // professional labor
    materialsMultiplier: 1.0, // full materials
  },
  comprehensive: {
    maxBudget: 1500000, // $15,000
    description: 'All zones, professional landscaper, irrigation, hardscape',
    plantCountMultiplier: 1.2, // extra plants for fuller coverage
    laborMultiplier: 1.5, // premium labor
    materialsMultiplier: 1.5, // premium materials + irrigation
  },
} as const;

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
}

function estimatePlantSize(plantName: string, zone: string): string {
  const name = plantName.toLowerCase();
  
  // Tree indicators
  if (name.includes('tree') || name.includes('oak') || name.includes('pine') || 
      name.includes('maple') || name.includes('cedar')) {
    return '15-gallon';
  }
  
  // Large shrub indicators
  if (name.includes('shrub') || name.includes('bush') || name.includes('hedge')) {
    return zone === 'zone0' ? '1-gallon' : '5-gallon';
  }
  
  // Groundcover indicators
  if (name.includes('groundcover') || name.includes('grass') || name.includes('moss')) {
    return '1-gallon';
  }
  
  // Default by zone
  return zone === 'zone0' ? '1-gallon' : '5-gallon';
}

function findBestPricing(
  plantId: string,
  plantName: string,
  containerSize: string,
  nurseryPricing: NurseryPricing[]
): PlantCost {
  // Try exact plant ID match first
  let matches = nurseryPricing.filter(p => 
    p.plantId === plantId && 
    p.availability !== 'out_of_stock' &&
    (p.containerSize === containerSize || !containerSize)
  );
  
  // If no exact matches, try partial name matching
  if (matches.length === 0 && plantName) {
    const searchTerms = plantName.toLowerCase().split(' ');
    matches = nurseryPricing.filter(p => {
      const name = (p.botanicalName + ' ' + p.commonName).toLowerCase();
      return searchTerms.some(term => name.includes(term)) &&
             p.availability !== 'out_of_stock';
    });
  }
  
  if (matches.length > 0) {
    // Prefer in-stock over limited, and lower prices
    matches.sort((a, b) => {
      const availabilityScore = a.availability === 'in_stock' ? 0 : 1;
      const availabilityScoreB = b.availability === 'in_stock' ? 0 : 1;
      if (availabilityScore !== availabilityScoreB) {
        return availabilityScore - availabilityScoreB;
      }
      return a.price - b.price;
    });
    
    const best = matches[0];
    return {
      name: best.commonName || best.botanicalName,
      nursery: best.nurseryName,
      containerSize: best.containerSize,
      price: best.price,
      quantity: 1,
    };
  }
  
  // Fall back to default pricing
  const defaultPrice = DEFAULT_PLANT_PRICING[containerSize] || DEFAULT_PLANT_PRICING.default;
  return {
    name: plantName || plantId,
    nursery: 'Estimated pricing',
    containerSize: containerSize,
    price: defaultPrice,
    quantity: 1,
  };
}

function calculateLaborCosts(zoneData: PropertyZoneData, multiplier: number): CostRange {
  let totalMin = 0;
  let totalMax = 0;
  
  // Zone 0: intensive work
  if (zoneData.zone0Area > 0) {
    const rate = LABOR_RATES_PER_SQ_FT.zone0;
    totalMin += zoneData.zone0Area * rate.min * multiplier;
    totalMax += zoneData.zone0Area * rate.max * multiplier;
  }
  
  // Zone 1: moderate work
  if (zoneData.zone1Area > 0) {
    const rate = LABOR_RATES_PER_SQ_FT.zone1;
    totalMin += zoneData.zone1Area * rate.min * multiplier;
    totalMax += zoneData.zone1Area * rate.max * multiplier;
  }
  
  // Zone 2: basic work
  if (zoneData.zone2Area > 0) {
    const rate = LABOR_RATES_PER_SQ_FT.zone2;
    totalMin += zoneData.zone2Area * rate.min * multiplier;
    totalMax += zoneData.zone2Area * rate.max * multiplier;
  }
  
  return {
    min: Math.round(totalMin),
    max: Math.round(totalMax),
  };
}

function calculateMaterialsCosts(zoneData: PropertyZoneData, multiplier: number): CostRange {
  let totalMin = 0;
  let totalMax = 0;
  
  // Zone 0: premium materials
  if (zoneData.zone0Area > 0) {
    const rate = MATERIALS_RATES_PER_SQ_FT.zone0;
    totalMin += zoneData.zone0Area * rate.min * multiplier;
    totalMax += zoneData.zone0Area * rate.max * multiplier;
  }
  
  // Zone 1: standard materials
  if (zoneData.zone1Area > 0) {
    const rate = MATERIALS_RATES_PER_SQ_FT.zone1;
    totalMin += zoneData.zone1Area * rate.min * multiplier;
    totalMax += zoneData.zone1Area * rate.max * multiplier;
  }
  
  // Zone 2: basic materials
  if (zoneData.zone2Area > 0) {
    const rate = MATERIALS_RATES_PER_SQ_FT.zone2;
    totalMin += zoneData.zone2Area * rate.min * multiplier;
    totalMax += zoneData.zone2Area * rate.max * multiplier;
  }
  
  return {
    min: Math.round(totalMin),
    max: Math.round(totalMax),
  };
}

function determineBudgetTier(totalMin: number, totalMax: number): 'starter' | 'standard' | 'comprehensive' {
  const avgTotal = (totalMin + totalMax) / 2;
  
  if (avgTotal <= BUDGET_TIERS.starter.maxBudget) {
    return 'starter';
  } else if (avgTotal <= BUDGET_TIERS.standard.maxBudget) {
    return 'standard';
  } else {
    return 'comprehensive';
  }
}

// ─── Main Estimation Function ────────────────────────────────────────────────

export function estimateCost(
  plants: PlanPlant[],
  zoneData: PropertyZoneData,
  nurseryPricing: NurseryPricing[],
  targetBudgetTier?: 'starter' | 'standard' | 'comprehensive'
): CostEstimate {
  // Group plants by type and calculate quantities
  const plantCounts = new Map<string, { plant: PlanPlant; count: number }>();
  
  for (const plant of plants) {
    const key = `${plant.plantId}_${plant.zone}`;
    const existing = plantCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      plantCounts.set(key, { plant, count: 1 });
    }
  }
  
  // Calculate plant costs
  const plantCosts: PlantCost[] = [];
  let plantTotal = 0;
  
  for (const { plant, count } of plantCounts.values()) {
    const containerSize = estimatePlantSize(plant.plantName || plant.plantId, plant.zone);
    const pricing = findBestPricing(plant.plantId, plant.plantName, containerSize, nurseryPricing);
    pricing.quantity = count;
    
    const totalPrice = pricing.price * count;
    plantTotal += totalPrice;
    plantCosts.push(pricing);
  }
  
  // Calculate labor and materials based on target tier or auto-determine
  let laborMultiplier = 1.0;
  let materialsMultiplier = 1.0;
  let budgetTier: 'starter' | 'standard' | 'comprehensive';
  
  if (targetBudgetTier) {
    budgetTier = targetBudgetTier;
    const tierConfig = BUDGET_TIERS[budgetTier];
    laborMultiplier = tierConfig.laborMultiplier;
    materialsMultiplier = tierConfig.materialsMultiplier;
    
    // Adjust plant quantities for budget tier
    if (tierConfig.plantCountMultiplier !== 1.0) {
      for (const plantCost of plantCosts) {
        const newQuantity = Math.max(1, Math.round(plantCost.quantity * tierConfig.plantCountMultiplier));
        const priceDiff = (newQuantity - plantCost.quantity) * plantCost.price;
        plantTotal += priceDiff;
        plantCost.quantity = newQuantity;
      }
    }
  } else {
    // Auto-determine tier based on initial estimate
    const laborEstimate = calculateLaborCosts(zoneData, 1.0);
    const materialsEstimate = calculateMaterialsCosts(zoneData, 1.0);
    const totalMin = plantTotal + laborEstimate.min + materialsEstimate.min;
    const totalMax = plantTotal + laborEstimate.max + materialsEstimate.max;
    
    budgetTier = determineBudgetTier(totalMin, totalMax);
    const tierConfig = BUDGET_TIERS[budgetTier];
    laborMultiplier = tierConfig.laborMultiplier;
    materialsMultiplier = tierConfig.materialsMultiplier;
  }
  
  // Calculate final labor and materials costs
  const laborEstimate = calculateLaborCosts(zoneData, laborMultiplier);
  const materialsEstimate = calculateMaterialsCosts(zoneData, materialsMultiplier);
  
  // Calculate total estimate
  const totalEstimate: CostRange = {
    min: plantTotal + laborEstimate.min + materialsEstimate.min,
    max: plantTotal + laborEstimate.max + materialsEstimate.max,
  };
  
  return {
    plants: plantCosts,
    plantTotal,
    laborEstimate,
    materialsEstimate,
    totalEstimate,
    budgetTier,
  };
}

// ─── Budget Tier Helpers ─────────────────────────────────────────────────────

export function getBudgetTierInfo(tier: 'starter' | 'standard' | 'comprehensive') {
  return BUDGET_TIERS[tier];
}

export function formatCostRange(range: CostRange): string {
  if (range.min === range.max) {
    return formatPrice(range.min);
  }
  return `${formatPrice(range.min)} - ${formatPrice(range.max)}`;
}

export function formatCostEstimate(estimate: CostEstimate): string {
  return formatCostRange(estimate.totalEstimate);
}

// ─── Export for testing ──────────────────────────────────────────────────────

export const __testing = {
  DEFAULT_PLANT_PRICING,
  LABOR_RATES_PER_SQ_FT,
  MATERIALS_RATES_PER_SQ_FT,
  BUDGET_TIERS,
  estimatePlantSize,
  findBestPricing,
  calculateLaborCosts,
  calculateMaterialsCosts,
  determineBudgetTier,
};