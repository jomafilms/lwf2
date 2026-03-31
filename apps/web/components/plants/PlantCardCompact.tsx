"use client";

import { Leaf } from "lucide-react";
import { SavePlantButton } from "./SavePlantButton";
import { AddToListButton } from "./AddToListButton";

export interface CompactPlant {
  id: string;
  commonName?: string | null;
  genus: string;
  species: string;
  imageUrl?: string | null;
  images?: { imageUrl: string }[];
}

interface PlantCardCompactProps {
  plant: CompactPlant;
}

export function PlantCardCompact({ plant }: PlantCardCompactProps) {
  const name = plant.commonName || `${plant.genus} ${plant.species}`;
  const botanical =
    plant.commonName ? `${plant.genus} ${plant.species}` : null;
  const imgSrc = plant.imageUrl || plant.images?.[0]?.imageUrl;

  return (
    <div
      className="group relative flex w-40 flex-shrink-0 flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm"
    >
      {/* Image */}
      <a href={`/plants/${plant.id}`} className="relative h-24 w-full bg-neutral-100 block">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Leaf className="h-6 w-6 text-neutral-300" />
          </div>
        )}
      </a>
      {/* Action buttons — visible on hover */}
      <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <SavePlantButton plantId={plant.id} size="sm" />
        <AddToListButton plantId={plant.id} />
      </div>

      {/* Info */}
      <a href={`/plants/${plant.id}`} className="flex flex-1 flex-col px-2.5 py-2">
        <p className="text-xs font-medium leading-tight text-neutral-800 line-clamp-2">
          {name}
        </p>
        {botanical && (
          <p className="mt-0.5 text-[10px] italic text-neutral-400 line-clamp-1">
            {botanical}
          </p>
        )}
      </a>
    </div>
  );
}

interface PlantCardRowProps {
  plants: CompactPlant[];
}

export function PlantCardRow({ plants }: PlantCardRowProps) {
  if (plants.length === 0) return null;

  return (
    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
      {plants.map((plant) => (
        <PlantCardCompact key={plant.id} plant={plant} />
      ))}
    </div>
  );
}
