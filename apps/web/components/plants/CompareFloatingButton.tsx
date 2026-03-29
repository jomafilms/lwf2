'use client';

import Link from 'next/link';
import { useCompare } from '@/lib/compare/store';

export function CompareFloatingButton() {
  const { items, count, getCompareUrl, clearCompare } = useCompare();

  // Only show if we have 2+ items
  if (count < 2) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-full shadow-lg border border-gray-200 p-3">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Compare {count} plant{count !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Clear button */}
            <button
              onClick={clearCompare}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear comparison"
            >
              ✕
            </button>

            {/* Compare button */}
            <Link
              href={getCompareUrl()}
              className="inline-flex items-center gap-1 bg-orange-600 text-white px-3 py-2 rounded-full font-medium hover:bg-orange-700 transition-colors shadow-sm text-sm"
            >
              Compare
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}