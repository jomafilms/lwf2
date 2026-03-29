"use client";

import { useState, useEffect, useRef } from "react";
import { ListPlus, Check, Plus } from "lucide-react";
import {
  fetchTags,
  createTag,
  assignTag,
  unassignTag,
  fetchTagAssignments,
  type Tag,
} from "@/lib/tags/api";
import { toast } from "@/components/ui/Toast";

interface AddToListButtonProps {
  plantId: string;
}

interface TagWithStatus extends Tag {
  hasPlant: boolean;
}

export function AddToListButton({ plantId }: AddToListButtonProps) {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<TagWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  async function loadTags() {
    setLoading(true);
    try {
      const userTags = await fetchTags();

      // Check which tags contain this plant
      const withStatus = await Promise.all(
        userTags.map(async (tag) => {
          try {
            const assignments = await fetchTagAssignments(tag.id);
            const hasPlant = assignments.some(
              (a) => a.targetId === plantId && a.targetType === "plant"
            );
            return { ...tag, hasPlant };
          } catch {
            return { ...tag, hasPlant: false };
          }
        })
      );

      setTags(withStatus);
    } catch {
      // User probably not logged in — silently fail
    } finally {
      setLoading(false);
    }
  }

  function handleToggle() {
    if (!open) {
      loadTags();
    }
    setOpen(!open);
  }

  async function handleToggleTag(tag: TagWithStatus) {
    try {
      if (tag.hasPlant) {
        await unassignTag(tag.id, plantId);
        setTags((prev) =>
          prev.map((t) =>
            t.id === tag.id ? { ...t, hasPlant: false } : t
          )
        );
        toast(`Removed from "${tag.name}"`);
      } else {
        await assignTag(tag.id, "plant", plantId);
        setTags((prev) =>
          prev.map((t) =>
            t.id === tag.id ? { ...t, hasPlant: true } : t
          )
        );
        toast(`Added to "${tag.name}"`);
      }
    } catch {
      toast("Failed to update list");
    }
  }

  async function handleQuickCreate() {
    if (!newName.trim() || creating) return;
    setCreating(true);
    try {
      const tag = await createTag({ name: newName.trim() });
      await assignTag(tag.id, "plant", plantId);
      setTags((prev) => [{ ...tag, hasPlant: true }, ...prev]);
      setNewName("");
      toast(`Created "${tag.name}" and added plant`);
    } catch {
      toast("Sign in to create lists");
    } finally {
      setCreating(false);
    }
  }

  const assignedCount = tags.filter((t) => t.hasPlant).length;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={handleToggle}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full shadow-sm transition-colors ${
          assignedCount > 0
            ? "bg-blue-500 text-white"
            : "bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-blue-600"
        }`}
        title="Add to list"
      >
        <ListPlus className="w-3.5 h-3.5" />
        {assignedCount > 0 && <span>{assignedCount}</span>}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg border border-gray-200 shadow-lg z-50 overflow-hidden">
          {/* Quick create */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="New list name…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuickCreate()}
                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                autoFocus
              />
              <button
                onClick={handleQuickCreate}
                disabled={!newName.trim() || creating}
                className="p-1 text-orange-500 hover:text-orange-600 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tag list */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-xs text-gray-400">
                Loading…
              </div>
            ) : tags.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-400">
                No lists yet — create one above
              </div>
            ) : (
              tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleToggleTag(tag)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color || "#9ca3af" }}
                  />
                  <span className="flex-1 truncate text-gray-700">
                    {tag.name}
                  </span>
                  {tag.hasPlant && (
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
