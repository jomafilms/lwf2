"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  X, ChevronRight, Droplets, TreePine, Flower2, Shield,
  Flame, AlertTriangle, Sun, CloudRain,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getPlantClient } from "@/lib/api/lwf";
import { presentPlant, type PlantPresentation } from "@/lib/plants/present";
import type { Plant, ResolvedValue } from "@lwf/types";

interface CollectionPlant {
  plantId: string;
  commonName: string;
  botanicalName: string;
  reason: string;
  imageUrl?: string | null;
}

interface Collection {
  name: string;
  organization: { type: string; name: string };
  description: string;
  plants: CollectionPlant[];
}

interface PlantWithPresentation {
  plant: Plant;
  presentation: PlantPresentation;
}

interface ListDetailInlineExpandProps {
  selectedIndex: number | null;
  collection: Collection | null;
  gridRef: React.RefObject<HTMLElement | null>;
  cardRefs: React.RefObject<Map<number, HTMLElement>>;
  onClose: () => void;
}

const ORG_TYPE_LABELS: Record<string, string> = {
  hoa: "HOA",
  city: "City",
  nursery: "Nursery",
  community: "Community",
  neighborhood: "Neighborhood",
  firewise: "Fire Safe",
  landscaping_company: "Landscaper",
  other: "Other",
};

const ZONE_COLORS: Record<string, string> = {
  "0-5": "bg-red-50 text-red-700 border-red-200",
  "5-10": "bg-orange-50 text-orange-700 border-orange-200",
  "10-30": "bg-amber-50 text-amber-700 border-amber-200",
  "30-100": "bg-green-50 text-green-700 border-green-200",
  "50-100": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function ListDetailInlineExpand({
  selectedIndex,
  collection,
  gridRef,
  cardRefs,
  onClose,
}: ListDetailInlineExpandProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const [frameStyle, setFrameStyle] = useState<React.CSSProperties>({});
  const [visible, setVisible] = useState(false);
  const [direction, setDirection] = useState<"right" | "left">("right");
  const [plantData, setPlantData] = useState<Map<string, PlantWithPresentation>>(new Map());
  const [loading, setLoading] = useState(false);

  // Fetch plant data when collection changes
  useEffect(() => {
    if (!collection || collection.plants.length === 0) {
      setPlantData(new Map());
      return;
    }

    setLoading(true);
    const plantIds = collection.plants.slice(0, 8).map((p) => p.plantId);

    Promise.allSettled(plantIds.map((id) => getPlantClient(id))).then(
      (results) => {
        const data = new Map<string, PlantWithPresentation>();
        results.forEach((result, i) => {
          if (result.status === "fulfilled" && result.value) {
            const raw = result.value;
            const values = (raw as unknown as { values?: ResolvedValue[] }).values || [];
            data.set(plantIds[i], {
              plant: raw as unknown as Plant,
              presentation: presentPlant(values),
            });
          }
        });
        setPlantData(data);
        setLoading(false);
      }
    );
  }, [collection]);

  const calculatePosition = useCallback(() => {
    if (selectedIndex === null || !gridRef.current) {
      setPanelStyle({});
      setFrameStyle({});
      setVisible(false);
      return;
    }
    const card = cardRefs.current?.get(selectedIndex);
    if (!card) return;

    const gridRect = gridRef.current.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const GAP = 16;

    const panelWidth = cardRect.width * 2 + GAP;
    const spaceRight = gridRect.right - cardRect.right;
    const cardTop = cardRect.top - gridRect.top + gridRef.current.scrollTop;
    const cardLeft = cardRect.left - gridRect.left;
    const height = Math.max(cardRect.height, 360);

    if (spaceRight >= panelWidth) {
      setDirection("right");
      setPanelStyle({
        position: "absolute",
        left: `${cardLeft + cardRect.width}px`,
        top: `${cardTop}px`,
        width: `${panelWidth}px`,
        height: `${height}px`,
        zIndex: 20,
      });
      setFrameStyle({
        position: "absolute",
        left: `${cardLeft - 2}px`,
        top: `${cardTop - 2}px`,
        width: `${cardRect.width + panelWidth + 4}px`,
        height: `${height + 4}px`,
        zIndex: 19,
        pointerEvents: "none" as const,
      });
    } else {
      setDirection("left");
      setPanelStyle({
        position: "absolute",
        left: `${cardLeft - panelWidth}px`,
        top: `${cardTop}px`,
        width: `${panelWidth}px`,
        height: `${height}px`,
        zIndex: 20,
      });
      setFrameStyle({
        position: "absolute",
        left: `${cardLeft - panelWidth - 2}px`,
        top: `${cardTop - 2}px`,
        width: `${panelWidth + cardRect.width + 4}px`,
        height: `${height + 4}px`,
        zIndex: 19,
        pointerEvents: "none" as const,
      });
    }

    requestAnimationFrame(() => setVisible(true));
  }, [selectedIndex, gridRef, cardRefs]);

  useEffect(() => {
    setVisible(false);
    calculatePosition();
    window.addEventListener("resize", calculatePosition);
    return () => window.removeEventListener("resize", calculatePosition);
  }, [calculatePosition]);

  // Close on Escape
  useEffect(() => {
    if (selectedIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedIndex, onClose]);

  // Close on click outside
  useEffect(() => {
    if (selectedIndex === null) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (panelRef.current?.contains(target)) return;
      if (target.closest("[data-collection-card]")) return;
      onClose();
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [selectedIndex, onClose]);

  if (selectedIndex === null || !collection || !panelStyle.left) return null;

  return (
    <>
      {/* Ring frame */}
      <div
        style={frameStyle}
        className={cn(
          "rounded-xl ring-2 ring-orange-400 transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        style={panelStyle}
        className={cn(
          "bg-white overflow-hidden shadow-xl transition-all duration-200 ease-out",
          direction === "right" ? "rounded-r-xl" : "rounded-l-xl",
          visible
            ? "opacity-100 translate-x-0"
            : direction === "right"
              ? "opacity-0 -translate-x-4"
              : "opacity-0 translate-x-4"
        )}
      >
        <div className="h-full flex flex-col overflow-y-auto relative">
          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-2 right-2 z-10 rounded-full bg-white/80 p-1.5 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="p-4 space-y-3">
            {/* Collection header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                  {ORG_TYPE_LABELS[collection.organization.type] || collection.organization.type}
                </span>
                <span className="text-[10px] text-gray-400">
                  {collection.plants.length} plants
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm leading-tight">
                {collection.name}
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {collection.organization.name}
              </p>
            </div>

            {/* Plant list */}
            <div className="space-y-2">
              {collection.plants.slice(0, 8).map((cp) => {
                const rich = plantData.get(cp.plantId);
                return (
                  <PlantEntry
                    key={cp.plantId}
                    collectionPlant={cp}
                    rich={rich}
                    loading={loading}
                  />
                );
              })}
              {collection.plants.length > 8 && (
                <p className="text-[10px] text-gray-400 pl-1.5">
                  +{collection.plants.length - 8} more plants
                </p>
              )}
            </div>

            {/* View full collection link */}
            <Link
              href={`/lists/featured/${selectedIndex}`}
              className="block text-center text-xs text-orange-600 hover:text-orange-700 font-medium pt-1 border-t border-gray-100"
            >
              View Full Collection →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Individual plant entry card ──────────────────────────────────────────

function PlantEntry({
  collectionPlant,
  rich,
  loading,
}: {
  collectionPlant: CollectionPlant;
  rich?: PlantWithPresentation;
  loading: boolean;
}) {
  const p = rich?.presentation;

  return (
    <Link
      href={`/plants/${collectionPlant.plantId}`}
      className="block p-2 rounded-lg border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group/plant"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 group-hover/plant:text-orange-600 transition-colors leading-tight">
            {collectionPlant.commonName}
          </p>
          <p className="text-[10px] text-gray-400 italic leading-tight">
            {collectionPlant.botanicalName}
          </p>
        </div>
        <ChevronRight className="h-3 w-3 text-gray-300 mt-0.5 flex-shrink-0" />
      </div>

      {/* Attribute badges — show when data is loaded */}
      {p && (
        <div className="mt-1.5 space-y-1.5">
          {/* Zone + score row */}
          <div className="flex flex-wrap gap-1">
            {p.zones.map((z) => (
              <span
                key={z.zone}
                className={`text-[9px] font-medium px-1.5 py-0 rounded-full border ${ZONE_COLORS[z.zone] || "bg-gray-50 text-gray-600 border-gray-200"}`}
              >
                {z.zone}ft
              </span>
            ))}
            {p.characterScore && (
              <span
                className={cn(
                  "text-[9px] font-medium px-1.5 py-0 rounded-full border",
                  p.characterScore.level === "low"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : p.characterScore.level === "moderate"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-red-50 text-red-700 border-red-200"
                )}
              >
                {p.characterScore.label}
              </span>
            )}
          </div>

          {/* Quick attribute badges */}
          <div className="flex flex-wrap gap-1">
            {p.waterNeeds && (
              <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0 rounded-full bg-blue-50 text-blue-700">
                <Droplets className="h-2.5 w-2.5" /> {p.waterNeeds}
              </span>
            )}
            {p.nativeStatus && (
              <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0 rounded-full bg-emerald-50 text-emerald-700">
                <TreePine className="h-2.5 w-2.5" /> Native
              </span>
            )}
            {p.deerResistance && (
              <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0 rounded-full bg-amber-50 text-amber-700">
                <Shield className="h-2.5 w-2.5" /> Deer Res.
              </span>
            )}
            {p.benefits.some((b) => b.toLowerCase().includes("pollinator")) && (
              <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0 rounded-full bg-purple-50 text-purple-700">
                <Flower2 className="h-2.5 w-2.5" /> Pollinator
              </span>
            )}
            {p.lightNeeds && (
              <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0 rounded-full bg-yellow-50 text-yellow-700">
                <Sun className="h-2.5 w-2.5" /> {p.lightNeeds}
              </span>
            )}
            {p.droughtTolerant && (
              <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0 rounded-full bg-sky-50 text-sky-700">
                <CloudRain className="h-2.5 w-2.5" /> Drought Tol.
              </span>
            )}
            {p.plantStructure && (
              <span className="text-[9px] px-1.5 py-0 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                {p.plantStructure}
              </span>
            )}
            {p.height && (
              <span className="text-[9px] px-1.5 py-0 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                {p.height}
              </span>
            )}
          </div>

          {/* Flammability notes */}
          {p.flammabilityNotes && (
            <p className="text-[10px] text-orange-700 bg-orange-50 rounded px-1.5 py-1 leading-tight line-clamp-2 flex items-start gap-1">
              <Flame className="h-2.5 w-2.5 flex-shrink-0 mt-px" />
              <span className="truncate">{p.flammabilityNotes}</span>
            </p>
          )}

          {/* Risk mitigation notes */}
          {p.riskMitigationNotes && (
            <p className="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-1 leading-tight line-clamp-2 flex items-start gap-1">
              <AlertTriangle className="h-2.5 w-2.5 flex-shrink-0 mt-px" />
              <span className="truncate">{p.riskMitigationNotes}</span>
            </p>
          )}
        </div>
      )}

      {/* Loading shimmer for badges */}
      {loading && !p && (
        <div className="mt-1.5 flex gap-1">
          <div className="h-3 w-10 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-3 w-14 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-3 w-12 bg-gray-100 rounded-full animate-pulse" />
        </div>
      )}
    </Link>
  );
}
