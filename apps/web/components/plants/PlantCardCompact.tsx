"use client";

import { Droplets, Shield, Leaf } from "lucide-react";

export interface CompactPlant {
  id: string;
  commonName?: string | null;
  genus: string;
  species: string;
  images?: { imageUrl: string }[];
}

interface PlantCardCompactProps {
  plant: CompactPlant;
}

export function PlantCardCompact({ plant }: PlantCardCompactProps) {
  const name = plant.commonName || `${plant.genus} ${plant.species}`;
  const botanical =
    plant.commonName ? `${plant.genus} ${plant.species}` : null;
  const imageUrl = plant.images?.[0]?.imageUrl;

  return (
    <a
      href={`/plants/${plant.id}`}
      className="group flex w-40 flex-shrink-0 flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm"
    >
      {/* Image */}
      <div className="relative h-24 w-full bg-neutral-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Leaf className="h-6 w-6 text-neutral-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col px-2.5 py-2">
        <p className="text-xs font-medium leading-tight text-neutral-800 line-clamp-2">
          {name}
        </p>
        {botanical && (
          <p className="mt-0.5 text-[10px] italic text-neutral-400 line-clamp-1">
            {botanical}
          </p>
        )}
      </div>
    </a>
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
