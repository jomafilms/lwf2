'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Plant, ResolvedValue, RiskReduction } from '@lwf/types';
import { getPlant, getPlantValues, getPlantRiskReduction } from '@/lib/api/lwf';
import { NurseryAvailability } from './NurseryAvailability';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlantWithData {
  plant: Plant;
  values: ResolvedValue[];
  riskReduction: RiskReduction | null;
}

interface PlantCompareProps {
  plantIds: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Known attribute IDs from the LWF API */
const ATTR_IDS = {
  HIZ: 'b908b170-70c9-454d-a2ed-d86f98cb3de1',
  WATER_AMOUNT: 'd9174148-6563-4f92-9673-01feb6a529ce',
  OREGON_NATIVE: 'd5fb9f61-41dd-4e4e-bc5e-47eb24ecab46',
  DEER_RESISTANCE: 'ff4c4d0e-35d5-4804-aea3-2a6334ef8cb5',
  BENEFITS: 'ff75e529-5b5c-4461-8191-0382e33a4bd5',
  MATURE_HEIGHT: 'fc8b5b0e-36dc-4b3d-a7e2-8b9e1e7f9c2a', // Estimate - need to verify
  MATURE_WIDTH: 'ae9c3d1f-42ea-4e8b-9f6d-7a8b2c3e4f5g', // Estimate - need to verify
  GROWTH_RATE: '8d7c6b5a-43fe-4d8c-af2e-9b8c7d6e5f4a', // Estimate - need to verify
} as const;

function getValuesForAttribute(
  values: ResolvedValue[],
  attributeId: string
): ResolvedValue[] {
  return values.filter((v) => v.attributeId === attributeId);
}

function getBotanicalName(plant: Plant): string {
  const parts = [plant.genus, plant.species].filter(Boolean);
  return parts.join(' ');
}

function getFireScoreColor(score: number): string {
  if (score >= 80) return 'text-green-700 bg-green-50';
  if (score >= 60) return 'text-emerald-700 bg-emerald-50';
  if (score >= 40) return 'text-amber-700 bg-amber-50';
  return 'text-red-700 bg-red-50';
}

function getWaterIcon(waterLevel: string): string {
  const level = waterLevel.toLowerCase();
  if (level.includes('low') || level.includes('dry')) return '🏜️';
  if (level.includes('high') || level.includes('wet')) return '💧';
  return '🌿';
}

function getMaintenanceLevel(values: ResolvedValue[]): 'Low' | 'Medium' | 'High' {
  // Simple heuristic based on growth rate and water needs
  const growthValues = getValuesForAttribute(values, ATTR_IDS.GROWTH_RATE);
  const waterValues = getValuesForAttribute(values, ATTR_IDS.WATER_AMOUNT);
  
  const growthRate = growthValues[0]?.resolved?.value?.toLowerCase() || '';
  const waterLevel = waterValues[0]?.resolved?.value?.toLowerCase() || '';
  
  if (growthRate.includes('fast') || waterLevel.includes('high')) {
    return 'High';
  }
  if (growthRate.includes('slow') && waterLevel.includes('low')) {
    return 'Low';
  }
  return 'Medium';
}

function findBestInRow(plantData: PlantWithData[], metric: string): number {
  // Returns the index of the "winner" for this metric
  switch (metric) {
    case 'fire-score':
      let maxScore = -1;
      let bestIndex = 0;
      plantData.forEach((data, index) => {
        const score = data.riskReduction?.characterScore || 0;
        if (score > maxScore) {
          maxScore = score;
          bestIndex = index;
        }
      });
      return bestIndex;
    
    case 'water':
      // Low water is "better" for fire safety
      const waterScores = plantData.map((data) => {
        const waterValues = getValuesForAttribute(data.values, ATTR_IDS.WATER_AMOUNT);
        const waterLevel = waterValues[0]?.resolved?.value?.toLowerCase() || '';
        if (waterLevel.includes('low') || waterLevel.includes('dry')) return 3;
        if (waterLevel.includes('medium') || waterLevel.includes('moderate')) return 2;
        return 1;
      });
      const maxWater = Math.max(...waterScores.map(Number)); return waterScores.indexOf(maxWater as 1 | 2 | 3) as 0 | 1 | 2;
    
    case 'maintenance':
      // Low maintenance is "better"
      const maintenanceScores = plantData.map((data) => {
        const level = getMaintenanceLevel(data.values);
        if (level === 'Low') return 3;
        if (level === 'Medium') return 2;
        return 1;
      });
      const maxMaint = Math.max(...maintenanceScores.map(Number)); return maintenanceScores.indexOf(maxMaint as 1 | 2 | 3) as 0 | 1 | 2;
    
    default:
      return -1;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PlantCompare({ plantIds }: PlantCompareProps) {
  const [plantData, setPlantData] = useState<PlantWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlantData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all plant data in parallel
        const results = await Promise.all(
          plantIds.map(async (id) => {
            try {
              const [plant, values, riskReduction] = await Promise.all([
                getPlant(id),
                getPlantValues(id),
                getPlantRiskReduction(id).catch(() => null), // Risk reduction is optional
              ]);
              
              return { plant, values, riskReduction };
            } catch (error) {
              console.error(`Failed to fetch data for plant ${id}:`, error);
              throw new Error(`Failed to load plant data for ${id}`);
            }
          })
        );
        
        setPlantData(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load plant data');
      } finally {
        setLoading(false);
      }
    }

    if (plantIds.length > 0) {
      fetchPlantData();
    }
  }, [plantIds]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading plant comparison...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (plantData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No plants to compare</p>
      </div>
    );
  }

  // Find the winner for each metric
  const fireScoreBest = findBestInRow(plantData, 'fire-score');
  const waterBest = findBestInRow(plantData, 'water');
  const maintenanceBest = findBestInRow(plantData, 'maintenance');

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header with plant images and names */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-[200px_repeat(var(--cols),1fr)]" 
             style={{ '--cols': plantData.length } as any}>
          <div className="p-4 font-medium text-gray-900">Plant</div>
          {plantData.map((data) => (
            <div key={data.plant.id} className="p-4 text-center">
              <Link href={`/plants/${data.plant.id}`} className="block group">
                <div className="aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {data.plant.primaryImage ? (
                    <img
                      src={data.plant.primaryImage.url}
                      alt={data.plant.commonName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                      <svg
                        className="w-8 h-8 text-green-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors mb-1">
                  {data.plant.commonName}
                </h3>
                <p className="text-sm text-gray-500 italic">
                  {getBotanicalName(data.plant)}
                </p>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison rows */}
      <div className="divide-y divide-gray-100">
        {/* Fire Character Score */}
        <div className="grid grid-cols-[200px_repeat(var(--cols),1fr)]" 
             style={{ '--cols': plantData.length } as any}>
          <div className="p-4 font-medium text-gray-900 bg-gray-50">Fire Character Score</div>
          {plantData.map((data, index) => (
            <div 
              key={data.plant.id} 
              className={`p-4 text-center ${index === fireScoreBest ? 'bg-green-50' : ''}`}
            >
              {data.riskReduction ? (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getFireScoreColor(data.riskReduction.characterScore)}`}>
                  {data.riskReduction.characterScore}/100
                </span>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
          ))}
        </div>

        {/* Placement Code */}
        <div className="grid grid-cols-[200px_repeat(var(--cols),1fr)]" 
             style={{ '--cols': plantData.length } as any}>
          <div className="p-4 font-medium text-gray-900 bg-gray-50">Fire Zones</div>
          {plantData.map((data) => {
            const hizValues = getValuesForAttribute(data.values, ATTR_IDS.HIZ);
            const zones = hizValues.map((v) => v.resolved?.value).filter(Boolean);
            
            return (
              <div key={data.plant.id} className="p-4">
                {zones.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-1">
                    {zones.map((zone) => (
                      <span
                        key={zone}
                        className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800"
                      >
                        {zone} ft
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Risk Reduction */}
        <div className="grid grid-cols-[200px_repeat(var(--cols),1fr)]" 
             style={{ '--cols': plantData.length } as any}>
          <div className="p-4 font-medium text-gray-900 bg-gray-50">Risk Reduction</div>
          {plantData.map((data) => (
            <div key={data.plant.id} className="p-4 text-sm">
              {data.riskReduction?.riskReductionText ? (
                <p className="text-gray-700 leading-tight">
                  {data.riskReduction.riskReductionText}
                </p>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
          ))}
        </div>

        {/* Water Needs */}
        <div className="grid grid-cols-[200px_repeat(var(--cols),1fr)]" 
             style={{ '--cols': plantData.length } as any}>
          <div className="p-4 font-medium text-gray-900 bg-gray-50">Water Needs</div>
          {plantData.map((data, index) => {
            const waterValues = getValuesForAttribute(data.values, ATTR_IDS.WATER_AMOUNT);
            const waterLevel = waterValues[0]?.resolved?.value || '';
            
            return (
              <div 
                key={data.plant.id} 
                className={`p-4 text-center ${index === waterBest ? 'bg-green-50' : ''}`}
              >
                {waterLevel ? (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                    <span className="text-lg">{getWaterIcon(waterLevel)}</span>
                    {waterLevel}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Native Status */}
        <div className="grid grid-cols-[200px_repeat(var(--cols),1fr)]" 
             style={{ '--cols': plantData.length } as any}>
          <div className="p-4 font-medium text-gray-900 bg-gray-50">Oregon Native</div>
          {plantData.map((data) => {
            const nativeValues = getValuesForAttribute(data.values, ATTR_IDS.OREGON_NATIVE);
            const isNative = nativeValues.some((v) => v.resolved?.value === 'Yes');
            
            return (
              <div key={data.plant.id} className="p-4 text-center">
                {isNative ? (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
                    <span className="text-lg">🌿</span>
                    Native
                  </span>
                ) : (
                  <span className="text-gray-400">No</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Deer Resistance */}
        <div className="grid grid-cols-[200px_repeat(var(--cols),1fr)]" 
             style={{ '--cols': plantData.length } as any}>
          <div className="p-4 font-medium text-gray-900 bg-gray-50">Deer Resistance</div>
          {plantData.map((data) => {
            const deerValues = getValuesForAttribute(data.values, ATTR_IDS.DEER_RESISTANCE);
            const resistance = deerValues[0]?.resolved?.value || '';
            
            return (
              <div key={data.plant.id} className="p-4 text-center">
                {resistance ? (
                  <span className="text-sm font-medium text-gray-700">
                    {resistance}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Pollinator Support */}
        <div className="grid grid-cols-[200px_repeat(var(--cols),1fr)]" 
             style={{ '--cols': plantData.length } as any}>
          <div className="p-4 font-medium text-gray-900 bg-gray-50">Pollinator Support</div>
          {plantData.map((data) => {
            const benefitsValues = getValuesForAttribute(data.values, ATTR_IDS.BENEFITS);
            const isPollinatorFriendly = benefitsValues.some((v) =>
              v.resolved?.value?.toLowerCase().includes('pollinator')
            );
            
            return (
              <div key={data.plant.id} className="p-4 text-center">
                {isPollinatorFriendly ? (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-purple-700">
                    <span className="text-lg">🐝</span>
                    Yes
                  </span>
                ) : (
                  <span className="text-gray-400">No</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Maintenance Level */}
        <div className="grid grid-cols-[200px_repeat(var(--cols),1fr)]" 
             style={{ '--cols': plantData.length } as any}>
          <div className="p-4 font-medium text-gray-900 bg-gray-50">Maintenance Level</div>
          {plantData.map((data, index) => {
            const maintenanceLevel = getMaintenanceLevel(data.values);
            
            return (
              <div 
                key={data.plant.id} 
                className={`p-4 text-center ${index === maintenanceBest ? 'bg-green-50' : ''}`}
              >
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                  maintenanceLevel === 'Low' ? 'bg-green-100 text-green-800' :
                  maintenanceLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {maintenanceLevel}
                </span>
              </div>
            );
          })}
        </div>

        {/* Nursery Availability */}
        <div className="grid grid-cols-[200px_repeat(var(--cols),1fr)]" 
             style={{ '--cols': plantData.length } as any}>
          <div className="p-4 font-medium text-gray-900 bg-gray-50">Nursery Availability</div>
          {plantData.map((data) => (
            <div key={data.plant.id} className="p-4">
              <NurseryAvailability lwfPlantId={data.plant.id} variant="summary" />
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            <span className="font-medium">💡 How to read this comparison:</span>
          </p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Higher fire character scores = safer for fire-reluctant landscaping</li>
            <li>Lower water needs = better for drought conditions</li>
            <li>Green highlighting shows the "winner" in each category</li>
            <li>Consider your specific property zones and preferences</li>
          </ul>
        </div>
      </div>
    </div>
  );
}