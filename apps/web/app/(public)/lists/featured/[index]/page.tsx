"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Star, BookmarkPlus, Building2 } from "lucide-react";
import { createTag, assignTag } from "@/lib/tags/api";
import { getPlant } from "@/lib/api/lwf";
import { toast } from "@/components/ui/Toast";
import type { Plant } from "@lwf/types";

interface FeaturedList {
  name: string;
  organization: {
    type: string;
    name: string;
  };
  description: string;
  plants: Array<{
    plantId: string;
    commonName: string;
    botanicalName: string;
    reason: string;
  }>;
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

export default function FeaturedListPage() {
  const params = useParams();
  const index = parseInt(params.index as string);

  const [featuredList, setFeaturedList] = useState<FeaturedList | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      // Load featured lists
      const res = await fetch("/api/lists/featured");
      if (!res.ok) throw new Error("Failed to load featured lists");
      
      const lists: FeaturedList[] = await res.json();
      
      if (index < 0 || index >= lists.length) {
        setError("Featured list not found");
        return;
      }

      const list = lists[index];
      setFeaturedList(list);

      // Use seed data directly for names/reasons (already in the list)
      // Fetch full plant data in background for images/details
      const plantResults = await Promise.all(
        list.plants.map(async (item) => {
          try {
            const res = await fetch(
              `https://lwf-api.vercel.app/api/v1/plants/${item.plantId}`
            );
            if (!res.ok) {
              // Return a minimal plant from seed data
              return {
                id: item.plantId,
                commonName: item.commonName,
                genus: item.botanicalName?.split(" ")[0] || "",
                species: item.botanicalName?.split(" ").slice(1).join(" ") || "",
                subspeciesVarieties: null,
                urls: null,
                notes: null,
                lastUpdated: null,
                primaryImage: null,
              } as Plant;
            }
            const data = await res.json();
            return data.data as Plant;
          } catch {
            // Fallback to seed data
            return {
              id: item.plantId,
              commonName: item.commonName,
              genus: item.botanicalName?.split(" ")[0] || "",
              species: item.botanicalName?.split(" ").slice(1).join(" ") || "",
              subspeciesVarieties: null,
              urls: null,
              notes: null,
              lastUpdated: null,
              primaryImage: null,
            } as Plant;
          }
        })
      );

      setPlants(plantResults);
    } catch {
      setError("Failed to load featured list");
    } finally {
      setLoading(false);
    }
  }, [index]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSaveList() {
    if (!featuredList || saving) return;
    setSaving(true);
    
    try {
      // Create a new tag for the user
      const newTag = await createTag({
        name: featuredList.name,
        color: undefined, // Let user customize later
      });

      // Add all plants to the new list
      await Promise.all(
        plants.map((plant) =>
          assignTag(newTag.id, "plant", plant.id)
        )
      );

      toast("List saved to your library!");
    } catch {
      toast("Sign in to save this list");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading featured list...</div>
      </div>
    );
  }

  if (error || !featuredList) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{error || "Featured list not found"}</p>
      </div>
    );
  }

  const orgTypeLabel = ORG_TYPE_LABELS[featuredList.organization.type] || featuredList.organization.type;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-yellow-600 font-medium">Featured Collection</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {featuredList.name}
            </h1>
            <p className="text-gray-600 max-w-3xl mb-4">
              {featuredList.description}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {featuredList.organization.name} • {orgTypeLabel}
                </span>
              </div>
              <span className="text-gray-500">
                {plants.length} plant{plants.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <button
            onClick={handleSaveList}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <BookmarkPlus className="w-4 h-4" />
            {saving ? "Saving..." : "Save to Library"}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mb-6">
          <Link
            href="/lists"
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            ← Back to Browse Lists
          </Link>
        </nav>

        {/* Plant grid */}
        {plants.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No plants found in this collection</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {plants.map((plant, plantIndex) => {
              const listItem = featuredList.plants[plantIndex];
              
              return (
                <Link
                  key={plant.id}
                  href={`/plants/${plant.id}`}
                  className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    {plant.primaryImage ? (
                      <img
                        src={plant.primaryImage.url}
                        alt={plant.commonName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                        <svg
                          className="w-12 h-12 text-green-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {plant.commonName}
                    </h3>
                    <p className="text-sm text-gray-500 italic mt-0.5">
                      {[plant.genus, plant.species].filter(Boolean).join(" ")}
                    </p>
                    {listItem?.reason && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                        {listItem.reason}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}