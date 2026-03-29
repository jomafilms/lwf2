"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import { parseCSV, type ParsedInventoryItem } from "@/lib/nursery/csv-parser";
import { InventoryTable } from "@/components/nursery/InventoryTable";
import { InventoryFilters } from "@/components/nursery/InventoryFilters";
import { CSVUploadForm } from "@/components/nursery/CSVUploadForm";
import { ManualAddForm } from "@/components/nursery/ManualAddForm";

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

export default function InventoryUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nurseryId = searchParams.get("id");
  const { data: session, isPending: authPending } = useSession();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // CSV upload state
  const [csvParsed, setCsvParsed] = useState<ParsedInventoryItem[] | null>(null);
  const [csvErrors, setCsvErrors] = useState<Array<{ row: number; message: string }>>([]);
  const [matchResults, setMatchResults] = useState<Record<string, { plantId: string; matchedName: string } | null> | null>(null);
  const [matching, setMatching] = useState(false);
  const [importing, setImporting] = useState(false);

  // Manual add state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    botanicalName: "",
    commonName: "",
    price: "",
    containerSize: "",
    availability: "in_stock" as AvailabilityStatus,
  });

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAvailability, setBulkAvailability] = useState<AvailabilityStatus>("in_stock");
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const fetchInventory = useCallback(async () => {
    if (!nurseryId) return;
    try {
      const res = await fetch(`/api/nurseries/${nurseryId}/inventory`);
      if (!res.ok) throw new Error("Failed to fetch");
      const { data } = await res.json();
      setInventory(data);
    } catch {
      setError("Could not load inventory");
    } finally {
      setLoading(false);
    }
  }, [nurseryId]);

  useEffect(() => {
    if (!authPending && !session?.user) {
      router.push("/sign-in");
      return;
    }
    fetchInventory();
  }, [authPending, session, router, fetchInventory]);

  // CSV file handling
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setCsvParsed(null);
    setMatchResults(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseCSV(text);
      if (result.errors.length > 0 && result.items.length === 0) {
        setError(result.errors.map((e) => `Row ${e.row}: ${e.message}`).join("; "));
        return;
      }
      setCsvParsed(result.items);
      setCsvErrors(result.errors);
    };
    reader.readAsText(file);
  }

  // Match botanical names to LWF plants
  async function handleMatch() {
    if (!csvParsed) return;
    setMatching(true);
    try {
      const names = csvParsed.map((item) => item.botanicalName);
      const res = await fetch("/api/nurseries/match-plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botanicalNames: names }),
      });
      if (!res.ok) throw new Error("Match failed");
      const data = await res.json();
      setMatchResults(data.matches);
    } catch {
      setError("Failed to match plants against fire database");
    } finally {
      setMatching(false);
    }
  }

  // Import CSV items
  async function handleImport() {
    if (!csvParsed || !nurseryId) return;
    setImporting(true);
    try {
      const items = csvParsed.map((item) => ({
        ...item,
        lwfPlantId: matchResults?.[item.botanicalName]?.plantId || null,
      }));
      const res = await fetch(`/api/nurseries/${nurseryId}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error("Import failed");
      const { count } = await res.json();
      setCsvParsed(null);
      setMatchResults(null);
      setCsvErrors([]);
      fetchInventory();
      setError("");
      alert(`Successfully imported ${count} items`);
    } catch {
      setError("Failed to import inventory");
    } finally {
      setImporting(false);
    }
  }

  // Manual add
  async function handleManualAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!nurseryId || !addForm.botanicalName.trim()) return;

    try {
      const priceNum = addForm.price ? Math.round(parseFloat(addForm.price) * 100) : null;
      const res = await fetch(`/api/nurseries/${nurseryId}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              botanicalName: addForm.botanicalName.trim(),
              commonName: addForm.commonName.trim() || null,
              price: priceNum,
              containerSize: addForm.containerSize.trim() || null,
              availability: addForm.availability,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error("Add failed");
      setAddForm({ botanicalName: "", commonName: "", price: "", containerSize: "", availability: "in_stock" });
      setShowAddForm(false);
      fetchInventory();
    } catch {
      setError("Failed to add item");
    }
  }

  function handleFormChange(field: keyof typeof addForm, value: string) {
    setAddForm(prev => ({ ...prev, [field]: value }));
  }

  // Delete item
  async function handleDelete(itemId: string) {
    if (!nurseryId) return;
    try {
      await fetch(`/api/nurseries/${nurseryId}/inventory/${itemId}`, {
        method: "DELETE",
      });
      fetchInventory();
    } catch {
      setError("Failed to delete item");
    }
  }

  // Bulk update availability
  async function handleBulkUpdate() {
    if (!nurseryId || selectedIds.size === 0) return;
    setBulkUpdating(true);
    try {
      const res = await fetch(`/api/nurseries/${nurseryId}/inventory/bulk-update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemIds: Array.from(selectedIds),
          availability: bulkAvailability,
        }),
      });
      if (!res.ok) throw new Error("Bulk update failed");
      setSelectedIds(new Set());
      fetchInventory();
    } catch {
      setError("Failed to update availability");
    } finally {
      setBulkUpdating(false);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === inventory.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(inventory.map((i) => i.id)));
    }
  }



  if (loading || authPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <Link
            href={`/dashboard/nursery?id=${nurseryId}`}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Nursery Dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <h1 className="text-xl font-bold text-gray-900">Manage Inventory</h1>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* CSV Upload Section */}
        <CSVUploadForm
          csvParsed={csvParsed}
          csvErrors={csvErrors}
          matchResults={matchResults}
          matching={matching}
          importing={importing}
          onFileSelect={handleFileSelect}
          onMatch={handleMatch}
          onImport={handleImport}
        />

        {/* Current Inventory */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Current Inventory ({inventory.length} items)
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
            >
              {showAddForm ? (
                <>
                  <X className="h-4 w-4" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Add Item
                </>
              )}
            </button>
          </div>

          {/* Manual Add Form */}
          {showAddForm && (
            <ManualAddForm
              addForm={addForm}
              onFormChange={handleFormChange}
              onSubmit={handleManualAdd}
            />
          )}

          {/* Bulk Actions */}
          <InventoryFilters
            selectedIds={selectedIds}
            bulkAvailability={bulkAvailability}
            bulkUpdating={bulkUpdating}
            onBulkAvailabilityChange={setBulkAvailability}
            onBulkUpdate={handleBulkUpdate}
          />

          {/* Inventory Table */}
          <InventoryTable
            inventory={inventory}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onDelete={handleDelete}
          />
        </div>
      </main>
    </div>
  );
}
