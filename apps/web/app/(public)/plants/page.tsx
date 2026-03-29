import { Suspense } from 'react';
import { getPlants, getValuesBulk } from '@/lib/api/lwf';
import type { Plant, ResolvedValue } from '@lwf/types';
import { PlantCard } from '@/components/plants/PlantCard';
import { PlantFilters } from '@/components/plants/PlantFilters';
import { PlantSearch } from '@/components/plants/PlantSearch';
import { Pagination } from '@/components/plants/Pagination';

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 24;

const ATTR_IDS = {
  HIZ: 'b908b170-70c9-454d-a2ed-d86f98cb3de1',
  WATER_AMOUNT: 'd9174148-6563-4f92-9673-01feb6a529ce',
  OREGON_NATIVE: 'd5fb9f61-41dd-4e4e-bc5e-47eb24ecab46',
  DEER_RESISTANCE: 'ff4c4d0e-35d5-4804-aea3-2a6334ef8cb5',
  BENEFITS: 'ff75e529-5b5c-4461-8191-0382e33a4bd5',
};

// ─── Data fetching ───────────────────────────────────────────────────────────

interface SearchParams {
  search?: string;
  page?: string;
  zone?: string;
  native?: string;
  deer?: string;
  water?: string;
  pollinator?: string;
  [key: string]: string | undefined;
}

async function fetchPlantsWithValues(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1', 10);
  const offset = (page - 1) * PAGE_SIZE;

  const plantsResponse = await getPlants({
    search: searchParams.search || undefined,
    limit: PAGE_SIZE,
    offset,
    includeImages: true,
  });

  const plants = plantsResponse.data;
  const total = plantsResponse.meta.pagination.total;

  // Fetch attribute values for all plants in bulk
  let valuesMap: Record<string, ResolvedValue[]> = {};

  if (plants.length > 0) {
    const plantIds = plants.map((p) => p.id);
    const attributeIds = Object.values(ATTR_IDS);

    try {
      const bulkResult = await getValuesBulk({
        plantIds,
        attributeIds,
        resolve: true,
      });

      // The bulk endpoint returns a structure keyed by plantId
      // Parse it into our map
      if (bulkResult && typeof bulkResult === 'object') {
        const data = (bulkResult as Record<string, unknown>).data || bulkResult;
        for (const plantId of plantIds) {
          const plantValues = (data as Record<string, unknown>)[plantId];
          if (Array.isArray(plantValues)) {
            valuesMap[plantId] = plantValues as ResolvedValue[];
          }
        }
      }
    } catch {
      // If bulk fetch fails, cards will just show without attribute pills
      console.warn('Failed to fetch bulk values for plant cards');
    }
  }

  return { plants, total, page, valuesMap };
}

function filterPlants(
  plants: Plant[],
  valuesMap: Record<string, ResolvedValue[]>,
  params: SearchParams
): Plant[] {
  return plants.filter((plant) => {
    const values = valuesMap[plant.id] || [];

    // Zone filter
    if (params.zone) {
      const zoneValues = values
        .filter((v) => v.attributeId === ATTR_IDS.HIZ)
        .map((v) => v.resolved?.value);
      const zones = params.zone.split(',');
      const hasMatchingZone = zones.some((z) => zoneValues.includes(z));
      if (!hasMatchingZone) return false;
    }

    // Native filter
    if (params.native === 'yes') {
      const nativeValues = values.filter(
        (v) => v.attributeId === ATTR_IDS.OREGON_NATIVE
      );
      if (!nativeValues.some((v) => v.resolved?.value === 'Yes')) return false;
    }

    // Deer resistant filter
    if (params.deer === 'yes') {
      const deerValues = values.filter(
        (v) => v.attributeId === ATTR_IDS.DEER_RESISTANCE
      );
      if (
        !deerValues.some(
          (v) =>
            v.resolved?.value === 'High (Usually)' ||
            v.resolved?.value === 'Some'
        )
      )
        return false;
    }

    // Water needs filter
    if (params.water) {
      const waterValues = values.filter(
        (v) => v.attributeId === ATTR_IDS.WATER_AMOUNT
      );
      if (!waterValues.some((v) => v.resolved?.value === params.water))
        return false;
    }

    // Pollinator filter
    if (params.pollinator === 'yes') {
      const benefitValues = values.filter(
        (v) => v.attributeId === ATTR_IDS.BENEFITS
      );
      if (
        !benefitValues.some((v) =>
          v.resolved?.value?.toLowerCase().includes('pollinator')
        )
      )
        return false;
    }

    return true;
  });
}

// ─── Page ────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Browse Plants — FireScape',
  description:
    'Browse fire-reluctant plants for your landscape. Filter by zone, water needs, native status, and more.',
};

export default async function PlantsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Browse Plants
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Find fire-reluctant plants for your landscape
              </p>
            </div>
            <a
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Home
            </a>
          </div>

          {/* Search */}
          <div className="mt-4">
            <PlantSearch initialSearch={params.search || ''} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          {/* Filters sidebar */}
          <aside className="mb-6 lg:mb-0">
            <PlantFilters
              currentZone={params.zone}
              currentNative={params.native}
              currentDeer={params.deer}
              currentWater={params.water}
              currentPollinator={params.pollinator}
            />
          </aside>

          {/* Plant grid */}
          <main>
            <Suspense fallback={<PlantGridSkeleton />}>
              <PlantGrid searchParams={params} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Server component for the grid ──────────────────────────────────────────

async function PlantGrid({ searchParams }: { searchParams: SearchParams }) {
  const { plants, total, page, valuesMap } =
    await fetchPlantsWithValues(searchParams);

  // Apply client-side filtering based on attribute values
  const hasActiveFilters =
    searchParams.zone ||
    searchParams.native ||
    searchParams.deer ||
    searchParams.water ||
    searchParams.pollinator;

  const filteredPlants = hasActiveFilters
    ? filterPlants(plants, valuesMap, searchParams)
    : plants;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (filteredPlants.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="w-16 h-16 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <h2 className="text-lg font-medium text-gray-900">No plants found</h2>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-500 mb-4">
        Showing {filteredPlants.length} of {total.toLocaleString()} plants
        {searchParams.search && (
          <span>
            {' '}
            matching &ldquo;{searchParams.search}&rdquo;
          </span>
        )}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPlants.map((plant) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            values={valuesMap[plant.id] || []}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            searchParams={searchParams}
          />
        </div>
      )}
    </>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────────────────

function PlantGridSkeleton() {
  return (
    <>
      <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
          >
            <div className="aspect-[4/3] bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="flex gap-1 mt-2">
                <div className="h-5 bg-gray-100 rounded-full w-16" />
                <div className="h-5 bg-gray-100 rounded-full w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
