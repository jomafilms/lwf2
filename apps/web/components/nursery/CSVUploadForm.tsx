"use client";

import { useRef } from "react";
import { FileSpreadsheet, Loader2, Leaf, Upload, Check } from "lucide-react";
import { type ParsedInventoryItem } from "@/lib/nursery/csv-parser";

type AvailabilityStatus = "in_stock" | "limited" | "out_of_stock" | "seasonal";

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string; color: string }[] = [
  { value: "in_stock", label: "In Stock", color: "bg-green-100 text-green-700" },
  { value: "limited", label: "Limited", color: "bg-yellow-100 text-yellow-700" },
  { value: "out_of_stock", label: "Out of Stock", color: "bg-red-100 text-red-700" },
  { value: "seasonal", label: "Seasonal", color: "bg-blue-100 text-blue-700" },
];

interface CSVUploadFormProps {
  csvParsed: ParsedInventoryItem[] | null;
  csvErrors: Array<{ row: number; message: string }>;
  matchResults: Record<string, { plantId: string; matchedName: string } | null> | null;
  matching: boolean;
  importing: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMatch: () => void;
  onImport: () => void;
}

export function CSVUploadForm({
  csvParsed,
  csvErrors,
  matchResults,
  matching,
  importing,
  onFileSelect,
  onMatch,
  onImport
}: CSVUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const matchedCount = matchResults
    ? Object.values(matchResults).filter(Boolean).length
    : 0;
  const totalParsed = csvParsed?.length || 0;

  return (
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
          onChange={onFileSelect}
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
                  onClick={onMatch}
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
                onClick={onImport}
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
  );
}