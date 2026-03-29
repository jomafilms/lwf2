'use client';

import { useEffect, useState } from 'react';

interface InventoryItem {
  id: string;
  nurseryId: string;
  lwfPlantId: string;
  botanicalName: string | null;
  commonName: string | null;
  price: number | null;
  containerSize: string | null;
  availability: string | null;
  sourceUrl: string | null;
}

interface NurseryInfo {
  id: string;
  name: string;
  website: string | null;
}

interface NurseryInventoryEntry {
  nursery: NurseryInfo;
  item: InventoryItem;
}

interface NurseryAvailabilityProps {
  lwfPlantId: string;
  /** Show compact summary (card) or full list (detail page) */
  variant?: 'summary' | 'full';
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function NurseryAvailability({
  lwfPlantId,
  variant = 'summary',
}: NurseryAvailabilityProps) {
  const [entries, setEntries] = useState<NurseryInventoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAvailability() {
      try {
        // First get all nurseries
        const nurseriesRes = await fetch('/api/nurseries');
        if (!nurseriesRes.ok) throw new Error('Failed to fetch nurseries');
        const nurseriesData = await nurseriesRes.json();
        const allNurseries: NurseryInfo[] = nurseriesData.data || [];

        // Then check each nursery's inventory for this plant
        const results: NurseryInventoryEntry[] = [];

        await Promise.all(
          allNurseries.map(async (nursery) => {
            try {
              const invRes = await fetch(
                `/api/nurseries/${nursery.id}/inventory?lwfPlantId=${lwfPlantId}`
              );
              if (!invRes.ok) return;
              const invData = await invRes.json();
              const items: InventoryItem[] = invData.data || [];
              for (const item of items) {
                if (
                  item.availability !== 'out_of_stock'
                ) {
                  results.push({ nursery, item });
                }
              }
            } catch {
              // skip nursery on error
            }
          })
        );

        setEntries(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [lwfPlantId]);

  if (loading) {
    return (
      <div className="text-sm text-gray-400 animate-pulse">
        Checking nurseries…
      </div>
    );
  }

  if (error || entries.length === 0) {
    return null;
  }

  if (variant === 'summary') {
    return (
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-500 mb-1.5">
          Available at {entries.length} nurser{entries.length === 1 ? 'y' : 'ies'}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {entries.slice(0, 3).map((entry) => (
            <span
              key={entry.item.id}
              className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
            >
              {entry.nursery.name}
              {entry.item.price && (
                <span className="font-medium">
                  {formatPrice(entry.item.price)}
                </span>
              )}
            </span>
          ))}
          {entries.length > 3 && (
            <span className="text-xs text-gray-400">
              +{entries.length - 3} more
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full variant for detail page
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">
        Available at {entries.length} Nurser{entries.length === 1 ? 'y' : 'ies'}
      </h3>
      <div className="divide-y divide-gray-100">
        {entries.map((entry) => (
          <div
            key={entry.item.id}
            className="flex items-center justify-between py-3"
          >
            <div>
              <p className="font-medium text-gray-900">
                {entry.nursery.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
                {entry.item.containerSize && (
                  <span>{entry.item.containerSize}</span>
                )}
                {entry.item.availability && (
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                      entry.item.availability === 'in_stock'
                        ? 'bg-green-50 text-green-700'
                        : entry.item.availability === 'limited'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    {entry.item.availability === 'in_stock'
                      ? 'In Stock'
                      : entry.item.availability === 'limited'
                        ? 'Limited'
                        : entry.item.availability === 'seasonal'
                          ? 'Seasonal'
                          : entry.item.availability}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {entry.item.price && (
                <span className="text-lg font-semibold text-gray-900">
                  {formatPrice(entry.item.price)}
                </span>
              )}
              {(entry.item.sourceUrl || entry.nursery.website) && (
                <a
                  href={entry.item.sourceUrl || entry.nursery.website || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700"
                >
                  Visit
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
