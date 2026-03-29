"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ListDetailInlineExpand } from "./ListDetailInlineExpand";
import { SaveCollectionButton } from "./SaveCollectionButton";

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

interface CollectionGridWithExpandProps {
  collections: Collection[];
}

export function CollectionGridWithExpand({
  collections,
}: CollectionGridWithExpandProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLElement>>(new Map());
  const isDesktop = useIsDesktop();

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
      <div
        ref={gridRef}
        className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {collections.map((collection, index) => {
          const CardWrapper = isDesktop ? "button" : Link;
          const cardProps = isDesktop
            ? { onClick: () => handleCardClick(index), type: "button" as const }
            : { href: `/lists/featured/${index}` };

          return (
            <CardWrapper
              key={index}
              {...(cardProps as any)}
              ref={(el: HTMLElement | null) => {
                if (el) cardRefs.current.set(index, el);
                else cardRefs.current.delete(index);
              }}
              data-collection-card
              className={`group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all overflow-hidden text-left ${
                selectedIndex !== null && selectedIndex !== index
                  ? "opacity-40"
                  : "opacity-100"
              } transition-opacity duration-200`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-orange-600 transition-colors">
                    {collection.name}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    <SaveCollectionButton
                      collectionName={collection.name}
                      plants={collection.plants}
                    />
                    <span className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {collection.plants.length} plants
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-600">
                    {collection.organization.name}
                  </span>
                  <span
                    className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full ${
                      collection.organization.type === "community"
                        ? "bg-green-100 text-green-700"
                        : collection.organization.type === "hoa"
                          ? "bg-blue-100 text-blue-700"
                          : collection.organization.type === "city"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {ORG_TYPE_LABELS[collection.organization.type] ||
                      collection.organization.type}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {collection.description}
                </p>

                <span className="inline-flex items-center gap-1 text-sm text-orange-500 group-hover:text-orange-600 font-medium">
                  {isDesktop ? "View Plants" : "View Collection"} →
                </span>
              </div>
            </CardWrapper>
          );
        })}

        {/* Desktop: inline expand beside selected card */}
        {isDesktop && selectedIndex !== null && (
          <ListDetailInlineExpand
            selectedIndex={selectedIndex}
            collection={selectedCollection}
            gridRef={gridRef}
            cardRefs={cardRefs}
            onClose={handleClose}
          />
        )}
      </div>

      {/* Mobile: tap navigates via Link — no slide-out needed */}
    </>
  );
}
