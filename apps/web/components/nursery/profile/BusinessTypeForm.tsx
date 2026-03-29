"use client";

interface BusinessTypeFormProps {
  form: {
    isRetail: boolean;
    isWholesale: boolean;
    servesLandscapers: boolean;
  };
  onChange: (field: string, value: boolean) => void;
}

export function BusinessTypeForm({ form, onChange }: BusinessTypeFormProps) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Business Type
      </h2>
      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.isRetail}
            onChange={(e) => onChange('isRetail', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm font-medium text-gray-700">Retail</span>
          <span className="text-sm text-gray-500">- Direct sales to homeowners</span>
        </label>
        
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.isWholesale}
            onChange={(e) => onChange('isWholesale', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm font-medium text-gray-700">Wholesale</span>
          <span className="text-sm text-gray-500">- Bulk sales to other businesses</span>
        </label>
        
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.servesLandscapers}
            onChange={(e) => onChange('servesLandscapers', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm font-medium text-gray-700">Serves Landscapers</span>
          <span className="text-sm text-gray-500">- Professional landscaper accounts</span>
        </label>
      </div>
    </div>
  );
}