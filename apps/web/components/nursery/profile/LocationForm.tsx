"use client";

import { MapPin } from "lucide-react";

interface LocationFormProps {
  form: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  onChange: (field: string, value: string) => void;
}

export function LocationForm({ form, onChange }: LocationFormProps) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-gray-400" />
        Location
      </h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Street Address
          </label>
          <input
            id="address"
            type="text"
            value={form.address}
            onChange={(e) => onChange('address', e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            placeholder="123 Garden Lane"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              id="city"
              type="text"
              value={form.city}
              onChange={(e) => onChange('city', e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Portland"
            />
          </div>
          
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              id="state"
              type="text"
              value={form.state}
              onChange={(e) => onChange('state', e.target.value)}
              maxLength={2}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="OR"
            />
          </div>
          
          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
              ZIP Code
            </label>
            <input
              id="zip"
              type="text"
              value={form.zip}
              onChange={(e) => onChange('zip', e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="97201"
            />
          </div>
        </div>
      </div>
    </div>
  );
}