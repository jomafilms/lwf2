"use client";

import { useState, useCallback } from "react";
import type { Plant, ResolvedValue } from "@lwf/types";
import { PlantCard } from "./PlantCard";
import { PlantSlideOut } from "./PlantSlideOut";

interface PlantGridWithSlideOutProps {
  plants: Plant[];
  valuesMap: Record<string, ResolvedValue[]>;
}

export function PlantGridWithSlideOut({
  plants,
  valuesMap,
}: PlantGridWithSlideOutProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handlePlantClick = useCallback(
    (plantId: string) => {
      setSelectedId((prev) => (prev === plantId ? null : plantId));
    },
    []
  );

  const handleClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {plants.map((plant) => (
          <div
            key={plant.id}
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
      </div>

      <PlantSlideOut plantId={selectedId} onClose={handleClose} />
    </>
  );
}
