"use client";

import { Package, Leaf } from "lucide-react";

interface NurseryStatsProps {
  inventoryCount: number;
  matchedCount: number;
  lastUpdated: string | undefined;
}

export function NurseryStats({ inventoryCount, matchedCount, lastUpdated }: NurseryStatsProps) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Package className="h-5 w-5 text-gray-400" />
        Inventory Summary
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-2xl font-bold text-gray-900">
            {inventoryCount}
          </p>
          <p className="text-sm text-gray-500">Total items</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-2xl font-bold text-green-700 flex items-center gap-1">
            <Leaf className="h-5 w-5" />
            {matchedCount}
          </p>
          <p className="text-sm text-green-600">
            Matched to fire database
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-900">
            {lastUpdated
              ? new Date(lastUpdated).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Never"}
          </p>
          <p className="text-sm text-gray-500">Last updated</p>
        </div>
      </div>
    </div>
  );
}