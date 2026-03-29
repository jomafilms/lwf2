"use client";

type AvailabilityStatus = "in_stock" | "limited" | "out_of_stock" | "seasonal";

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string; color: string }[] = [
  { value: "in_stock", label: "In Stock", color: "bg-green-100 text-green-700" },
  { value: "limited", label: "Limited", color: "bg-yellow-100 text-yellow-700" },
  { value: "out_of_stock", label: "Out of Stock", color: "bg-red-100 text-red-700" },
  { value: "seasonal", label: "Seasonal", color: "bg-blue-100 text-blue-700" },
];

interface InventoryFiltersProps {
  selectedIds: Set<string>;
  bulkAvailability: AvailabilityStatus;
  bulkUpdating: boolean;
  onBulkAvailabilityChange: (availability: AvailabilityStatus) => void;
  onBulkUpdate: () => void;
}

export function InventoryFilters({
  selectedIds,
  bulkAvailability,
  bulkUpdating,
  onBulkAvailabilityChange,
  onBulkUpdate
}: InventoryFiltersProps) {
  if (selectedIds.size === 0) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg bg-blue-50 p-3">
      <span className="text-sm font-medium text-blue-700">
        {selectedIds.size} selected
      </span>
      <select
        value={bulkAvailability}
        onChange={(e) =>
          onBulkAvailabilityChange(e.target.value as AvailabilityStatus)
        }
        className="rounded border px-2 py-1 text-sm"
      >
        {AVAILABILITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        onClick={onBulkUpdate}
        disabled={bulkUpdating}
        className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {bulkUpdating ? "Updating..." : "Update Availability"}
      </button>
    </div>
  );
}