"use client";

import { useState, useRef, useCallback } from "react";
import type { Plant, ResolvedValue } from "@lwf/types";
import { PlantCard } from "./PlantCard";
import { PlantDetailInlineExpand } from "./PlantDetailInlineExpand";
import { PlantSlideOut } from "./PlantSlideOut";

interface PlantGridWithSlideOutProps {
  plants: Plant[];
  valuesMap: Record<string, ResolvedValue[]>;
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );

  if (typeof window !== "undefined") {
    const mql = window.matchMedia("(min-width: 1024px)");
    mql.addEventListener("change", (e) => setIsDesktop(e.matches));
  }

  return isDesktop;
}

export function PlantGridWithSlideOut({
  plants,
  valuesMap,
}: PlantGridWithSlideOutProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isDesktop = useIsDesktop();

  const handlePlantClick = useCallback(
    (plantId: string) => {
      // Toggle if clicking same card
      setSelectedId((prev) => (prev === plantId ? null : plantId));
    },
    []
  );

  const handleClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  return (
    <>
      <div ref={gridRef} className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {plants.map((plant) => (
          <div
            key={plant.id}
            ref={(el) => {
              if (el) cardRefs.current.set(plant.id, el);
              else cardRefs.current.delete(plant.id);
            }}
            data-plant-card
            className={`transition-opacity duration-200 ${
              selectedId && selectedId !== plant.id ? "opacity-40" : "opacity-100"
            }`}
          >
            <PlantCard
              plant={plant}
              values={valuesMap[plant.id] || []}
              onPlantClick={handlePlantClick}
              compact
            />
          </div>
        ))}

        {/* Desktop: inline expand beside selected card */}
        {isDesktop && selectedId && (
          <PlantDetailInlineExpand
            selectedId={selectedId}
            selectedPlant={plants.find(p => p.id === selectedId) || null}
            selectedValues={valuesMap[selectedId] || []}
            gridRef={gridRef}
            cardRefs={cardRefs}
            onClose={handleClose}
          />
        )}
      </div>

      {/* Mobile: slide-out panel */}
      {!isDesktop && (
        <PlantSlideOut plantId={selectedId} onClose={handleClose} />
      )}
    </>
  );
}
