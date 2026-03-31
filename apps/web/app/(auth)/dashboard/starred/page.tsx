"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Star, StarOff, Copy, ExternalLink } from "lucide-react";
import { forkTag } from "@/lib/tags/api";
import { toast } from "@/components/ui/Toast";

interface StarredItem {
  assignment: { id: string };
  tag: {
    id: string;
    name: string;
    color: string | null;
    visibility: string;
    ownerId: string;
    createdAt: string;
  };
}

export default function StarredListsPage() {
  const [starredLists, setStarredLists] = useState<StarredItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStarred = useCallback(async () => {
    try {
      const res = await fetch("/api/tags/starred");
      if (res.ok) {
        setStarredLists(await res.json());
      }
    } catch {
      toast("Failed to load starred lists");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStarred();
  }, [loadStarred]);

  async function handleUnstar(tagId: string) {
    try {
      await fetch(`/api/tags/${tagId}/star`, { method: "POST" });
      toast("Star removed");
      loadStarred();
    } catch {
      toast("Failed to remove star");
    }
  }

  async function handleCopy(tagId: string) {
    try {
      const result = await forkTag(tagId);
      toast(`Copied to My Lists! (${result.copiedItems} plants)`);
    } catch {
      toast("Failed to copy list");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading starred lists...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <Star className="w-5 h-5 text-yellow-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Starred Lists</h1>
            <p className="text-sm text-gray-500 mt-1">
              Public lists you've bookmarked for quick access
            </p>
          </div>
        </div>

        {starredLists.length === 0 ? (
          <div className="text-center py-16">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No starred lists yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Star public lists to bookmark them here
            </p>
            <Link
              href="/lists"
              className="inline-block mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Browse public lists
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {starredLists.map((item) => (
              <div
                key={item.assignment.id}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  {/* Color dot */}
                  {item.tag.color && (
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.tag.color }}
                    />
                  )}

                  {/* Name + link */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/lists/${item.tag.id}`} className="block">
                      <span className="font-medium text-gray-900 hover:text-orange-600 transition-colors">
                        {item.tag.name}
                      </span>
                    </Link>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <ExternalLink className="w-3 h-3" />
                      <span>Public list</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleCopy(item.tag.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    title="Copy to My Lists"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={() => handleUnstar(item.tag.id)}
                    className="p-1.5 text-gray-400 hover:text-yellow-500 transition-colors"
                    title="Remove star"
                  >
                    <StarOff className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
