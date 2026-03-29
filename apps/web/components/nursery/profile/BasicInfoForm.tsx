"use client";

import { Phone, Mail, Globe } from "lucide-react";

interface BasicInfoFormProps {
  form: {
    name: string;
    description: string;
    phone: string;
    email: string;
    website: string;
  };
  onChange: (field: string, value: string) => void;
}

export function BasicInfoForm({ form, onChange }: BasicInfoFormProps) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Basic Information
      </h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nursery Name *
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            placeholder="Green Thumb Nursery"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => onChange('description', e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            placeholder="Tell customers about your nursery, specialties, and what makes you unique..."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => onChange('email', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="info@nursery.com"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Website URL
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="website"
              type="url"
              value={form.website}
              onChange={(e) => onChange('website', e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="https://www.nursery.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
}