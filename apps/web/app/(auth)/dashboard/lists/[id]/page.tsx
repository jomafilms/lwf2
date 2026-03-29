"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Lock,
  Share2,
  Trash2,
  ExternalLink,
  Copy,
} from "lucide-react";
import {
  fetchTagItems,
  updateTag,
  unassignTag,
  type Tag,
  type TagAssignment,
} from "@/lib/tags/api";
import { getPlant } from "@/lib/api/lwf";
import { toast } from "@/components/ui/Toast";
import { NurseryMatchCard } from "@/components/lists/NurseryMatchCard";
import { FireReadinessCard } from "@/components/lists/FireReadinessCard";
import type { Plant } from "@lwf/types";

interface PlantWithAssignment {
  plant: Plant;
  assignment: TagAssignment;
}

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tagId = params.id as string;

  const [tag, setTag] = useState<Tag | null>(null);
  const [plants, setPlants] = useState<PlantWithAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExport, setShowExport] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const { tag: t, items } = await fetchTagItems(tagId);
      setTag(t);

      // Fetch plant details for each assignment
      const plantItems = items.filter((i) => i.targetType === "plant");
      const plantResults = await Promise.all(
        plantItems.map(async (assignment) => {
          try {
            const plant = await getPlant(assignment.targetId);
            return { plant, assignment };
          } catch {
            return null;
          }
        })
      );

      setPlants(
        plantResults.filter((p): p is PlantWithAssignment => p !== null)
      );
    } catch {
      toast("Failed to load list");
    } finally {
      setLoading(false);
    }
  }, [tagId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleToggleVisibility() {
    if (!tag) return;
    const newVis = tag.visibility === "public" ? "private" : "public";
    try {
      const updated = await updateTag(tag.id, { visibility: newVis });
      setTag(updated);
      toast(newVis === "public" ? "List is now public!" : "List is now private");
    } catch {
      toast("Failed to update visibility");
    }
  }

  async function handleRemovePlant(assignment: TagAssignment) {
    try {
      await unassignTag(tag!.id, assignment.targetId);
      setPlants((prev) =>
        prev.filter((p) => p.assignment.id !== assignment.id)
      );
      toast("Plant removed from list");
    } catch {
      toast("Failed to remove plant");
    }
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/lists/${tagId}`;
    navigator.clipboard.writeText(url);
    toast("Link copied!");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading list…</div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">List not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/lists"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lists
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {tag.color && (
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {tag.name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {plants.length} plant{plants.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Share toggle */}
              <button
                onClick={handleToggleVisibility}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tag.visibility === "public"
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tag.visibility === "public" ? (
                  <>
                    <Globe className="w-4 h-4" /> Public
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Private
                  </>
                )}
              </button>

              {/* Copy link */}
              {tag.visibility === "public" && (
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
              )}

              {/* Export options */}
              <button
                onClick={() => setShowExport(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {plants.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <NurseryMatchCard plantIds={plants.map(p => p.plant.id)} />
            <FireReadinessCard plantCount={plants.length} />
          </div>
        )}

        {/* Plant grid */}
        {plants.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No plants in this list yet</p>
            <Link
              href="/plants"
              className="inline-flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 mt-2"
            >
              Browse plants <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {plants.map(({ plant, assignment }) => (
              <div
                key={assignment.id}
                className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Remove button */}
                <button
                  onClick={() => handleRemovePlant(assignment)}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from list"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link href={`/plants/${plant.id}`} className="block">
                  {/* Image */}
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

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {plant.commonName}
                    </h3>
                    <p className="text-sm text-gray-500 italic mt-0.5">
                      {[plant.genus, plant.species].filter(Boolean).join(" ")}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowExport(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Export List</h3>
            <p className="text-sm text-gray-500 mb-4">Download your plant list in your preferred format.</p>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm" onClick={() => { setShowExport(false); toast("CSV export coming soon — built on existing LWF export engine"); }}>
                📄 Export as CSV
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm" onClick={() => { setShowExport(false); toast("Excel export coming soon — built on existing LWF export engine"); }}>
                📊 Export as Excel
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm" onClick={() => { setShowExport(false); toast("PDF export coming soon — built on existing LWF report generator"); }}>
                📋 Export as PDF Report
              </button>
            </div>
            <button className="mt-4 w-full text-center text-sm text-gray-400 hover:text-gray-600" onClick={() => setShowExport(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
