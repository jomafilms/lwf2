'use client';

import Link from 'next/link';
import type { Plant, ResolvedValue } from '@lwf/types';
import { NurseryAvailability } from './NurseryAvailability';
import { AddToListButton } from './AddToListButton';
import { CompareButton } from './CompareButton';
import { PlanToggleButton } from './PlanToggleButton';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Known attribute IDs from the LWF API */
const ATTR_IDS = {
  HIZ: 'b908b170-70c9-454d-a2ed-d86f98cb3de1',
  WATER_AMOUNT: 'd9174148-6563-4f92-9673-01feb6a529ce',
  OREGON_NATIVE: 'd5fb9f61-41dd-4e4e-bc5e-47eb24ecab46',
  DEER_RESISTANCE: 'ff4c4d0e-35d5-4804-aea3-2a6334ef8cb5',
  BENEFITS: 'ff75e529-5b5c-4461-8191-0382e33a4bd5',
} as const;

const ZONE_COLORS: Record<string, string> = {
  '0-5': 'bg-red-100 text-red-800 border-red-200',
  '5-10': 'bg-orange-100 text-orange-800 border-orange-200',
  '10-30': 'bg-amber-100 text-amber-800 border-amber-200',
  '30-100': 'bg-green-100 text-green-800 border-green-200',
  '50-100': 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

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

// ─── Component ───────────────────────────────────────────────────────────────

interface PlantCardProps {
  plant: Plant;
  values?: ResolvedValue[];
  onPlantClick?: (plantId: string) => void;
  compact?: boolean;
}

export function PlantCard({ plant, values = [], onPlantClick, compact = false }: PlantCardProps) {
  const hizValues = getValuesForAttribute(values, ATTR_IDS.HIZ);
  const waterValues = getValuesForAttribute(values, ATTR_IDS.WATER_AMOUNT);
  const nativeValues = getValuesForAttribute(values, ATTR_IDS.OREGON_NATIVE);
  const deerValues = getValuesForAttribute(values, ATTR_IDS.DEER_RESISTANCE);
  const benefitsValues = getValuesForAttribute(values, ATTR_IDS.BENEFITS);

  const isNative = nativeValues.some(
    (v) => v.resolved?.value === 'Yes'
  );
  const isDeerResistant = deerValues.some(
    (v) =>
      v.resolved?.value === 'High (Usually)' ||
      v.resolved?.value === 'Some'
  );
  const isPollinatorFriendly = benefitsValues.some(
    (v) =>
      v.resolved?.value?.toLowerCase().includes('pollinator')
  );
  const waterLevel = waterValues[0]?.resolved?.value || null;

  const zones = hizValues
    .map((v) => v.resolved?.value)
    .filter(Boolean) as string[];

  function handleCardClick() {
    onPlantClick?.(plant.id);
  }

  // Use primaryImage, or first image from images array
  const imageUrl = plant.primaryImage?.url ||
    (plant as unknown as { images?: { url: string }[] })?.images?.[0]?.url;

  if (compact) {
    return (
      <button
        onClick={handleCardClick}
        className="group relative bg-white rounded-lg border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all text-left w-full"
        data-plant-card
      >
        <div className="aspect-square bg-gray-100 relative overflow-hidden rounded-t-lg">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={plant.commonName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
              <svg className="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-2.5">
          <h3 className="text-xs font-semibold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight line-clamp-1">
            {plant.commonName}
          </h3>
          <p className="text-[10px] text-gray-400 italic mt-0.5 line-clamp-1">
            {getBotanicalName(plant)}
          </p>
          {zones.length > 0 && (
            <div className="flex flex-wrap gap-0.5 mt-1.5">
              {zones.slice(0, 2).map((zone) => (
                <span key={zone} className={`text-[9px] font-medium px-1.5 py-0 rounded-full border ${ZONE_COLORS[zone] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {zone}ft
                </span>
              ))}
              {zones.length > 2 && <span className="text-[9px] text-gray-400">+{zones.length - 2}</span>}
            </div>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <button onClick={handleCardClick} className="block w-full text-left">
        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden rounded-t-xl">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={plant.commonName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
              <svg className="w-12 h-12 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
          )}
        </div>
      </button>

      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        <AddToListButton plantId={plant.id} />
        <CompareButton plant={plant} variant="button" />
        <PlanToggleButton
          plantId={plant.id}
          commonName={plant.commonName}
          botanicalName={getBotanicalName(plant)}
          imageUrl={plant.primaryImage?.url || null}
          variant="pill"
        />
      </div>

      <div className="p-4">
        <button onClick={handleCardClick} className="block w-full text-left">
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
            {plant.commonName}
          </h3>
          <p className="text-sm text-gray-500 italic mt-0.5">{getBotanicalName(plant)}</p>
        </button>

        {zones.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {zones.map((zone) => (
              <span key={zone} className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${ZONE_COLORS[zone] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {zone} ft
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mt-2">
          {waterLevel && <span className="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">💧 {waterLevel}</span>}
          {isNative && <span className="inline-flex items-center text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">🌿 Native</span>}
          {isDeerResistant && <span className="inline-flex items-center text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">🦌 Deer Resistant</span>}
          {isPollinatorFriendly && <span className="inline-flex items-center text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">🐝 Pollinator</span>}
        </div>

        <NurseryAvailability lwfPlantId={plant.id} variant="summary" />
      </div>
    </div>
  );
}
