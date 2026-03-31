"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Leaf, X } from "lucide-react";
import { SlideOutPanel } from "@/components/ui/SlideOutPanel";
import { SaveCollectionButton } from "./SaveCollectionButton";
import { StarButton } from "./StarButton";
import { SavePlantButton } from "@/components/plants/SavePlantButton";
import { AddToListButton } from "@/components/plants/AddToListButton";

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

const ORG_TYPE_COLORS: Record<string, string> = {
  nursery: "bg-emerald-100 text-emerald-700",
  community: "bg-green-100 text-green-700",
  hoa: "bg-blue-100 text-blue-700",
  city: "bg-purple-100 text-purple-700",
};

function getCollectionThumb(plants: CollectionPlant[]): string | null {
  for (const p of plants) {
    if (p.imageUrl) return p.imageUrl;
  }
  return null;
}

interface CollectionGridWithExpandProps {
  collections: Collection[];
}

export function CollectionGridWithExpand({
  collections,
}: CollectionGridWithExpandProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleCardClick = useCallback((index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const selectedCollection =
    selectedIndex !== null ? collections[selectedIndex] : null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((collection, index) => {
          const thumbUrl = getCollectionThumb(collection.plants);
          const orgColor = ORG_TYPE_COLORS[collection.organization.type] || "bg-gray-100 text-gray-700";

          return (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              className={`group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all overflow-hidden text-left ${
                selectedIndex !== null && selectedIndex !== index
                  ? "opacity-40"
                  : "opacity-100"
              } transition-opacity duration-200`}
            >
              <div className="flex">
                {/* Thumbnail */}
                <div className="flex-none w-20 min-h-[7rem] bg-gray-100">
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Leaf className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-orange-600 transition-colors line-clamp-2">
                      {collection.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500 truncate">
                      {collection.organization.name}
                    </span>
                    <span className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${orgColor}`}>
                      {ORG_TYPE_LABELS[collection.organization.type] ||
                        collection.organization.type}
                    </span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {collection.plants.length} plants
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2">
                    {collection.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Slide-in panel for selected collection */}
      <SlideOutPanel open={selectedIndex !== null} onClose={handleClose}>
        {selectedCollection && (
          <div className="p-6 space-y-6">
            {/* Hero image */}
            {(() => {
              const heroUrl = getCollectionThumb(selectedCollection.plants);
              return heroUrl ? (
                <div className="aspect-[16/9] rounded-lg overflow-hidden bg-gray-100">
                  <img src={heroUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ) : null;
            })()}

            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedCollection.name}
                </h2>
                <SaveCollectionButton
                  collectionName={selectedCollection.name}
                  plants={selectedCollection.plants}
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500">
                  {selectedCollection.organization.name}
                </span>
                <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full ${
                  ORG_TYPE_COLORS[selectedCollection.organization.type] || "bg-gray-100 text-gray-700"
                }`}>
                  {ORG_TYPE_LABELS[selectedCollection.organization.type] ||
                    selectedCollection.organization.type}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                {selectedCollection.description}
              </p>
            </div>

            {/* Plant count */}
            <div className="text-sm text-gray-500">
              {selectedCollection.plants.length} plants in this list
            </div>

            {/* Plant grid */}
            <div className="grid grid-cols-3 gap-3">
              {selectedCollection.plants.map((plant) => (
                <div key={plant.plantId} className="group/plant relative">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                    {plant.imageUrl ? (
                      <img
                        src={plant.imageUrl}
                        alt={plant.commonName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf className="h-5 w-5 text-gray-300" />
                      </div>
                    )}
                    {/* Action buttons on hover */}
                    <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover/plant:opacity-100 transition-opacity">
                      <SavePlantButton plantId={plant.plantId} size="sm" />
                      <AddToListButton plantId={plant.plantId} />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-900 mt-1 line-clamp-1">
                    {plant.commonName}
                  </p>
                  <p className="text-[10px] text-gray-400 italic line-clamp-1">
                    {plant.botanicalName}
                  </p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-200">
              <Link
                href={`/lists/featured/${selectedIndex}`}
                className="block w-full px-4 py-2.5 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors text-center"
              >
                View Full List
              </Link>
            </div>
          </div>
        )}
      </SlideOutPanel>
    </>
  );
}
