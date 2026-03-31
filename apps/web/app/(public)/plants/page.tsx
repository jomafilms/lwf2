import { Suspense } from 'react';
import { getPlants, getValuesBulk } from '@/lib/api/lwf';
import type { Plant, ResolvedValue } from '@lwf/types';
import { PlantGridWithSlideOut } from '@/components/plants/PlantGridWithSlideOut';
import { PlantFilters } from '@/components/plants/PlantFilters';
import { Pagination } from '@/components/plants/Pagination';
import { CompareFloatingButton } from '@/components/plants/CompareFloatingButton';
import { PlantCard } from '@/components/plants/PlantCard';
import { CollectionGridWithExpand } from '@/components/lists/CollectionGridWithExpand';
import Link from 'next/link';

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
  showAll?: string;
  [key: string]: string | undefined;
}

/** Parse bulk values API response into a flat map of plantId → ResolvedValue[] */
function parseBulkValues(bulkResult: Record<string, unknown>): Record<string, ResolvedValue[]> {
  const map: Record<string, ResolvedValue[]> = {};
  const raw = bulkResult;
  const dataObj = raw.data as Record<string, unknown> | undefined;
  const valuesObj = (dataObj?.values || dataObj || raw) as Record<string, unknown>;

  for (const [plantId, plantEntry] of Object.entries(valuesObj)) {
    if (plantId === 'meta') continue;
    if (Array.isArray(plantEntry)) {
      map[plantId] = plantEntry as ResolvedValue[];
    } else if (plantEntry && typeof plantEntry === 'object') {
      const allValues: ResolvedValue[] = [];
      for (const [attrId, attrValues] of Object.entries(plantEntry as Record<string, unknown>)) {
        if (Array.isArray(attrValues)) {
          allValues.push(...(attrValues as ResolvedValue[]).map(v => ({
            ...v,
            attributeId: v.attributeId || attrId,
          })));
        }
      }
      if (allValues.length > 0) {
        map[plantId] = allValues;
      }
    }
  }
  return map;
}

async function fetchFeaturedPlants() {
  try {
    // Fetch enough plants to find ones with images (most don't have images)
    const plantsResponse = await getPlants({
      limit: 200,
      includeImages: true,
    });

    const plantsWithImages = plantsResponse.data.filter(plant => plant.primaryImage?.url);
    
    if (plantsWithImages.length === 0) {
      return { plants: [], valuesMap: {} };
    }

    // Fetch attribute values for these plants
    let valuesMap: Record<string, ResolvedValue[]> = {};
    try {
      const bulkResult = await getValuesBulk({
        plantIds: plantsWithImages.map(p => p.id),
        attributeIds: Object.values(ATTR_IDS),
        resolve: true,
      });
      valuesMap = parseBulkValues(bulkResult as Record<string, unknown>);
    } catch {
      console.warn('Failed to fetch bulk values for featured plants');
    }

    // Filter for plants with Zone 0-5 rating AND interesting attributes
    const featuredPlants = plantsWithImages.filter(plant => {
      const values = valuesMap[plant.id] || [];
      
      // Check for Zone 0-5 rating
      const hizValues = values.filter(v => v.attributeId === ATTR_IDS.HIZ);
      const hasZone0to5 = hizValues.some(v => 
        v.resolved?.value === '0-5' || v.resolved?.value === '5-10'
      );
      
      // Check for interesting attributes
      const isNative = values.some(v => 
        v.attributeId === ATTR_IDS.OREGON_NATIVE && v.resolved?.value === 'Yes'
      );
      const isDeerResistant = values.some(v => 
        v.attributeId === ATTR_IDS.DEER_RESISTANCE && 
        (v.resolved?.value === 'High (Usually)' || v.resolved?.value === 'Some')
      );
      const isPollinator = values.some(v => 
        v.attributeId === ATTR_IDS.BENEFITS && 
        v.resolved?.value?.toLowerCase().includes('pollinator')
      );
      
      return hasZone0to5 && (isNative || isDeerResistant || isPollinator);
    });

    // Dedupe by image URL so varieties sharing the same photo don't repeat
    const seenImages = new Set<string>();
    const uniqueFeatured = featuredPlants.filter(plant => {
      const url = plant.primaryImage?.url;
      if (!url || seenImages.has(url)) return false;
      seenImages.add(url);
      return true;
    });

    return { plants: uniqueFeatured.slice(0, 10), valuesMap };
  } catch (error) {
    console.error('Error fetching featured plants:', error);
    return { plants: [], valuesMap: {} };
  }
}

async function fetchCollections() {
  try {
    const demoLists = (await import('@/lib/data/demo-lists.json')).default;
    return demoLists.lists || [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

async function fetchPlantsWithValues(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1', 10);

  const hasActiveFilters =
    searchParams.zone ||
    searchParams.native ||
    searchParams.deer ||
    searchParams.water ||
    searchParams.pollinator;

  if (hasActiveFilters) {
    // Step 1: Fetch ALL attribute values for the active filter attributes (no plantIds = all plants)
    const filterAttrIds = [
      ...(searchParams.zone ? [ATTR_IDS.HIZ] : []),
      ...(searchParams.native === 'yes' ? [ATTR_IDS.OREGON_NATIVE] : []),
      ...(searchParams.deer === 'yes' ? [ATTR_IDS.DEER_RESISTANCE] : []),
      ...(searchParams.water ? [ATTR_IDS.WATER_AMOUNT] : []),
      ...(searchParams.pollinator === 'yes' ? [ATTR_IDS.BENEFITS] : []),
    ];

    const bulkResult = await getValuesBulk({
      attributeIds: filterAttrIds,
      resolve: true,
    });

    const allValuesMap = parseBulkValues(bulkResult as Record<string, unknown>);

    // Step 2: Filter to matching plant IDs
    const matchingIds = Object.keys(allValuesMap).filter(plantId => {
      const values = allValuesMap[plantId] || [];
      return matchesFilters(values, searchParams);
    });

    if (matchingIds.length === 0) {
      return { plants: [], total: 0, page: 1, valuesMap: {} };
    }

    // Step 3: Fetch ALL plant objects (two pages since API max is 1000)
    const matchingSet = new Set(matchingIds);
    const [page1, page2] = await Promise.all([
      getPlants({ search: searchParams.search || undefined, limit: 1000, offset: 0, includeImages: true }),
      getPlants({ search: searchParams.search || undefined, limit: 1000, offset: 1000, includeImages: true }),
    ]);
    const allPlants = [...page1.data, ...page2.data];
    const plants = allPlants.filter(p => matchingSet.has(p.id));

    // Step 4: Fetch display attribute values for the matching plants
    let valuesMap: Record<string, ResolvedValue[]> = {};
    if (plants.length > 0) {
      try {
        const displayBulk = await getValuesBulk({
          plantIds: plants.map(p => p.id),
          attributeIds: Object.values(ATTR_IDS),
          resolve: true,
        });
        valuesMap = parseBulkValues(displayBulk as Record<string, unknown>);
      } catch {
        // Use filter values as fallback
        valuesMap = allValuesMap;
      }
    }

    return { plants, total: plants.length, page: 1, valuesMap };
  }

  // No filters — simple paginated fetch
  const offset = (page - 1) * PAGE_SIZE;
  const plantsResponse = await getPlants({
    search: searchParams.search || undefined,
    limit: PAGE_SIZE,
    offset,
    includeImages: true,
  });

  const plants = plantsResponse.data;
  const total = plantsResponse.meta.pagination.total;

  let valuesMap: Record<string, ResolvedValue[]> = {};
  if (plants.length > 0) {
    try {
      const bulkResult = await getValuesBulk({
        plantIds: plants.map(p => p.id),
        attributeIds: Object.values(ATTR_IDS),
        resolve: true,
      });
      valuesMap = parseBulkValues(bulkResult as Record<string, unknown>);
    } catch {
      console.warn('Failed to fetch bulk values for plant cards');
    }
  }

  return { plants, total, page, valuesMap };
}

function matchesFilters(values: ResolvedValue[], params: SearchParams): boolean {
  if (params.zone) {
    const zoneValues = values
      .filter(v => v.attributeId === ATTR_IDS.HIZ)
      .map(v => v.resolved?.value);
    const zones = params.zone.split(',');
    if (!zones.some(z => zoneValues.includes(z))) return false;
  }
  if (params.native === 'yes') {
    const nativeValues = values.filter(v => v.attributeId === ATTR_IDS.OREGON_NATIVE);
    if (!nativeValues.some(v => v.resolved?.value === 'Yes')) return false;
  }
  if (params.deer === 'yes') {
    const deerValues = values.filter(v => v.attributeId === ATTR_IDS.DEER_RESISTANCE);
    if (!deerValues.some(v => v.resolved?.value === 'High (Usually)' || v.resolved?.value === 'Some')) return false;
  }
  if (params.water) {
    const waterValues = values.filter(v => v.attributeId === ATTR_IDS.WATER_AMOUNT);
    if (!waterValues.some(v => v.resolved?.value === params.water)) return false;
  }
  if (params.pollinator === 'yes') {
    const benefitValues = values.filter(v => v.attributeId === ATTR_IDS.BENEFITS);
    if (!benefitValues.some(v => v.resolved?.value?.toLowerCase().includes('pollinator'))) return false;
  }
  return true;
}

// ─── Page ────────────────────────────────────────────────────────────────────

// ISR: cache for 5 minutes, rebuild in background
export const revalidate = 300;

export const metadata = {
  title: 'Browse Plants — LWF',
  description:
    'Browse fire-reluctant plants for your landscape. Filter by zone, water needs, native status, and more.',
};

export default async function PlantsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const showAllPlants = params.showAll === 'true';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!showAllPlants ? (
          <>
            {/* Section 1: Featured Plants */}
            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Plants</h2>
              <Suspense fallback={<FeaturedPlantsSkeleton />}>
                <FeaturedPlantsRow />
              </Suspense>
            </section>

            {/* Section 2: Plant Lists */}
            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Plant Lists</h2>
              <p className="text-sm text-gray-600 mb-6">
                Lists shared by nurseries, HOAs, and community organizations
              </p>
              <Suspense fallback={<CollectionsSkeleton />}>
                <CollectionsGrid />
              </Suspense>
            </section>

            {/* Section 3: Browse All Plants (collapsible) */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Browse All Plants</h2>
                  <p className="text-sm text-gray-500">Explore our complete database of fire-reluctant plants</p>
                </div>
                <Link
                  href="/plants?showAll=true"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Show All Plants
                </Link>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Full browse mode */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">All Plants</h2>
                <p className="text-sm text-gray-500">Complete database of fire-reluctant plants</p>
              </div>
              <Link
                href="/plants"
                className="text-sm text-orange-500 hover:text-orange-600"
              >
                ← Back to Collections
              </Link>
            </div>

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
          </>
        )}
      </div>
      
      {/* Floating compare button */}
      <CompareFloatingButton />
    </div>
  );
}

// ─── Featured Plants Row ──────────────────────────────────────────────────

async function FeaturedPlantsRow() {
  const { plants, valuesMap } = await fetchFeaturedPlants();

  if (plants.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No featured plants available</p>
      </div>
    );
  }

  return (
    <PlantGridWithSlideOut plants={plants} valuesMap={valuesMap} />
  );
}

// ─── Collections Grid ─────────────────────────────────────────────────────

async function CollectionsGrid() {
  const collections = await fetchCollections();

  if (collections.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No collections available</p>
      </div>
    );
  }

  return <CollectionGridWithExpand collections={collections} />;
}

// ─── Browse All Plants (existing grid) ──────────────────────────────────────

async function PlantGrid({ searchParams }: { searchParams: SearchParams }) {
  const { plants, total, page, valuesMap } =
    await fetchPlantsWithValues(searchParams);

  const hasActiveFilters =
    searchParams.zone ||
    searchParams.native ||
    searchParams.deer ||
    searchParams.water ||
    searchParams.pollinator;

  const paginatedPlants = plants;
  const totalPages = hasActiveFilters ? 1 : Math.ceil(total / PAGE_SIZE);
  const showingCount = plants.length;
  const totalCount = total;

  if (paginatedPlants.length === 0) {
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
        {hasActiveFilters ? (
          <>
            Showing {showingCount} filtered plants
            {searchParams.search && (
              <span>
                {' '}
                matching &ldquo;{searchParams.search}&rdquo;
              </span>
            )}
          </>
        ) : (
          <>
            Showing {showingCount} of {totalCount.toLocaleString()} plants
            {searchParams.search && (
              <span>
                {' '}
                matching &ldquo;{searchParams.search}&rdquo;
              </span>
            )}
          </>
        )}
      </p>

      <PlantGridWithSlideOut
        plants={paginatedPlants}
        valuesMap={valuesMap}
      />

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

// ─── Loading skeletons ────────────────────────────────────────────────────────

function FeaturedPlantsSkeleton() {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 pb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-none w-80 bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
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
    </div>
  );
}

function CollectionsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
          <div className="h-4 bg-gray-100 rounded w-full mb-2" />
          <div className="h-4 bg-gray-100 rounded w-2/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

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