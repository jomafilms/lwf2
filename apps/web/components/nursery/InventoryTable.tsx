"use client";

import Link from "next/link";
import { Leaf, Trash2, Upload } from "lucide-react";

type AvailabilityStatus = "in_stock" | "limited" | "out_of_stock" | "seasonal";

interface InventoryItem {
  id: string;
  botanicalName: string | null;
  commonName: string | null;
  price: number | null;
  containerSize: string | null;
  availability: string | null;
  lwfPlantId: string | null;
  lastUpdated: string | null;
}

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string; color: string }[] = [
  { value: "in_stock", label: "In Stock", color: "bg-green-100 text-green-700" },
  { value: "limited", label: "Limited", color: "bg-yellow-100 text-yellow-700" },
  { value: "out_of_stock", label: "Out of Stock", color: "bg-red-100 text-red-700" },
  { value: "seasonal", label: "Seasonal", color: "bg-blue-100 text-blue-700" },
];

interface InventoryTableProps {
  inventory: InventoryItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onDelete: (id: string) => void;
}

export function InventoryTable({
  inventory,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onDelete
}: InventoryTableProps) {
  if (inventory.length === 0) {
    return (
      <div className="py-8 text-center">
        <Upload className="mx-auto h-8 w-8 text-gray-300" />
        <p className="mt-2 text-sm text-gray-500">
          No inventory items yet. Upload a CSV or add items manually.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left">
              <input
                type="checkbox"
                checked={
                  selectedIds.size === inventory.length &&
                  inventory.length > 0
                }
                onChange={onToggleSelectAll}
                className="rounded border-gray-300"
              />
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">
              Botanical Name
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">
              Common Name
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">
              Price
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">
              Size
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">
              Status
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-500">
              LWF
            </th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {inventory.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.id)}
                  onChange={() => onToggleSelect(item.id)}
                  className="rounded border-gray-300"
                />
              </td>
              <td className="px-3 py-2 text-gray-900 italic">
                {item.botanicalName || "—"}
              </td>
              <td className="px-3 py-2 text-gray-600">
                {item.commonName || "—"}
              </td>
              <td className="px-3 py-2 text-gray-600">
                {item.price
                  ? `$${(item.price / 100).toFixed(2)}`
                  : "—"}
              </td>
              <td className="px-3 py-2 text-gray-600">
                {item.containerSize || "—"}
              </td>
              <td className="px-3 py-2">
                {item.availability ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      AVAILABILITY_OPTIONS.find(
                        (o) => o.value === item.availability
                      )?.color || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {AVAILABILITY_OPTIONS.find(
                      (o) => o.value === item.availability
                    )?.label || item.availability}
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-3 py-2">
                {item.lwfPlantId ? (
                  <Link
                    href={`/plants/${item.lwfPlantId}`}
                    className="text-green-600 hover:underline"
                  >
                    <Leaf className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-gray-400 hover:text-red-500"
                  title="Delete item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}