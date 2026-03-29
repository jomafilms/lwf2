"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { X, Leaf } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getPlantClient } from "@/lib/api/lwf";
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

interface FetchedPlant {
  plant: Plant;
  imageUrl: string | null;
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

function getPlantImageUrl(plant: Plant): string | null {
  return (
    plant.primaryImage?.url ||
    (plant as unknown as { images?: { url: string }[] })?.images?.[0]?.url ||
    null
  );
}

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
  const [plantData, setPlantData] = useState<Map<string, FetchedPlant>>(new Map());
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
        const data = new Map<string, FetchedPlant>();
        results.forEach((result, i) => {
          if (result.status === "fulfilled" && result.value) {
            const raw = result.value as unknown as Plant;
            data.set(plantIds[i], {
              plant: raw,
              imageUrl: getPlantImageUrl(raw),
            });
          }
        });
        setPlantData(data);
        setLoading(false);
      }
    );
  }, [collection]);

  // Find hero image — prefer static imageUrl from collection data, fall back to fetched
  const heroImageUrl = (() => {
    if (!collection) return null;
    for (const cp of collection.plants.slice(0, 8)) {
      if (cp.imageUrl) return cp.imageUrl;
    }
    for (const cp of collection.plants.slice(0, 8)) {
      const fetched = plantData.get(cp.plantId);
      if (fetched?.imageUrl) return fetched.imageUrl;
    }
    return null;
  })();

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
    const GAP = 12;

    // Cap panel width: use remaining grid space but never exceed card width
    const spaceRight = gridRect.right - cardRect.right - GAP;
    const spaceLeft = cardRect.left - gridRect.left - GAP;
    const maxPanelWidth = Math.min(cardRect.width, 380);
    const cardTop = cardRect.top - gridRect.top + gridRef.current.scrollTop;
    const cardLeft = cardRect.left - gridRect.left;

    if (spaceRight >= maxPanelWidth) {
      const panelWidth = Math.min(spaceRight, maxPanelWidth);
      setDirection("right");
      setPanelStyle({
        position: "absolute",
        left: `${cardLeft + cardRect.width + GAP}px`,
        top: `${cardTop}px`,
        width: `${panelWidth}px`,
        zIndex: 20,
      });
      setFrameStyle({
        position: "absolute",
        left: `${cardLeft - 2}px`,
        top: `${cardTop - 2}px`,
        width: `${cardRect.width + GAP + panelWidth + 4}px`,
        zIndex: 19,
        pointerEvents: "none" as const,
      });
    } else if (spaceLeft >= maxPanelWidth) {
      const panelWidth = Math.min(spaceLeft, maxPanelWidth);
      setDirection("left");
      setPanelStyle({
        position: "absolute",
        left: `${cardLeft - panelWidth - GAP}px`,
        top: `${cardTop}px`,
        width: `${panelWidth}px`,
        zIndex: 20,
      });
      setFrameStyle({
        position: "absolute",
        left: `${cardLeft - panelWidth - GAP - 2}px`,
        top: `${cardTop - 2}px`,
        width: `${panelWidth + GAP + cardRect.width + 4}px`,
        zIndex: 19,
        pointerEvents: "none" as const,
      });
    } else {
      // Not enough space either side — place below the card row
      const panelWidth = Math.min(gridRect.width, 420);
      setDirection("right");
      setPanelStyle({
        position: "absolute",
        left: `${cardLeft}px`,
        top: `${cardTop + cardRect.height + GAP}px`,
        width: `${panelWidth}px`,
        zIndex: 20,
      });
      setFrameStyle({
        position: "absolute",
        left: `${cardLeft - 2}px`,
        top: `${cardTop - 2}px`,
        width: `${cardRect.width + 4}px`,
        zIndex: 19,
        pointerEvents: "none" as const,
      });
    }

    requestAnimationFrame(() => setVisible(true));
  }, [selectedIndex, gridRef, cardRefs]);

  // Sync frame height with panel after render
  useEffect(() => {
    if (!visible || selectedIndex === null) return;
    const syncHeight = () => {
      const panel = panelRef.current;
      const card = cardRefs.current?.get(selectedIndex);
      if (!panel || !card) return;
      const panelH = panel.offsetHeight;
      const cardH = card.offsetHeight;
      const h = Math.max(panelH, cardH);
      setFrameStyle((prev) => ({ ...prev, height: `${h + 4}px` }));
    };
    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    if (panelRef.current) observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, [visible, selectedIndex, cardRefs, plantData]);

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
        <div className="flex flex-col relative">
          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-2 right-2 z-10 rounded-full bg-white/80 p-1.5 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Hero image */}
          <div className="relative h-36 w-full bg-gray-100 overflow-hidden">
            {heroImageUrl ? (
              <img
                src={heroImageUrl}
                alt={collection.name}
                className="h-full w-full object-cover"
              />
            ) : loading ? (
              <div className="h-full w-full animate-pulse bg-gray-200" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Leaf className="h-8 w-8 text-gray-300" />
              </div>
            )}
            {/* Gradient overlay for header text */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-2 left-3 right-8">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/90 text-orange-700">
                  {ORG_TYPE_LABELS[collection.organization.type] || collection.organization.type}
                </span>
                <span className="text-[10px] text-white/80">
                  {collection.plants.length} plants
                </span>
              </div>
              <h3 className="font-bold text-white text-sm leading-tight drop-shadow-sm">
                {collection.name}
              </h3>
            </div>
          </div>

          {/* Horizontal plant scroll */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {loading && plantData.size === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-none w-28 rounded-lg border border-gray-100 overflow-hidden"
                    >
                      <div className="h-20 bg-gray-100 animate-pulse" />
                      <div className="p-1.5 space-y-1">
                        <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                        <div className="h-2 w-12 bg-gray-100 rounded animate-pulse" />
                      </div>
                    </div>
                  ))
                : collection.plants.slice(0, 8).map((cp) => {
                    const fetched = plantData.get(cp.plantId);
                    const imgUrl = cp.imageUrl || fetched?.imageUrl;
                    return (
                      <Link
                        key={cp.plantId}
                        href={`/plants/${cp.plantId}`}
                        className="flex-none w-28 rounded-lg border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all overflow-hidden group/thumb"
                      >
                        <div className="relative h-20 w-full bg-gray-50">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={cp.commonName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Leaf className="h-5 w-5 text-gray-200" />
                            </div>
                          )}
                        </div>
                        <div className="px-1.5 py-1.5">
                          <p className="text-[11px] font-medium text-gray-900 leading-tight line-clamp-1 group-hover/thumb:text-orange-600 transition-colors">
                            {cp.commonName}
                          </p>
                          <p className="text-[9px] text-gray-400 italic leading-tight line-clamp-1">
                            {cp.botanicalName}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
            </div>
            {collection.plants.length > 8 && (
              <p className="text-[10px] text-gray-400 pl-0.5 mt-0.5">
                +{collection.plants.length - 8} more plants
              </p>
            )}
          </div>

          {/* Sticky "View Full Collection" button */}
          <div className="sticky bottom-0 px-3 pb-3 pt-1 bg-gradient-to-t from-white via-white to-white/0">
            <Link
              href={`/lists/featured/${selectedIndex}`}
              className="block w-full text-center text-xs text-white bg-orange-500 hover:bg-orange-600 font-medium py-2 rounded-lg transition-colors"
            >
              View Full Collection →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
