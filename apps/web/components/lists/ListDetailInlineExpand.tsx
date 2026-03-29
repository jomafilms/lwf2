"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
            <div className="space-y-1.5">
              {collection.plants.slice(0, 8).map((plant) => (
                <Link
                  key={plant.plantId}
                  href={`/plants/${plant.plantId}`}
                  className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors group/plant"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 group-hover/plant:text-orange-600 transition-colors leading-tight">
                      {plant.commonName}
                    </p>
                    <p className="text-[10px] text-gray-400 italic leading-tight">
                      {plant.botanicalName}
                    </p>
                    {plant.reason && (
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                        {plant.reason}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-3 w-3 text-gray-300 mt-0.5 flex-shrink-0" />
                </Link>
              ))}
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
