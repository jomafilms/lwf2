"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { createTag, assignTag } from "@/lib/tags/api";
import { toast } from "@/components/ui/Toast";

interface CollectionPlant {
  plantId: string;
  commonName: string;
  botanicalName: string;
  reason: string;
}

interface SaveCollectionButtonProps {
  collectionName: string;
  plants: CollectionPlant[];
  className?: string;
}

export function SaveCollectionButton({
  collectionName,
  plants,
  className = "",
}: SaveCollectionButtonProps) {
  const [isStarred, setIsStarred] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleStar(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (loading || isStarred) return;

    setLoading(true);
    try {
      // Create a system tag for this featured collection (no owner = not in My Lists)
      const newTag = await createTag({
        name: collectionName,
        visibility: "public",
      });

      // Copy the plants into the tag
      await Promise.all(
        plants.map((p) => assignTag(newTag.id, "plant", p.plantId))
      );

      // Star it so it appears in Starred Lists
      await fetch(`/api/tags/${newTag.id}/star`, { method: "POST" });

      // Remove ownership so it doesn't appear in My Lists
      await fetch(`/api/tags/${newTag.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeOwner: true }),
      });

      setIsStarred(true);
      toast(`"${collectionName}" starred!`);
    } catch {
      toast("Sign in to star collections");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleStar}
      disabled={loading || isStarred}
      className={`inline-flex items-center justify-center p-1.5 rounded-full shadow-sm transition-colors disabled:opacity-50 ${
        isStarred
          ? "bg-yellow-400 text-white"
          : "bg-white/90 text-gray-600 hover:bg-white hover:text-yellow-500"
      } ${className}`}
      title={isStarred ? "Starred" : "Star this collection"}
    >
      <Star className={`w-4 h-4 ${isStarred ? "fill-current" : ""}`} />
    </button>
  );
}
