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
      <div className="bg-white rounded-full shadow-lg border border-gray-200 p-1">
        <div className="flex items-center gap-3 pr-4">
          {/* Plant thumbnails */}
          <div className="flex items-center -space-x-2">
            {items.slice(0, 3).map((item, index) => (
              <div
                key={item.id}
                className="relative w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden"
                style={{ zIndex: 10 - index }}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.commonName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                    <svg
                      className="w-4 h-4 text-green-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            {count > 3 && (
              <div className="relative w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                +{count - 3}
              </div>
            )}
          </div>

          {/* Text and actions */}
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Compare {count} plant{count !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500">
                See side-by-side analysis
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Clear button */}
              <button
                onClick={clearCompare}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear comparison"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Compare button */}
              <Link
                href={getCompareUrl()}
                className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-full font-medium hover:bg-orange-700 transition-colors shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Compare
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}