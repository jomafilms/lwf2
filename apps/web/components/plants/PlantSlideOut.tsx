'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Plant, ResolvedValue } from '@lwf/types';
import { SlideOutPanel } from '@/components/ui/SlideOutPanel';
import { presentPlant, type PlantPresentation } from '@/lib/plants/present';
import { AddToListButton } from './AddToListButton';
import { NurseryAvailability } from './NurseryAvailability';
import { useCart } from '@/lib/cart/store';
import { toast } from '@/components/ui/Toast';
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

  const { addToCart, isInCart } = useCart();

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

  function handleAddToPlan() {
    if (!plant) return;
    if (isInCart(plant.id)) return;

    addToCart({
      lwfPlantId: plant.id,
      commonName: plant.commonName,
      botanicalName: getBotanicalName(plant),
      imageUrl: plant.primaryImage?.url || null,
      nurseryId: null,
    });
    toast('Added to plan!');
  }

  function getZoneColor(zone: string) {
    const zoneColors: Record<string, string> = {
      '0-5': 'bg-red-100 text-red-800 border-red-200',
      '5-10': 'bg-orange-100 text-orange-800 border-orange-200',
      '10-30': 'bg-amber-100 text-amber-800 border-amber-200',
      '30-100': 'bg-green-100 text-green-800 border-green-200',
      '50-100': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };
    return zoneColors[zone] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  function getCharacterScoreColor(level: string) {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  const isOpen = !!plantId;
  const inCart = plant ? isInCart(plant.id) : false;

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

          {/* Zone badges */}
          {presentation.zones.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {presentation.zones.map((zoneBadge, index) => (
                <span key={index} className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full border ${getZoneColor(zoneBadge.zone)}`}>
                  {zoneBadge.label}
                </span>
              ))}
            </div>
          )}

          {/* Character score */}
          {presentation.characterScore && (
            <span className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full border ${getCharacterScoreColor(presentation.characterScore.level)}`}>
              {presentation.characterScore.label}
            </span>
          )}

          {/* Quick facts */}
          <div className="flex flex-wrap gap-2">
            {presentation.waterNeeds && (
              <span className="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                Water: {presentation.waterNeeds}
              </span>
            )}
            {presentation.nativeStatus && (
              <span className="inline-flex items-center text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                Native
              </span>
            )}
            {presentation.deerResistance && (
              <span className="inline-flex items-center text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                Deer Resistant
              </span>
            )}
            {presentation.lightNeeds && (
              <span className="inline-flex items-center text-xs bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full">
                {presentation.lightNeeds}
              </span>
            )}
          </div>

          {/* Fire info */}
          {(presentation.flammabilityNotes || presentation.riskMitigationNotes) && (
            <div className="space-y-2 text-sm text-gray-600">
              <h3 className="font-semibold text-gray-900">Fire Information</h3>
              {presentation.flammabilityNotes && <p>{presentation.flammabilityNotes}</p>}
              {presentation.riskMitigationNotes && <p>{presentation.riskMitigationNotes}</p>}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
            <div className="flex gap-3">
              <AddToListButton plantId={plant.id} />
              <button
                onClick={handleAddToPlan}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  inCart
                    ? 'bg-green-500 text-white'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {inCart ? 'In Plan' : 'Add to Plan'}
              </button>
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
