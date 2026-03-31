"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Star, BookmarkPlus, Building2 } from "lucide-react";
import { createTag, assignTag } from "@/lib/tags/api";
import { getPlantClient, getPlants, getValuesBulk } from "@/lib/api/lwf";
import { toast } from "@/components/ui/Toast";
import { PlantGridWithSlideOut } from "@/components/plants/PlantGridWithSlideOut";
import { ORG_TYPE_LABELS } from "@/lib/design-tokens";
import type { Plant } from "@lwf/types";

interface FeaturedList {
  name: string;
  organization: {
    type: string;
    name: string;
  };
  description: string;
  apiAttributeId?: string;
  plants: Array<{
    plantId: string;
    commonName: string;
    botanicalName: string;
    reason: string;
  }>;
}


export default function FeaturedListPage() {
  const params = useParams();
  const index = parseInt(params.index as string);

  const [featuredList, setFeaturedList] = useState<FeaturedList | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/lists/featured");
      if (!res.ok) throw new Error("Failed to load featured lists");

      const lists: FeaturedList[] = await res.json();

      if (index < 0 || index >= lists.length) {
        setError("Featured list not found");
        return;
      }

      const list = lists[index];
      setFeaturedList(list);

      if (list.apiAttributeId) {
        // Fetch from LWF API — this is a system list backed by real data
        const bulkRes = await fetch(`/api/plants/by-attribute?attributeId=${list.apiAttributeId}`);
        if (bulkRes.ok) {
          const data = await bulkRes.json();
          setTotalCount(data.total);
          setPlants(data.plants);
        }
      } else {
        // Static seed data — fetch plant details
        const plantResults = await Promise.all(
          list.plants.map(async (item) => {
            try {
              return await getPlantClient(item.plantId) as unknown as Plant;
            } catch {
              return {
                id: item.plantId,
                commonName: item.commonName,
                genus: item.botanicalName?.split(" ")[0] || "",
                species: item.botanicalName?.split(" ").slice(1).join(" ") || "",
                subspeciesVarieties: null, urls: null, notes: null,
                lastUpdated: "", primaryImage: null,
              } as unknown as Plant;
            }
          })
        );
        setPlants(plantResults);
        setTotalCount(plantResults.length);
      }
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
                {totalCount > plants.length
                  ? `Showing ${plants.length} of ${totalCount} plants`
                  : `${plants.length} plant${plants.length !== 1 ? "s" : ""}`}
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
          <PlantGridWithSlideOut plants={plants} valuesMap={{}} />
        )}
      </div>
    </div>
  );
}