"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string; color: string }[] = [
  { value: "in_stock", label: "In Stock", color: "bg-green-100 text-green-700" },
  { value: "limited", label: "Limited", color: "bg-yellow-100 text-yellow-700" },
  { value: "out_of_stock", label: "Out of Stock", color: "bg-red-100 text-red-700" },
  { value: "seasonal", label: "Seasonal", color: "bg-blue-100 text-blue-700" },
];

export default function InventoryUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nurseryId = searchParams.get("id");
  const { data: session, isPending: authPending } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  const matchedCount = matchResults
    ? Object.values(matchResults).filter(Boolean).length
    : 0;
  const totalParsed = csvParsed?.length || 0;

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
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-gray-400" />
            CSV Upload
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Upload a CSV with columns: botanical_name, common_name, price, container_size, availability
          </p>

          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-green-700 hover:file:bg-green-100"
            />
          </div>

          {/* CSV Preview */}
          {csvParsed && csvParsed.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  Parsed {csvParsed.length} items
                  {csvErrors.length > 0 && (
                    <span className="ml-2 text-yellow-600">
                      ({csvErrors.length} rows skipped)
                    </span>
                  )}
                </p>
                <div className="flex gap-2">
                  {!matchResults && (
                    <button
                      onClick={handleMatch}
                      disabled={matching}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {matching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Leaf className="h-4 w-4" />
                      )}
                      Match to Fire Database
                    </button>
                  )}
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {importing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Import {csvParsed.length} Items
                  </button>
                </div>
              </div>

              {matchResults && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {matchedCount} of {totalParsed} plants matched to fire database
                </div>
              )}

              {/* Preview table */}
              <div className="max-h-72 overflow-auto rounded border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
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
                      {matchResults && (
                        <th className="px-3 py-2 text-left font-medium text-gray-500">
                          LWF Match
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {csvParsed.slice(0, 50).map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-900 italic">
                          {item.botanicalName}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {item.commonName || "—"}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {item.price ? `$${(item.price / 100).toFixed(2)}` : "—"}
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
                              {
                                AVAILABILITY_OPTIONS.find(
                                  (o) => o.value === item.availability
                                )?.label || item.availability
                              }
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        {matchResults && (
                          <td className="px-3 py-2">
                            {matchResults[item.botanicalName] ? (
                              <span className="inline-flex items-center gap-1 text-green-600">
                                <Check className="h-3 w-3" />
                                {matchResults[item.botanicalName]!.matchedName}
                              </span>
                            ) : (
                              <span className="text-gray-400">No match</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvParsed.length > 50 && (
                  <p className="bg-gray-50 px-3 py-2 text-xs text-gray-500">
                    Showing first 50 of {csvParsed.length} items
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

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
            <form
              onSubmit={handleManualAdd}
              className="mb-4 rounded-lg bg-gray-50 p-4 space-y-3"
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <input
                  type="text"
                  value={addForm.botanicalName}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, botanicalName: e.target.value }))
                  }
                  placeholder="Botanical name *"
                  className="rounded border px-2.5 py-1.5 text-sm"
                  required
                />
                <input
                  type="text"
                  value={addForm.commonName}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, commonName: e.target.value }))
                  }
                  placeholder="Common name"
                  className="rounded border px-2.5 py-1.5 text-sm"
                />
                <input
                  type="text"
                  value={addForm.price}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="Price (e.g. 12.99)"
                  className="rounded border px-2.5 py-1.5 text-sm"
                />
                <input
                  type="text"
                  value={addForm.containerSize}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, containerSize: e.target.value }))
                  }
                  placeholder="Container size"
                  className="rounded border px-2.5 py-1.5 text-sm"
                />
                <select
                  value={addForm.availability}
                  onChange={(e) =>
                    setAddForm((f) => ({
                      ...f,
                      availability: e.target.value as AvailabilityStatus,
                    }))
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
          )}

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-blue-50 p-3">
              <span className="text-sm font-medium text-blue-700">
                {selectedIds.size} selected
              </span>
              <select
                value={bulkAvailability}
                onChange={(e) =>
                  setBulkAvailability(e.target.value as AvailabilityStatus)
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
                onClick={handleBulkUpdate}
                disabled={bulkUpdating}
                className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {bulkUpdating ? "Updating..." : "Update Availability"}
              </button>
            </div>
          )}

          {/* Inventory Table */}
          {inventory.length === 0 ? (
            <div className="py-8 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">
                No inventory items yet. Upload a CSV or add items manually.
              </p>
            </div>
          ) : (
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
                        onChange={toggleSelectAll}
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
                          onChange={() => toggleSelect(item.id)}
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
                          onClick={() => handleDelete(item.id)}
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
          )}
        </div>
      </main>
    </div>
  );
}
