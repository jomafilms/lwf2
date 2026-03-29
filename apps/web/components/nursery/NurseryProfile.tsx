"use client";

import { Loader2, Save } from "lucide-react";

interface NurseryData {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  isRetail: boolean;
  isWholesale: boolean;
  servesLandscapers: boolean;
}

interface NurseryForm {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  isRetail: boolean;
  isWholesale: boolean;
  servesLandscapers: boolean;
}

interface NurseryProfileProps {
  nursery: NurseryData;
  editing: boolean;
  saving: boolean;
  form: NurseryForm;
  onFormChange: (field: keyof NurseryForm, value: string | boolean) => void;
  onSave: () => void;
}

export function NurseryProfile({
  nursery,
  editing,
  saving,
  form,
  onFormChange,
  onSave
}: NurseryProfileProps) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Nursery Profile
        </h2>
        {editing && (
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => onFormChange('name', e.target.value)}
                className="mt-1 w-full rounded border px-2.5 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => onFormChange('phone', e.target.value)}
                className="mt-1 w-full rounded border px-2.5 py-1.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => onFormChange('address', e.target.value)}
              className="mt-1 w-full rounded border px-2.5 py-1.5 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500">
                City
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => onFormChange('city', e.target.value)}
                className="mt-1 w-full rounded border px-2.5 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                State
              </label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => onFormChange('state', e.target.value)}
                className="mt-1 w-full rounded border px-2.5 py-1.5 text-sm"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                ZIP
              </label>
              <input
                type="text"
                value={form.zip}
                onChange={(e) => onFormChange('zip', e.target.value)}
                className="mt-1 w-full rounded border px-2.5 py-1.5 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => onFormChange('email', e.target.value)}
                className="mt-1 w-full rounded border px-2.5 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Website
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => onFormChange('website', e.target.value)}
                className="mt-1 w-full rounded border px-2.5 py-1.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => onFormChange('description', e.target.value)}
              rows={3}
              className="mt-1 w-full rounded border px-2.5 py-1.5 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isRetail}
                onChange={(e) => onFormChange('isRetail', e.target.checked)}
                className="rounded border-gray-300 text-green-600"
              />
              <span className="text-sm text-gray-700">Retail</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isWholesale}
                onChange={(e) => onFormChange('isWholesale', e.target.checked)}
                className="rounded border-gray-300 text-green-600"
              />
              <span className="text-sm text-gray-700">Wholesale</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.servesLandscapers}
                onChange={(e) => onFormChange('servesLandscapers', e.target.checked)}
                className="rounded border-gray-300 text-green-600"
              />
              <span className="text-sm text-gray-700">
                Serves Landscapers
              </span>
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          {nursery.address && (
            <div>
              <span className="text-gray-500">Address:</span>{" "}
              <span className="text-gray-900">
                {nursery.address}
                {nursery.city && `, ${nursery.city}`}
                {nursery.state && `, ${nursery.state}`}
                {nursery.zip && ` ${nursery.zip}`}
              </span>
            </div>
          )}
          {nursery.phone && (
            <div>
              <span className="text-gray-500">Phone:</span>{" "}
              <span className="text-gray-900">{nursery.phone}</span>
            </div>
          )}
          {nursery.email && (
            <div>
              <span className="text-gray-500">Email:</span>{" "}
              <span className="text-gray-900">{nursery.email}</span>
            </div>
          )}
          {nursery.website && (
            <div>
              <span className="text-gray-500">Website:</span>{" "}
              <a
                href={nursery.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {nursery.website}
              </a>
            </div>
          )}
          {nursery.description && (
            <div>
              <span className="text-gray-500">Description:</span>{" "}
              <span className="text-gray-900">{nursery.description}</span>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            {nursery.isRetail && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                Retail
              </span>
            )}
            {nursery.isWholesale && (
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                Wholesale
              </span>
            )}
            {nursery.servesLandscapers && (
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                Serves Landscapers
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}