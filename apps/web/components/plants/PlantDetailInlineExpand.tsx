"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { X, Droplets, TreePine, Flower2, Shield } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getPlantClient } from "@/lib/api/lwf";
import { presentPlant, type PlantPresentation } from "@/lib/plants/present";
import { SavePlantButton } from "./SavePlantButton";
import { AddToListButton } from "./AddToListButton";
import { PlanToggleButton } from "./PlanToggleButton";
import type { Plant, ResolvedValue } from "@lwf/types";

interface PlantDetailInlineExpandProps {
  selectedId: string | null;
  /** Pre-loaded plant object from the grid (avoids re-fetch) */
  selectedPlant?: Plant | null;
  /** Pre-loaded values from the grid */
  selectedValues?: ResolvedValue[];
  gridRef: React.RefObject<HTMLElement | null>;
  cardRefs: React.RefObject<Map<string, HTMLElement>>;
  onClose: () => void;
}

export function PlantDetailInlineExpand({
  selectedId,
  selectedPlant,
  selectedValues,
  gridRef,
  cardRefs,
  onClose,
}: PlantDetailInlineExpandProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const [frameStyle, setFrameStyle] = useState<React.CSSProperties>({});
  const [visible, setVisible] = useState(false);
  const [direction, setDirection] = useState<"right" | "left">("right");

  const [plant, setPlant] = useState<Plant | null>(null);
  const [presentation, setPresentation] = useState<PlantPresentation | null>(null);
  const [loading, setLoading] = useState(false);

  // Use pre-loaded data if available, otherwise fetch
  useEffect(() => {
    if (!selectedId) {
      setPlant(null);
      setPresentation(null);
      return;
    }

    if (selectedPlant) {
      setPlant(selectedPlant);
      setPresentation(presentPlant(selectedValues || []));
      setLoading(false);
      return;
    }

    setLoading(true);
    getPlantClient(selectedId)
      .then((data) => {
        setPlant(data as unknown as Plant);
        const values = (data as unknown as { values?: ResolvedValue[] }).values || [];
        setPresentation(presentPlant(values));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedId, selectedPlant, selectedValues]);

  // Position calculation
  const calculatePosition = useCallback(() => {
    if (!selectedId || !gridRef.current) {
      setPanelStyle({});
      setFrameStyle({});
      setVisible(false);
      return;
    }
    const card = cardRefs.current?.get(selectedId);
    if (!card) return;

    const gridRect = gridRef.current.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const GAP = 16;

    const panelWidth = cardRect.width * 2 + GAP;
    const spaceRight = gridRect.right - cardRect.right;
    const cardTop = cardRect.top - gridRect.top + gridRef.current.scrollTop;
    const cardLeft = cardRect.left - gridRect.left;
    const height = Math.max(cardRect.height, 320);

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
  }, [selectedId, gridRef, cardRefs]);

  useEffect(() => {
    setVisible(false);
    calculatePosition();
    window.addEventListener("resize", calculatePosition);
    return () => window.removeEventListener("resize", calculatePosition);
  }, [calculatePosition]);

  // Close on Escape
  useEffect(() => {
    if (!selectedId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, onClose]);

  // Close on click outside
  useEffect(() => {
    if (!selectedId) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (panelRef.current?.contains(target)) return;
      if (target.closest("[data-plant-card]")) return;
      onClose();
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [selectedId, onClose]);

  if (!selectedId || !panelStyle.left) return null;

  const imageUrl = plant?.primaryImage?.url ||
    (plant as unknown as { images?: { url: string }[] })?.images?.[0]?.url;

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

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-pulse text-gray-400 text-sm">Loading...</div>
            </div>
          ) : plant && presentation ? (
            <div className="p-4 space-y-3">
              {/* Name — no image needed, card already shows it */}
              <div>
                <h3 className="font-bold text-gray-900 text-base">{plant.commonName}</h3>
                <p className="text-xs text-gray-500 italic">{plant.genus} {plant.species}</p>
              </div>

              {/* Zone badges */}
              {presentation.zones.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {presentation.zones.map((z, i) => (
                    <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                      {z.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Quick attributes */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {presentation.waterNeeds && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    <Droplets className="h-3 w-3" /> {presentation.waterNeeds}
                  </span>
                )}
                {presentation.nativeStatus && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    <TreePine className="h-3 w-3" /> Native
                  </span>
                )}
                {presentation.deerResistance && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                    <Shield className="h-3 w-3" /> Deer Resistant
                  </span>
                )}
                {presentation.benefits.some(b => b.toLowerCase().includes("pollinator")) && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                    <Flower2 className="h-3 w-3" /> Pollinator
                  </span>
                )}
              </div>

              {/* Fire info */}
              {presentation.characterScore && (
                <p className="text-xs text-gray-500">
                  Fire score: {presentation.characterScore.label}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <SavePlantButton plantId={plant.id} />
                <AddToListButton plantId={plant.id} />
                <PlanToggleButton
                  plantId={plant.id}
                  commonName={plant.commonName}
                  botanicalName={`${plant.genus} ${plant.species}`}
                  imageUrl={imageUrl || null}
                  variant="pill"
                />
              </div>

              <Link
                href={`/plants/${plant.id}`}
                className="block text-center text-xs text-orange-600 hover:text-orange-700 font-medium pt-1"
              >
                View Full Details →
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
