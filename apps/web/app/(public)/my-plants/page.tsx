'use client';

import Link from 'next/link';
import { useCart, CONTAINER_SIZES, formatPrice } from '@/lib/cart/store';
import { TreePine, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
export default function MyPlantsPage() {
  const { items, count, total, removeFromCart, updateQuantity, updateContainerSize, clearCart } =
    useCart();

  if (count === 0) {
    return (
      <main className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
          <div className="rounded-full bg-gray-100 p-6 mb-6">
            <TreePine className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">No plants yet</h1>
          <p className="mt-2 text-gray-500 max-w-md">
            Browse our fire-reluctant plant database and add plants to your plan.
          </p>
          <Link
            href="/plants"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
          >
            Browse Plants
            <ArrowRight className="h-4 w-4" />
          </Link>
        </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Plant Plan</h1>
            <p className="text-gray-500 mt-1">
              {count} plant{count !== 1 ? 's' : ''} in your plan
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.lwfPlantId}
              className="flex gap-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
            >
              {/* Image */}
              <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.commonName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <TreePine className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {item.commonName}
                </h3>
                <p className="text-sm text-gray-500 italic truncate">
                  {item.botanicalName}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {/* Quantity */}
                  <label className="flex items-center gap-1.5 text-sm">
                    <span className="text-gray-500">Qty:</span>
                    <select
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.lwfPlantId, parseInt(e.target.value))
                      }
                      className="rounded border border-gray-200 px-2 py-1 text-sm bg-white"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Container size */}
                  <label className="flex items-center gap-1.5 text-sm">
                    <span className="text-gray-500">Size:</span>
                    <select
                      value={item.containerSize}
                      onChange={(e) =>
                        updateContainerSize(item.lwfPlantId, e.target.value)
                      }
                      className="rounded border border-gray-200 px-2 py-1 text-sm bg-white"
                    >
                      {CONTAINER_SIZES.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {/* Price & Remove */}
              <div className="flex flex-col items-end justify-between">
                <span className="font-semibold text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
                <button
                  onClick={() => removeFromCart(item.lwfPlantId)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove plant"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500">Estimated total</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(total)}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Prices are estimates based on typical nursery pricing. Actual prices may vary.
          </p>
          <Link
            href="/nursery-demo"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            Send to Shooting Star Nursery
          </Link>
        </div>
      </main>
  );
}
