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
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (loading || isSaved) return;

    setLoading(true);
    try {
      const newTag = await createTag({ name: collectionName });

      await Promise.all(
        plants.map((p) => assignTag(newTag.id, "plant", p.plantId))
      );

      setIsSaved(true);
      toast(`"${collectionName}" saved to your lists!`);
    } catch {
      toast("Sign in to save collections");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSave}
      disabled={loading || isSaved}
      className={`inline-flex items-center justify-center p-1.5 rounded-full shadow-sm transition-colors disabled:opacity-50 ${
        isSaved
          ? "bg-yellow-400 text-white"
          : "bg-white/90 text-gray-600 hover:bg-white hover:text-yellow-500"
      } ${className}`}
      title={isSaved ? "Saved to your lists" : "Save collection to your lists"}
    >
      <Star className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
    </button>
  );
}
