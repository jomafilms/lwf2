'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Plant, ResolvedValue } from '@lwf/types';
import { SlideOutPanel } from '@/components/ui/SlideOutPanel';
import { presentPlant, type PlantPresentation } from '@/lib/plants/present';
import { PlantAttributeBadges, FlammabilityBadge } from './PlantAttributeBadges';
import { AddToListButton } from './AddToListButton';
import { NurseryAvailability } from './NurseryAvailability';
import { PlanToggleButton } from './PlanToggleButton';
import { getPlantClient } from '@/lib/api/lwf';

interface PlantSlideOutProps {
  plantId: string | null;
  onClose: () => void;
}

export function PlantSlideOut({ plantId, onClose }: PlantSlideOutProps) {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [presentation, setPresentation] = useState<PlantPresentation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!plantId) {
      setPlant(null);
      setPresentation(null);
      return;
    }

    async function fetchPlantData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch through proxy to avoid CORS
        const plantData = await getPlantClient(plantId!);
        const valuesData = plantData.values || [];

        setPlant(plantData as Plant);
        setPresentation(presentPlant(valuesData));
      } catch (err) {
        console.error('Error fetching plant data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPlantData();
  }, [plantId]);

  function getBotanicalName(p: Plant): string {
    return [p.genus, p.species].filter(Boolean).join(' ');
  }

  const ZONE_COLORS: Record<string, string> = {
    '0-5': 'bg-red-100 text-red-800 border-red-200',
    '5-10': 'bg-orange-100 text-orange-800 border-orange-200',
    '10-30': 'bg-amber-100 text-amber-800 border-amber-200',
    '30-100': 'bg-green-100 text-green-800 border-green-200',
    '50-100': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const FIRE_LEVEL_COLORS: Record<string, string> = {
    low: 'bg-green-500',
    moderate: 'bg-amber-500',
    high: 'bg-red-500',
  };

  const isOpen = !!plantId;
  return (
    <SlideOutPanel open={isOpen} onClose={onClose}>
      {loading && (
        <div className="p-6 space-y-4">
          <div className="animate-pulse">
            <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-gray-200 rounded-full w-16" />
              <div className="h-6 bg-gray-200 rounded-full w-16" />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">Error: {error}</p>
            <button
              onClick={onClose}
              className="mt-2 text-sm text-red-600 underline"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {plant && presentation && (
        <div className="p-6 space-y-6">
          {/* Image */}
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
            {plant.primaryImage ? (
              <img
                src={plant.primaryImage.url}
                alt={plant.commonName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                <svg className="w-16 h-16 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{plant.commonName}</h1>
            <p className="text-lg text-gray-600 italic mt-1">{getBotanicalName(plant)}</p>
          </div>

          {/* Fire info - prominently placed and RED */}
          {(presentation.characterScore || presentation.flammabilityNotes || presentation.riskMitigationNotes) && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg space-y-3">
              <h3 className="text-red-700 font-bold">🔥 Fire Risk</h3>
              {presentation.characterScore && (
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${FIRE_LEVEL_COLORS[presentation.characterScore.level]} flex items-center justify-center`}>
                    <span className="text-white text-lg font-bold">
                      {presentation.characterScore.value}
                    </span>
                  </div>
                  <span className="text-red-700 font-medium">{presentation.characterScore.label}</span>
                </div>
              )}
              {presentation.flammabilityNotes && (
                <div>
                  <span className="font-medium text-red-700">Flammability:</span>
                  <p className="text-sm text-gray-700 mt-1">{presentation.flammabilityNotes}</p>
                </div>
              )}
              {presentation.riskMitigationNotes && (
                <div>
                  <span className="font-medium text-amber-700">Risk reduction:</span>
                  <p className="text-sm text-gray-700 mt-1">{presentation.riskMitigationNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Zone badges */}
          {presentation.zones.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {presentation.zones.map((zoneBadge, index) => (
                <span key={index} className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full border ${ZONE_COLORS[zoneBadge.zone] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {zoneBadge.label}
                </span>
              ))}
            </div>
          )}

          {/* Attribute badges */}
          <PlantAttributeBadges presentation={presentation} size="md" />

          {/* Flammability badge */}
          <FlammabilityBadge presentation={presentation} size="md" />

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
            <div className="flex gap-3">
              <AddToListButton plantId={plant.id} />
              <PlanToggleButton
                plantId={plant.id}
                commonName={plant.commonName}
                botanicalName={getBotanicalName(plant)}
                imageUrl={plant.primaryImage?.url || null}
                className="!px-4 !py-2.5 !text-sm"
              />
            </div>
            <Link
              href={`/plants/${plant.id}`}
              className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              View Full Details
            </Link>
          </div>

          {/* Nursery availability */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Local Availability</h3>
            <NurseryAvailability lwfPlantId={plant.id} variant="full" />
          </div>
        </div>
      )}
    </SlideOutPanel>
  );
}
