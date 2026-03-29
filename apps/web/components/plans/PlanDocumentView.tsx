/**
 * PlanDocumentView — Server component for print-ready plan document
 *
 * Renders a professional, print-optimized landscape plan that can be
 * handed to a landscaper or submitted to an HOA.
 */

import type {
  PlanDocumentData,
  DocumentZone,
  NurserySource,
} from "@/lib/plans/build-document";
import { PrintButton } from "./PrintButton";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ZoneSection({ zone }: { zone: DocumentZone }) {
  return (
    <section className="mb-6 break-inside-avoid print:mb-4">
      <div className="mb-2 rounded-t-lg bg-neutral-800 px-4 py-2 print:bg-neutral-800">
        <h2 className="text-base font-bold text-white">{zone.label}</h2>
        <p className="text-xs text-neutral-300">{zone.description}</p>
      </div>

      {zone.plants.length === 0 ? (
        <div className="border border-t-0 rounded-b-lg px-4 py-4 text-center text-sm text-neutral-500">
          No plants selected for this zone.
        </div>
      ) : (
        <div className="border border-t-0 rounded-b-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-300 bg-neutral-50 text-xs font-medium uppercase tracking-wider text-neutral-500">
                <th className="py-1.5 pr-3 pl-4 text-left">Plant</th>
                <th className="py-1.5 px-3 text-center">Qty</th>
                <th className="py-1.5 px-3 text-center">Size</th>
                <th className="py-1.5 px-3 text-right">Unit Price</th>
                <th className="py-1.5 pl-3 pr-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="px-4">
              {zone.plants.map((plant) => (
                <tr
                  key={plant.plantId}
                  className="border-b border-neutral-200 last:border-0"
                >
                  <td className="py-2 pr-3 pl-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {plant.commonName}
                      </p>
                      {plant.botanicalName && (
                        <p className="text-xs italic text-neutral-500">
                          {plant.botanicalName}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center text-sm text-neutral-700">
                    {plant.quantity}
                  </td>
                  <td className="py-2 px-3 text-center text-sm text-neutral-700">
                    {plant.containerSize}
                  </td>
                  <td className="py-2 px-3 text-right text-sm text-neutral-700">
                    {plant.unitPrice !== null
                      ? formatCents(plant.unitPrice)
                      : "—"}
                  </td>
                  <td className="py-2 pl-3 pr-4 text-right text-sm font-medium text-neutral-900">
                    {plant.subtotal !== null
                      ? formatCents(plant.subtotal)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {zone.subtotal !== null && (
            <div className="flex justify-end border-t border-neutral-300 bg-neutral-50 px-4 py-2">
              <span className="text-sm font-semibold text-neutral-900">
                Zone Subtotal: {formatCents(zone.subtotal)}
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function NurserySourcesList({ sources }: { sources: NurserySource[] }) {
  if (sources.length === 0) return null;

  return (
    <section className="mb-6 break-inside-avoid print:mb-4">
      <h2 className="mb-2 text-base font-bold text-neutral-900">
        Nursery Sources
      </h2>
      <div className="rounded-lg border divide-y">
        {sources.map((source) => (
          <div key={source.id} className="flex items-center justify-between px-4 py-2.5">
            <div>
              <p className="text-sm font-medium text-neutral-900">
                {source.name}
              </p>
              {(source.city || source.state) && (
                <p className="text-xs text-neutral-500">
                  {[source.city, source.state].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500">
                {source.plantCount} plant{source.plantCount !== 1 ? "s" : ""}
              </p>
              {source.website && (
                <a
                  href={source.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-600 hover:underline print:text-neutral-700 print:no-underline"
                >
                  {source.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Main Document ───────────────────────────────────────────────────────────

export function PlanDocumentView({ data }: { data: PlanDocumentData }) {
  const totalPlants = data.zones.reduce(
    (sum, z) => sum + z.plants.reduce((s, p) => s + p.quantity, 0),
    0
  );

  return (
    <div className="min-h-screen bg-neutral-100 print:bg-white print:min-h-0">
      {/* Print button — hidden when printing */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white border-b px-6 py-3 print:hidden">
        <p className="text-sm text-neutral-500">Plan Document Preview</p>
        <PrintButton />
      </div>

      {/* Document body */}
      <div className="mx-auto max-w-3xl bg-white px-8 py-10 print:max-w-none print:px-0 print:py-0 print:shadow-none shadow-lg my-6 print:my-0">
        {/* Header */}
        <header className="mb-8 border-b-2 border-neutral-900 pb-4 print:mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                FIRE-SAFE LANDSCAPE PLAN
              </h1>
              <p className="mt-1 text-lg text-neutral-700">
                {data.propertyAddress}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500">
                {formatDate(data.generatedAt)}
              </p>
              <p className="text-sm font-medium text-neutral-700">
                {data.planName}
              </p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="mt-4 flex gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500">
                Zones
              </p>
              <p className="text-lg font-bold text-neutral-900">
                {data.zones.length}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500">
                Total Plants
              </p>
              <p className="text-lg font-bold text-neutral-900">
                {totalPlants}
              </p>
            </div>
            {data.estimatedTotal !== null && (
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500">
                  Est. Cost
                </p>
                <p className="text-lg font-bold text-orange-600">
                  {formatCents(data.estimatedTotal)}
                </p>
              </div>
            )}
          </div>
        </header>

        {/* Zones */}
        {data.zones.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-neutral-500">
              No plants have been added to this plan yet.
            </p>
          </div>
        ) : (
          data.zones.map((zone) => (
            <ZoneSection key={zone.zone} zone={zone} />
          ))
        )}

        {/* Estimated Total */}
        {data.estimatedTotal !== null && data.zones.length > 0 && (
          <div className="mb-6 flex justify-end rounded-lg bg-neutral-900 px-6 py-3 print:mb-4">
            <span className="text-lg font-bold text-white">
              Estimated Total: {formatCents(data.estimatedTotal)}
            </span>
          </div>
        )}

        {/* Nursery Sources */}
        <NurserySourcesList sources={data.nurserySources} />

        {/* Notes */}
        <section className="mb-8 break-inside-avoid print:mb-4">
          <h2 className="mb-2 text-base font-bold text-neutral-900">Notes</h2>
          <div className="rounded-lg border border-dashed p-4 text-sm text-neutral-500">
            <p>
              Prices are estimates based on current nursery inventory and may
              vary. Container sizes and availability subject to change. Contact
              nurseries directly for current stock and pricing.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t-2 border-neutral-900 pt-4 print:pt-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-neutral-500">
                Data: Charisse Sydoriak / LWF Database
              </p>
              <p className="text-xs text-neutral-500">
                Generated by lwf2 · lwf2.vercel.app
              </p>
            </div>
            <p className="text-xs text-neutral-400">
              Plan ID: {data.planId.slice(0, 8)}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
