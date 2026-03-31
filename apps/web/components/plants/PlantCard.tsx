'use client';

import Link from 'next/link';
import type { Plant, ResolvedValue } from '@lwf/types';
import { presentPlant, getBotanicalName, getPlantImageUrl } from '@/lib/plants/present';
import { HIZ_BADGE_COLORS, FIRE_LEVEL_COLORS } from '@/lib/design-tokens';
import { PlantAttributeBadges, FlammabilityBadge } from './PlantAttributeBadges';
import { SavePlantButton } from './SavePlantButton';
import { AddToListButton } from './AddToListButton';

// ─── Component ───────────────────────────────────────────────────────────────

interface PlantCardProps {
  plant: Plant;
  values?: ResolvedValue[];
  onPlantClick?: (plantId: string) => void;
  compact?: boolean;
}

export function PlantCard({ plant, values = [], onPlantClick, compact = false }: PlantCardProps) {
  const presentation = presentPlant(values);

  const zones = presentation.zones.map(z => z.zone);

  function handleCardClick() {
    onPlantClick?.(plant.id);
  }

  const imageUrl = getPlantImageUrl(plant);

  if (compact) {
    return (
      <button
        onClick={handleCardClick}
        className="group relative bg-white rounded-lg border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all text-left w-full"
        data-plant-card
      >
        {/* Flammability bar - left edge */}
        {presentation.characterScore && (
          <div 
            className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${FIRE_LEVEL_COLORS[presentation.characterScore.level]}`}
          />
        )}
        
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18-3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
          )}
          
          {/* Fire score badge - top left overlay */}
          {presentation.characterScore && (
            <div className={`absolute top-1.5 left-1.5 w-8 h-8 rounded-full ${FIRE_LEVEL_COLORS[presentation.characterScore.level]} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">
                {presentation.characterScore.value}
              </span>
            </div>
          )}
        </div>
        {/* Action buttons — visible on hover */}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <SavePlantButton plantId={plant.id} size="sm" />
          <AddToListButton plantId={plant.id} />
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
                <span key={zone} className={`text-[9px] font-medium px-1.5 py-0 rounded-full border ${HIZ_BADGE_COLORS[zone] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
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
      {/* Flammability bar - left edge */}
      {presentation.characterScore && (
        <div 
          className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${FIRE_LEVEL_COLORS[presentation.characterScore.level]}`}
        />
      )}
      
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
          
          {/* Fire score badge - top left overlay */}
          {presentation.characterScore && (
            <div className={`absolute top-2 left-2 w-8 h-8 rounded-full ${FIRE_LEVEL_COLORS[presentation.characterScore.level]} flex items-center justify-center`}>
              <span className="text-white text-sm font-bold">
                {presentation.characterScore.value}
              </span>
            </div>
          )}
        </div>
      </button>

      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        <SavePlantButton plantId={plant.id} />
        <AddToListButton plantId={plant.id} />
      </div>

      <div className="p-3">
        <button onClick={handleCardClick} className="block w-full text-left">
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors text-sm">
            {plant.commonName}
          </h3>
          <p className="text-xs text-gray-500 italic mt-0.5">{getBotanicalName(plant)}</p>
        </button>

        {zones.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {zones.map((zone) => (
              <span key={zone} className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${HIZ_BADGE_COLORS[zone] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {zone} ft
              </span>
            ))}
          </div>
        )}

        <div className="mt-2">
          <PlantAttributeBadges presentation={presentation} size="sm" />
        </div>

        <div className="mt-1.5">
          <FlammabilityBadge presentation={presentation} size="sm" />
        </div>

      </div>
    </div>
  );
}
