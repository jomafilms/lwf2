"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Globe, BookmarkPlus } from "lucide-react";
import { fetchTagItems, createTag, assignTag, type Tag } from "@/lib/tags/api";
import { getPlantClient as getPlant } from "@/lib/api/lwf";
import { toast } from "@/components/ui/Toast";
import { NurseryMatchCard } from "@/components/lists/NurseryMatchCard";
import { FireReadinessCard } from "@/components/lists/FireReadinessCard";
import { StarButton } from "@/components/lists/StarButton";
import { PlantSlideOut } from "@/components/plants/PlantSlideOut";
import type { Plant } from "@lwf/types";

export default function PublicListPage() {
  const params = useParams();
  const tagId = params.id as string;

  const [tag, setTag] = useState<Tag | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const { tag: t, items } = await fetchTagItems(tagId);

      if (t.visibility !== "public") {
        setError("This list is private");
        return;
      }

      setTag(t);

      const plantItems = items.filter((i) => i.targetType === "plant");
      const plantResults = await Promise.all(
        plantItems.map(async (item) => {
          try {
            return await getPlant(item.targetId);
          } catch {
            return null;
          }
        })
      );
      setPlants(plantResults.filter((p): p is Plant => p !== null));
    } catch {
      setError("List not found");
    } finally {
      setLoading(false);
    }
  }, [tagId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSaveList() {
    if (!tag || saving) return;
    setSaving(true);
    try {
      // Fork the list using the API
      const res = await fetch(`/api/tags/${tag.id}/fork`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Please sign in to save lists");
        }
        throw new Error("Failed to save list");
      }

      const result = await res.json();
      toast(`List saved to your library! (${result.copiedItems} plants copied)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save list";
      toast(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading list…</div>
      </div>
    );
  }

  if (error || !tag) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{error || "List not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            {tag.color && (
              <div
                className="w-5 h-5 rounded-full flex-shrink-0"
                style={{ backgroundColor: tag.color }}
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {tag.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <Globe className="w-3 h-3" />
                  Shared List
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {plants.length} plant{plants.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StarButton tagId={tagId} />
            <button
              onClick={handleSaveList}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              <BookmarkPlus className="w-4 h-4" />
              {saving ? "Saving…" : "Save This List"}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {plants.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <NurseryMatchCard plantIds={plants.map(p => p.id)} />
            <FireReadinessCard plantCount={plants.length} />
          </div>
        )}

        {/* Plant grid */}
        {plants.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">This list is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {plants.map((plant) => (
              <button
                key={plant.id}
                onClick={() => setSelectedPlantId(plant.id)}
                className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden text-left"
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
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <PlantSlideOut
        plantId={selectedPlantId}
        onClose={() => setSelectedPlantId(null)}
      />
    </div>
  );
}
