"use client";

import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import {
  fetchTags,
  createTag,
  assignTag,
  unassignTag,
  fetchTagAssignments,
  type Tag,
} from "@/lib/tags/api";
import { toast } from "@/components/ui/Toast";

const SAVED_LIST_NAME = "Saved";

interface SavePlantButtonProps {
  plantId: string;
  size?: "sm" | "md";
  className?: string;
}

export function SavePlantButton({
  plantId,
  size = "md",
  className = "",
}: SavePlantButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedTag, setSavedTag] = useState<Tag | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSavedStatus() {
      try {
        const userTags = await fetchTags();
        const tag = userTags.find((t) => t.name === SAVED_LIST_NAME);
        if (!tag || cancelled) return;

        setSavedTag(tag);
        const assignments = await fetchTagAssignments(tag.id);
        if (cancelled) return;

        const found = assignments.some(
          (a) => a.targetId === plantId && a.targetType === "plant"
        );
        setIsSaved(found);
      } catch {
        // Not logged in — silently fail
      }
    }

    checkSavedStatus();
    return () => {
      cancelled = true;
    };
  }, [plantId]);

  const handleToggle = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      if (loading) return;

      setLoading(true);
      try {
        let tag = savedTag;

        // Create "Saved" list if it doesn't exist
        if (!tag) {
          const userTags = await fetchTags();
          tag = userTags.find((t) => t.name === SAVED_LIST_NAME) || null;
          if (!tag) {
            tag = await createTag({ name: SAVED_LIST_NAME });
          }
          setSavedTag(tag);
        }

        if (isSaved) {
          await unassignTag(tag.id, plantId);
          setIsSaved(false);
          toast("Removed from saved");
        } else {
          await assignTag(tag.id, "plant", plantId);
          setIsSaved(true);
          toast("Saved!");
        }
      } catch {
        toast("Sign in to save plants");
      } finally {
        setLoading(false);
      }
    },
    [loading, savedTag, isSaved, plantId]
  );

  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
  const padding = size === "sm" ? "p-1" : "px-2 py-1";

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center justify-center rounded-full shadow-sm transition-colors disabled:opacity-50 ${padding} ${
        isSaved
          ? "bg-yellow-400 text-white hover:bg-yellow-500"
          : "bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-yellow-500"
      } ${className}`}
      title={isSaved ? "Remove from saved" : "Save plant"}
    >
      <Star className={`${iconSize} ${isSaved ? "fill-current" : ""}`} />
    </button>
  );
}
