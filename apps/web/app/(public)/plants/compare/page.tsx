import { Suspense } from 'react';
import Link from 'next/link';
import { PlantCompare } from '@/components/plants/PlantCompare';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ComparePageProps {
  searchParams: Promise<{
    ids?: string;
  }>;
}

// ─── Loading Component ───────────────────────────────────────────────────────

function CompareLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading plant comparison...</p>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  
  // Parse plant IDs from URL params
  const plantIds = params.ids ? 
    params.ids.split(',').filter(Boolean).slice(0, 3) : // Max 3 plants
    [];

  if (plantIds.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              No Plants to Compare
            </h1>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Select 2-3 plants from the browse page to see a side-by-side comparison 
              of their fire-safety characteristics, water needs, and more.
            </p>
            <Link
              href="/plants"
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Browse Plants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (plantIds.length === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Add More Plants
            </h1>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You have 1 plant selected. Add at least 1 more plant to start comparing 
              their characteristics side-by-side.
            </p>
            <Link
              href="/plants"
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Add More Plants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Plant Comparison
            </h1>
            <p className="text-gray-600 mt-2">
              Compare {plantIds.length} plants side-by-side to make informed decisions for your fire-reluctant landscape
            </p>
          </div>
          <Link
            href="/plants"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
          >
            Add More Plants
          </Link>
        </div>

        {/* Comparison Table */}
        <Suspense fallback={<CompareLoading />}>
          <PlantCompare plantIds={plantIds} />
        </Suspense>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/plants"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-700 font-medium"
          >
            Back to Browse
          </Link>
          <Link
            href="/my-plants"
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            Add to Plan
          </Link>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Plant Comparison | Living With Fire',
  description: 'Compare fire-reluctant plants side-by-side to make informed decisions for your landscape.',
};