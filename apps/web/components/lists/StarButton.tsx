/**
 * StarButton Component
 * Toggle star status for public lists
 */

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { toast } from "@/components/ui/Toast";

interface Props {
  tagId: string;
  starCount?: number;
  className?: string;
}

export function StarButton({ tagId, starCount = 0, className = "" }: Props) {
  const [isStarred, setIsStarred] = useState(false);
  const [currentCount, setCurrentCount] = useState(starCount);
  const [loading, setLoading] = useState(false);

  // Check if user has starred this list
  useEffect(() => {
    async function checkStarStatus() {
      try {
        const res = await fetch("/api/tags/starred");
        if (res.ok) {
          const starred = await res.json();
          const isAlreadyStarred = starred.some((item: any) => item.tag.id === tagId);
          setIsStarred(isAlreadyStarred);
        }
      } catch (error) {
        console.error("Failed to check star status:", error);
      }
    }

    checkStarStatus();
  }, [tagId]);

  async function handleToggleStar() {
    if (loading) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/tags/${tagId}/star`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast("Please sign in to star lists");
          return;
        }
        throw new Error("Failed to toggle star");
      }

      const result = await res.json();
      const wasStarred = isStarred;
      
      setIsStarred(result.starred);
      setCurrentCount(prev => result.starred ? prev + 1 : Math.max(0, prev - 1));
      
      toast(result.starred ? "List starred!" : "Star removed");
    } catch (error) {
      console.error("Failed to toggle star:", error);
      toast("Failed to toggle star");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggleStar}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
        isStarred
          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      } ${className}`}
    >
      <Star 
        className={`w-4 h-4 ${isStarred ? "fill-current" : ""}`}
      />
      {loading ? "..." : isStarred ? "Starred" : "Star"}
      {currentCount > 0 && (
        <span className="text-xs">
          ({currentCount})
        </span>
      )}
    </button>
  );
}