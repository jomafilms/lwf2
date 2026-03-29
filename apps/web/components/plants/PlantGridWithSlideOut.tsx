'use client';

import { useState } from 'react';
import type { Plant, ResolvedValue } from '@lwf/types';
import { PlantCard } from './PlantCard';
import { PlantSlideOut } from './PlantSlideOut';

interface PlantGridWithSlideOutProps {
  plants: Plant[];
  valuesMap: Record<string, ResolvedValue[]>;
}

export function PlantGridWithSlideOut({ plants, valuesMap }: PlantGridWithSlideOutProps) {
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  function handlePlantClick(plantId: string) {
    setSelectedPlantId(plantId);
  }

  function handleCloseSlideOut() {
    setSelectedPlantId(null);
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {plants.map((plant) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            values={valuesMap[plant.id] || []}
            onPlantClick={handlePlantClick}
          />
        ))}
      </div>

      <PlantSlideOut
        plantId={selectedPlantId}
        onClose={handleCloseSlideOut}
      />
    </>
  );
}
