'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface PlantFiltersProps {
  currentZone?: string;
  currentNative?: string;
  currentDeer?: string;
  currentWater?: string;
  currentPollinator?: string;
}

const ZONES = [
  { value: '0-5', label: '0–5 ft', description: 'Immediate zone' },
  { value: '5-10', label: '5–10 ft', description: 'Near zone' },
  { value: '10-30', label: '10–30 ft', description: 'Intermediate zone' },
  { value: '30-100', label: '30–100 ft', description: 'Extended zone' },
];

const WATER_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Moderate', label: 'Moderate' },
  { value: 'High', label: 'High' },
];

export function PlantFilters({
  currentZone,
  currentNative,
  currentDeer,
  currentWater,
  currentPollinator,
}: PlantFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page'); // Reset page on filter change
      router.push(`/plants?${params.toString()}`);
    },
    [router, searchParams]
  );

  const toggleZone = useCallback(
    (zone: string) => {
      const currentZones = currentZone ? currentZone.split(',') : [];
      const idx = currentZones.indexOf(zone);
      if (idx >= 0) {
        currentZones.splice(idx, 1);
      } else {
        currentZones.push(zone);
      }
      updateFilter('zone', currentZones.length > 0 ? currentZones.join(',') : null);
    },
    [currentZone, updateFilter]
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    ['zone', 'native', 'deer', 'water', 'pollinator', 'page'].forEach((k) =>
      params.delete(k)
    );
    router.push(`/plants?${params.toString()}`);
  }, [router, searchParams]);

  const hasFilters = currentZone || currentNative || currentDeer || currentWater || currentPollinator;
  const activeZones = currentZone ? currentZone.split(',') : [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Filters</h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-orange-600 hover:text-orange-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Zone Compatibility */}
      <div className="mb-5">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Fire Zone Compatibility
        </h3>
        <div className="space-y-1.5">
          {ZONES.map((zone) => (
            <label
              key={zone.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={activeZones.includes(zone.value)}
                onChange={() => toggleZone(zone.value)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">{zone.label}</span>
              <span className="text-xs text-gray-400">{zone.description}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Native to Oregon */}
      <div className="mb-5">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Native to Oregon
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() =>
              updateFilter('native', currentNative === 'yes' ? null : 'yes')
            }
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              currentNative === 'yes'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            🌿 Yes
          </button>
        </div>
      </div>

      {/* Deer Resistant */}
      <div className="mb-5">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Deer Resistant
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() =>
              updateFilter('deer', currentDeer === 'yes' ? null : 'yes')
            }
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              currentDeer === 'yes'
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            🦌 Yes
          </button>
        </div>
      </div>

      {/* Water Needs */}
      <div className="mb-5">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Water Needs</h3>
        <div className="flex flex-wrap gap-2">
          {WATER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                updateFilter(
                  'water',
                  currentWater === opt.value ? null : opt.value
                )
              }
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                currentWater === opt.value
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              💧 {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pollinator Friendly */}
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Pollinator Friendly
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() =>
              updateFilter(
                'pollinator',
                currentPollinator === 'yes' ? null : 'yes'
              )
            }
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              currentPollinator === 'yes'
                ? 'bg-purple-50 border-purple-200 text-purple-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            🐝 Yes
          </button>
        </div>
      </div>
    </div>
  );
}
