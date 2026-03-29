"use client";

type AvailabilityStatus = "in_stock" | "limited" | "out_of_stock" | "seasonal";

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string; color: string }[] = [
  { value: "in_stock", label: "In Stock", color: "bg-green-100 text-green-700" },
  { value: "limited", label: "Limited", color: "bg-yellow-100 text-yellow-700" },
  { value: "out_of_stock", label: "Out of Stock", color: "bg-red-100 text-red-700" },
  { value: "seasonal", label: "Seasonal", color: "bg-blue-100 text-blue-700" },
];

interface ManualAddFormProps {
  addForm: {
    botanicalName: string;
    commonName: string;
    price: string;
    containerSize: string;
    availability: AvailabilityStatus;
  };
  onFormChange: (field: keyof ManualAddFormProps['addForm'], value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ManualAddForm({ addForm, onFormChange, onSubmit }: ManualAddFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="mb-4 rounded-lg bg-gray-50 p-4 space-y-3"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <input
          type="text"
          value={addForm.botanicalName}
          onChange={(e) => onFormChange('botanicalName', e.target.value)}
          placeholder="Botanical name *"
          className="rounded border px-2.5 py-1.5 text-sm"
          required
        />
        <input
          type="text"
          value={addForm.commonName}
          onChange={(e) => onFormChange('commonName', e.target.value)}
          placeholder="Common name"
          className="rounded border px-2.5 py-1.5 text-sm"
        />
        <input
          type="text"
          value={addForm.price}
          onChange={(e) => onFormChange('price', e.target.value)}
          placeholder="Price (e.g. 12.99)"
          className="rounded border px-2.5 py-1.5 text-sm"
        />
        <input
          type="text"
          value={addForm.containerSize}
          onChange={(e) => onFormChange('containerSize', e.target.value)}
          placeholder="Container size"
          className="rounded border px-2.5 py-1.5 text-sm"
        />
        <select
          value={addForm.availability}
          onChange={(e) =>
            onFormChange('availability', e.target.value)
          }
          className="rounded border px-2.5 py-1.5 text-sm"
        >
          {AVAILABILITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700"
      >
        Add Item
      </button>
    </form>
  );
}