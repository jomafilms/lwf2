'use client';

import Link from 'next/link';
import { useCart, CONTAINER_SIZES, formatPrice } from '@/lib/cart/store';
import { ArrowLeft, Printer } from 'lucide-react';
function getSizeLabel(value: string): string {
  return CONTAINER_SIZES.find((s) => s.value === value)?.label || value;
}

export default function NurseryDemoPage() {
  const { items, total } = useCart();

  if (items.length === 0) {
    return (
      <main className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-gray-500">No plants in your plan yet.</p>
        <Link
          href="/plants"
          className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
        >
          Browse plants →
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Demo banner */}
        <div className="no-print mb-6 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
          <p className="text-sm text-blue-800">
            <strong>🔬 Demo:</strong> This is a preview of nursery integration. In production,
            this would populate the nursery&apos;s ordering system or send them a quote request.
          </p>
        </div>

        {/* Nursery header */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order Request
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Shooting Star Nursery
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Central Point, Oregon
                <br />
                shootingstarnursery.com
              </p>
            </div>
            <div className="text-right text-sm text-gray-400">
              <p>
                Date: {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="mt-1">Ref: FSP-{Date.now().toString(36).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Order table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-3 font-semibold text-gray-500 uppercase text-xs tracking-wider">
                  Plant
                </th>
                <th className="pb-3 font-semibold text-gray-500 uppercase text-xs tracking-wider">
                  Botanical Name
                </th>
                <th className="pb-3 font-semibold text-gray-500 uppercase text-xs tracking-wider text-center">
                  Qty
                </th>
                <th className="pb-3 font-semibold text-gray-500 uppercase text-xs tracking-wider">
                  Size
                </th>
                <th className="pb-3 font-semibold text-gray-500 uppercase text-xs tracking-wider text-right">
                  Unit Price
                </th>
                <th className="pb-3 font-semibold text-gray-500 uppercase text-xs tracking-wider text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.lwfPlantId}>
                  <td className="py-3 font-medium text-gray-900">
                    {item.commonName}
                  </td>
                  <td className="py-3 text-gray-500 italic">
                    {item.botanicalName}
                  </td>
                  <td className="py-3 text-center text-gray-700">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-gray-700">
                    {getSizeLabel(item.containerSize)}
                  </td>
                  <td className="py-3 text-right text-gray-700">
                    {formatPrice(item.price)}
                  </td>
                  <td className="py-3 text-right font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 mt-4 pt-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} plants)</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tax</span>
                <span>TBD</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
                <span>Estimated Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="no-print mt-8 flex items-center justify-between">
          <Link
            href="/my-plants"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to my plants
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </main>
  );
}
