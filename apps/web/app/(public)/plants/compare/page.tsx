import { Suspense } from 'react';
import Link from 'next/link';
import { PlantCompare } from '@/components/plants/PlantCompare';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ComparePageProps {
  searchParams: {
    ids?: string;
  };
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

export default function ComparePage({ searchParams }: ComparePageProps) {
  // Parse plant IDs from URL params
  const plantIds = searchParams.ids ? 
    searchParams.ids.split(',').filter(Boolean).slice(0, 3) : // Max 3 plants
    [];

  if (plantIds.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
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
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
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
            <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
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
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
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
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
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
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Browse
          </Link>
          <Link
            href="/my-plants"
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
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