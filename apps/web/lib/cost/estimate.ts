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
    plantCountMultiplier: 0.3,
    laborMultiplier: 0.5,
    materialsMultiplier: 0.5,
  },
  standard: {
    maxBudget: 500000, // $5,000
    description: 'Full Zone 0-1 makeover, new plants, basic hardscape',
    plantCountMultiplier: 1.0,
    laborMultiplier: 1.0,
    materialsMultiplier: 1.0,
  },
  comprehensive: {
    maxBudget: 1500000, // $15,000
    description: 'All zones, professional landscaper, irrigation, hardscape',
    plantCountMultiplier: 1.2,
    laborMultiplier: 1.5,
    materialsMultiplier: 1.5,
  },
} as const;

// ─── Main Functions ──────────────────────────────────────────────────────────

export function formatCostRange(range: CostRange): string {
  if (range.min === range.max) {
    return `$${(range.min / 100).toFixed(2)}`;
  }
  return `$${(range.min / 100).toFixed(2)} - $${(range.max / 100).toFixed(2)}`;
}

export function getBudgetTierInfo(tier: 'starter' | 'standard' | 'comprehensive') {
  return BUDGET_TIERS[tier];
}

export function estimateCost(
  plants: PlanPlant[],
  zoneData: PropertyZoneData,
  nurseryPricing: NurseryPricing[],
  targetBudgetTier?: 'starter' | 'standard' | 'comprehensive'
): CostEstimate {
  // Simplified implementation for demo
  const plantCosts: PlantCost[] = plants.map(plant => ({
    name: plant.plantName || plant.plantId,
    nursery: 'Local Nursery',
    containerSize: '1-gallon',
    price: 1500, // $15.00
    quantity: 1,
  }));
  
  const plantTotal = plantCosts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  
  const laborEstimate: CostRange = {
    min: zoneData.totalArea * 200, // $2/sq ft min
    max: zoneData.totalArea * 500, // $5/sq ft max
  };
  
  const materialsEstimate: CostRange = {
    min: zoneData.totalArea * 100, // $1/sq ft min
    max: zoneData.totalArea * 300, // $3/sq ft max
  };
  
  const totalEstimate: CostRange = {
    min: plantTotal + laborEstimate.min + materialsEstimate.min,
    max: plantTotal + laborEstimate.max + materialsEstimate.max,
  };
  
  const avgTotal = (totalEstimate.min + totalEstimate.max) / 2;
  let budgetTier: 'starter' | 'standard' | 'comprehensive' = 'standard';
  
  if (avgTotal <= BUDGET_TIERS.starter.maxBudget) {
    budgetTier = 'starter';
  } else if (avgTotal <= BUDGET_TIERS.standard.maxBudget) {
    budgetTier = 'standard';
  } else {
    budgetTier = 'comprehensive';
  }
  
  return {
    plants: plantCosts,
    plantTotal,
    laborEstimate,
    materialsEstimate,
    totalEstimate,
    budgetTier: targetBudgetTier || budgetTier,
  };
}