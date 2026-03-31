"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  ArrowLeft,
  Save,
  Loader2,
  ExternalLink,
  Eye,
  Building2,
  Upload,
  Phone,
  Mail,
  Globe,
  MapPin,
} from "lucide-react";
import { LogoUploadForm } from "@/components/nursery/profile/LogoUploadForm";
import { BasicInfoForm } from "@/components/nursery/profile/BasicInfoForm";
import { LocationForm } from "@/components/nursery/profile/LocationForm";
import { BusinessTypeForm } from "@/components/nursery/profile/BusinessTypeForm";

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

export default function NurseryProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nurseryId = searchParams.get("id");
  const { data: session, isPending: authPending } = useSession();

  const [nursery, setNursery] = useState<NurseryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    isRetail: false,
    isWholesale: false,
    servesLandscapers: false,
  });

  const fetchNursery = useCallback(async () => {
    if (!nurseryId) return;
    try {
      const res = await fetch(`/api/nurseries/${nurseryId}`);
      if (!res.ok) throw new Error("Failed to load nursery");
      const { data } = await res.json();
      setNursery(data);
      setForm({
        name: data.name || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zip: data.zip || "",
        phone: data.phone || "",
        email: data.email || "",
        website: data.website || "",
        description: data.description || "",
        isRetail: data.isRetail || false,
        isWholesale: data.isWholesale || false,
        servesLandscapers: data.servesLandscapers || false,
      });
    } catch {
      setError("Could not load nursery data");
    } finally {
      setLoading(false);
    }
  }, [nurseryId]);

  useEffect(() => {
    if (!authPending && !session?.user) {
      router.push("/sign-in?redirect_url=/dashboard/nursery/profile");
      return;
    }
    if (nurseryId) fetchNursery();
    else setLoading(false);
  }, [nurseryId, authPending, session, router, fetchNursery]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!nurseryId) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/nurseries/${nurseryId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update");
      setSuccess("Profile updated successfully");
      fetchNursery();
    } catch {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !nurseryId) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB");
      return;
    }

    setUploadingLogo(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("logo", file);
      
      const res = await fetch(`/api/nurseries/${nurseryId}/logo`, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      
      setSuccess("Logo uploaded successfully");
      fetchNursery();
    } catch {
      setError("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  }

  function handleFormChange(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  const publicUrl = nurseryId ? `/nurseries/${nurseryId}` : "";

  if (loading || authPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!nurseryId || !nursery) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="border-b bg-white">
          <div className="mx-auto max-w-4xl px-4 py-3">
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </nav>
        <main className="mx-auto max-w-4xl px-4 py-8 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-300" />
          <h1 className="mt-4 text-lg font-semibold text-gray-900">
            No Nursery Found
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Register your nursery to get started.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <Link
            href={`/dashboard/nursery?id=${nurseryId}`}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Nursery Dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Nursery Profile
            </h1>
            <p className="text-sm text-gray-500">
              Manage your public nursery information
            </p>
          </div>
          {publicUrl && (
            <Link
              href={publicUrl}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Eye className="h-4 w-4" />
              Preview Public Page
            </Link>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Logo Upload */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Logo & Branding
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                {/* TODO: Show current logo if exists */}
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  {uploadingLogo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload Logo
                </button>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG up to 5MB. Recommended: 200x200px or square format.
                </p>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Basic Information */}
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
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
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
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
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
                      onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
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
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
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
                    onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="https://www.nursery.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
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
                  onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
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
                    onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
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
                    onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))}
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
                    onChange={(e) => setForm(f => ({ ...f, zip: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="97201"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business Type */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Business Type
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.isRetail}
                  onChange={(e) => setForm(f => ({ ...f, isRetail: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Retail</span>
                <span className="text-sm text-gray-500">- Direct sales to homeowners</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.isWholesale}
                  onChange={(e) => setForm(f => ({ ...f, isWholesale: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Wholesale</span>
                <span className="text-sm text-gray-500">- Bulk sales to other businesses</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.servesLandscapers}
                  onChange={(e) => setForm(f => ({ ...f, servesLandscapers: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Serves Landscapers</span>
                <span className="text-sm text-gray-500">- Professional landscaper accounts</span>
              </label>
            </div>
          </div>

          {/* Public Profile Preview */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Public Profile Preview
            </h2>
            <div className="rounded-lg bg-gray-50 p-4 border">
              <p className="text-sm text-gray-600 mb-2">
                Your public page will be available at:
              </p>
              <div className="flex items-center gap-2">
                <code className="rounded bg-white px-2 py-1 text-sm font-mono text-green-600 border">
                  {process.env.NODE_ENV === 'development' 
                    ? `http://localhost:3000${publicUrl}`
                    : `https://yourdomain.com${publicUrl}`
                  }
                </code>
                {publicUrl && (
                  <Link
                    href={publicUrl}
                    target="_blank"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Profile
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}