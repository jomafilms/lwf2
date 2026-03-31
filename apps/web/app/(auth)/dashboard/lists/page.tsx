"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  List,
  Trash2,
  Pencil,
  Globe,
  Lock,
  Building2,
  Star,
  ExternalLink,
} from "lucide-react";
import {
  fetchTags,
  createTag,
  deleteTag,
  updateTag,
  fetchTagAssignments,
  type Tag,
} from "@/lib/tags/api";
import { CHART_COLORS } from "@/lib/design-tokens";
import { toast } from "@/components/ui/Toast";

const LIST_COLORS = CHART_COLORS.palette;

const VISIBILITY_ICONS = {
  private: Lock,
  public: Globe,
  org: Building2,
};

const VISIBILITY_LABELS = {
  private: "Private",
  public: "Public",
  org: "Organization",
};

interface TagWithCount extends Tag {
  itemCount: number;
}

export default function ListsPage() {
  const [tagsWithCounts, setTagsWithCounts] = useState<TagWithCount[]>([]);
  const [starredLists, setStarredLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string | null>(null);
  const [newVisibility, setNewVisibility] = useState("private");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const loadTags = useCallback(async () => {
    try {
      const [userTags, starred] = await Promise.all([
        fetchTags(),
        fetch("/api/tags/starred").then(res => res.ok ? res.json() : [])
      ]);

      // Fetch counts in parallel
      const withCounts = await Promise.all(
        userTags.map(async (tag) => {
          try {
            const assignments = await fetchTagAssignments(tag.id);
            return { ...tag, itemCount: assignments.length };
          } catch {
            return { ...tag, itemCount: 0 };
          }
        })
      );
      setTagsWithCounts(withCounts);
      setStarredLists(starred);
    } catch {
      toast("Failed to load lists");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      await createTag({
        name: newName.trim(),
        color: newColor || undefined,
        visibility: newVisibility,
      });
      setNewName("");
      setNewColor(null);
      setNewVisibility("private");
      setShowCreate(false);
      toast("List created!");
      loadTags();
    } catch {
      toast("Failed to create list");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this list? Plants won't be deleted.")) return;
    try {
      await deleteTag(id);
      toast("List deleted");
      loadTags();
    } catch {
      toast("Failed to delete list");
    }
  }

  async function handleRename(id: string) {
    if (!editName.trim()) return;
    try {
      await updateTag(id, { name: editName.trim() });
      setEditingId(null);
      toast("List renamed");
      loadTags();
    } catch {
      toast("Failed to rename list");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading lists…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Lists</h1>
            <p className="text-sm text-gray-500 mt-1">
              Organize plants into named lists
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New List
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="List name…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
            </div>
            {/* Options */}
            <div className="mt-3 space-y-3">
              {/* Color picker */}
              <div className="flex gap-2">
                <span className="text-xs text-gray-500 self-center">Color:</span>
                {LIST_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setNewColor(newColor === color ? null : color)
                    }
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      newColor === color
                        ? "border-gray-900 scale-110"
                        : "border-transparent hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              {/* Visibility selector */}
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-500">Visibility:</span>
                <select
                  value={newVisibility}
                  onChange={(e) => setNewVisibility(e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="private">Private (only me)</option>
                  <option value="public">Public (everyone can see & save)</option>
                  <option value="org">Organization (my org members only)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Starred Lists */}
        {starredLists.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900">Starred Lists</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {starredLists.slice(0, 6).map((item) => (
                <Link
                  key={item.assignment.id}
                  href={`/lists/${item.tag.id}`}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4"
                >
                  <div className="flex items-start gap-3">
                    {item.tag.color && (
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: item.tag.color }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 hover:text-orange-600 transition-colors truncate">
                        {item.tag.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <ExternalLink className="w-3 h-3" />
                        <span>Public list</span>
                      </div>
                    </div>
                    <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0 mt-0.5" />
                  </div>
                </Link>
              ))}
            </div>
            {starredLists.length > 6 && (
              <div className="mt-4">
                <Link
                  href="/lists?tab=starred"
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  View all starred lists →
                </Link>
              </div>
            )}
          </section>
        )}

        {/* My Lists */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Lists</h2>
          {tagsWithCounts.length === 0 ? (
          <div className="text-center py-16">
            <List className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No lists yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Create a list to start organizing your plants
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tagsWithCounts.map((tag) => {
              const VisIcon = VISIBILITY_ICONS[tag.visibility];
              const isEditing = editingId === tag.id;

              return (
                <div
                  key={tag.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    {/* Color dot */}
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: tag.color || CHART_COLORS.muted,
                      }}
                    />

                    {/* Name / edit */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(tag.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleRename(tag.id)}
                            className="px-2 py-1 bg-orange-500 text-white rounded text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 text-gray-500 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <Link
                          href={`/dashboard/lists/${tag.id}`}
                          className="block"
                        >
                          <span className="font-medium text-gray-900 hover:text-orange-600 transition-colors">
                            {tag.name}
                          </span>
                        </Link>
                      )}
                    </div>

                    {/* Count */}
                    <span className="text-sm text-gray-400">
                      {tag.itemCount} plant{tag.itemCount !== 1 ? "s" : ""}
                    </span>

                    {/* Visibility badge */}
                    <span
                      className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"
                      title={VISIBILITY_LABELS[tag.visibility]}
                    >
                      <VisIcon className="w-3 h-3" />
                      {VISIBILITY_LABELS[tag.visibility]}
                    </span>

                    {/* Actions */}
                    <button
                      onClick={() => {
                        setEditingId(tag.id);
                        setEditName(tag.name);
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Rename"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </section>
      </div>
    </div>
  );
}
