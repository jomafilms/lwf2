"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  Building2,
  Upload,
  ExternalLink,
  Pencil,
  Package,
  Loader2,
  ArrowLeft,
  Save,
  Leaf,
} from "lucide-react";

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
  inventoryCount: number;
  inventory: Array<{ lwfPlantId: string | null; lastUpdated: string | null }>;
}

export default function NurseryDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nurseryId = searchParams.get("id");
  const { data: session, isPending: authPending } = useSession();

  const [nursery, setNursery] = useState<NurseryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
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
      router.push("/sign-in?redirect_url=/dashboard/nursery");
      return;
    }
    if (nurseryId) fetchNursery();
    else setLoading(false);
  }, [nurseryId, authPending, session, router, fetchNursery]);

  async function handleSave() {
    if (!nurseryId) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/nurseries/${nurseryId}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update");
      setSuccess("Profile updated successfully");
      setEditing(false);
      fetchNursery();
    } catch {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

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
          <Link
            href="/nurseries/register"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <Building2 className="h-4 w-4" />
            Register Nursery
          </Link>
        </main>
      </div>
    );
  }

  const matchedCount = nursery.inventory.filter((i) => i.lwfPlantId).length;
  const lastUpdated = nursery.inventory
    .map((i) => i.lastUpdated)
    .filter(Boolean)
    .sort()
    .pop();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Building2 className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {nursery.name}
              </h1>
              <p className="text-sm text-gray-500">Nursery Dashboard</p>
            </div>
          </div>
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

        {/* Quick Actions */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href={`/dashboard/nursery/inventory?id=${nurseryId}`}
            className="group rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <Upload className="h-5 w-5 text-green-600" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900 group-hover:text-green-600">
              Upload Inventory
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              CSV upload or manual entry
            </p>
          </Link>
          <Link
            href={`/nurseries/${nurseryId}`}
            className="group rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <ExternalLink className="h-5 w-5 text-blue-600" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900 group-hover:text-blue-600">
              View Public Page
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              See what customers see
            </p>
          </Link>
          <Link
            href={`/dashboard/nursery/profile?id=${nurseryId}`}
            className="group rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <Pencil className="h-5 w-5 text-orange-600" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900 group-hover:text-orange-600">
              Edit Profile
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Update nursery details
            </p>
          </Link>
        </div>

        {/* Inventory Summary */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-400" />
            Inventory Summary
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-2xl font-bold text-gray-900">
                {nursery.inventoryCount}
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

        {/* Profile Section (editable) */}
        <NurseryProfile
          nursery={nursery}
          editing={editing}
          saving={saving}
          form={form}
          onFormChange={handleFormChange}
          onSave={handleSave}
        />
      </main>
    </div>
  );
}
