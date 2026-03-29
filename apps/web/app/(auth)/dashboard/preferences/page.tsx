"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Settings,
  Trash2,
  Plus,
  Save,
  AlertCircle,
  Droplets,
  Shield,
  Leaf,
  Ruler,
  Palette,
  StickyNote,
} from "lucide-react";

interface Preferences {
  [key: string]: unknown;
}

const PREFERENCE_META: Record<
  string,
  { label: string; icon: React.ElementType; description: string; example: string }
> = {
  waterNeeds: {
    label: "Water Needs",
    icon: Droplets,
    description: "Preferred water usage level",
    example: '"low", "moderate", "any"',
  },
  deerResistant: {
    label: "Deer Resistant",
    icon: Shield,
    description: "Only show deer-resistant plants",
    example: "true or false",
  },
  nativeOnly: {
    label: "Native Only",
    icon: Leaf,
    description: "Only recommend Oregon native plants",
    example: "true or false",
  },
  maxHeight: {
    label: "Max Height (ft)",
    icon: Ruler,
    description: "Maximum plant height preference",
    example: "6",
  },
  aestheticPrefs: {
    label: "Aesthetic Preferences",
    icon: Palette,
    description: "Color, style, or visual preferences",
    example: '["no pink flowers", "prefer evergreen"]',
  },
  maintenance: {
    label: "Maintenance",
    icon: Settings,
    description: "Maintenance level preference",
    example: '"low debris", "low maintenance"',
  },
  notes: {
    label: "Notes",
    icon: StickyNote,
    description: "Other gardening context",
    example: '"north side is very shady"',
  },
};

function formatValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function parseInputValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  const num = Number(trimmed);
  if (!isNaN(num) && trimmed !== "") return num;
  // Try JSON array
  if (trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // fall through
    }
  }
  return trimmed;
}

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<Preferences>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  async function fetchPreferences() {
    try {
      const res = await fetch("/api/preferences");
      const data = await res.json();
      setPreferences(data.preferences || {});
    } catch {
      setError("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  }

  async function savePreference(key: string, value: unknown) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: { [key]: value } }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      const data = await res.json();
      setPreferences(data.preferences);
      setEditKey(null);
      setEditValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preference");
    } finally {
      setSaving(false);
    }
  }

  async function deletePreference(key: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/preferences?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      const data = await res.json();
      setPreferences(data.preferences);
    } catch {
      setError("Failed to delete preference");
    } finally {
      setSaving(false);
    }
  }

  async function clearAll() {
    if (!confirm("Clear all learned preferences? The AI will start fresh.")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/preferences", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear");
      setPreferences({});
    } catch {
      setError("Failed to clear preferences");
    } finally {
      setSaving(false);
    }
  }

  function handleAddPreference() {
    if (!newKey.trim()) return;
    const parsed = parseInputValue(newValue);
    savePreference(newKey.trim(), parsed);
    setNewKey("");
    setNewValue("");
    setShowAddForm(false);
  }

  const prefKeys = Object.keys(preferences);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="border-b bg-white">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Dashboard
            </Link>
          </div>
        </nav>
        <main className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">
          Loading preferences...
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Settings className="h-5 w-5 text-orange-500" />
              Learned Preferences
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              These preferences are learned by the AI as you chat. They shape
              future plant recommendations.
            </p>
          </div>
          {prefKeys.length > 0 && (
            <button
              onClick={clearAll}
              disabled={saving}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Clear All
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Preference list */}
        {prefKeys.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed bg-white p-10 text-center">
            <Settings className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-600">
              No preferences learned yet
            </p>
            <p className="mt-1.5 text-xs text-gray-400 max-w-md mx-auto">
              Start chatting with the AI advisor and mention things like &ldquo;I have
              deer&rdquo;, &ldquo;only low-water plants&rdquo;, or &ldquo;no plants taller
              than 6 feet&rdquo;. The AI will remember these for future
              conversations.
            </p>

            {/* Example preferences */}
            <div className="mt-6 text-left">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Example preferences the AI can learn:
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(PREFERENCE_META).map(([key, meta]) => {
                  const Icon = meta.icon;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-2 rounded-lg border bg-gray-50 px-3 py-2 text-xs text-gray-500"
                    >
                      <Icon className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                      <span className="font-medium text-gray-700">{meta.label}:</span>
                      <span className="italic">{meta.example}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {prefKeys.map((key) => {
              const meta = PREFERENCE_META[key];
              const Icon = meta?.icon || StickyNote;
              const label = meta?.label || key;
              const isEditing = editKey === key;

              return (
                <div
                  key={key}
                  className="rounded-lg border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <Icon className="mt-0.5 h-4 w-4 text-orange-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {label}
                        </p>
                        {meta?.description && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {meta.description}
                          </p>
                        )}
                        {isEditing ? (
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 rounded-md border px-2.5 py-1.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  savePreference(key, parseInputValue(editValue));
                                } else if (e.key === "Escape") {
                                  setEditKey(null);
                                }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() =>
                                savePreference(key, parseInputValue(editValue))
                              }
                              disabled={saving}
                              className="rounded-md bg-orange-500 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                            >
                              <Save className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <p
                            className="mt-1 text-sm text-gray-700 cursor-pointer hover:text-orange-600 transition-colors"
                            onClick={() => {
                              setEditKey(key);
                              setEditValue(
                                typeof preferences[key] === "object"
                                  ? JSON.stringify(preferences[key])
                                  : String(preferences[key])
                              );
                            }}
                            title="Click to edit"
                          >
                            {formatValue(preferences[key])}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deletePreference(key)}
                      disabled={saving}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Delete preference"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add custom preference */}
        <div className="mt-4">
          {showAddForm ? (
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-900 mb-3">
                Add a preference
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  placeholder="Key (e.g. soilType)"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="flex-1 rounded-md border px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
                <input
                  type="text"
                  placeholder='Value (e.g. "clay")'
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="flex-1 rounded-md border px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddPreference();
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddPreference}
                    disabled={saving || !newKey.trim()}
                    className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewKey("");
                      setNewValue("");
                    }}
                    className="rounded-md border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add a preference manually
            </button>
          )}
        </div>

        {/* Info box */}
        <div className="mt-8 rounded-lg border bg-orange-50 border-orange-200 p-4">
          <p className="text-sm font-medium text-orange-800">
            How it works
          </p>
          <p className="mt-1 text-xs text-orange-700 leading-relaxed">
            As you chat with the AI landscaping advisor, it picks up on your
            constraints and preferences — like deer problems, water restrictions,
            height limits, or aesthetic tastes. These are saved here and
            automatically applied to future recommendations, even in new
            conversations.
          </p>
        </div>
      </main>
    </div>
  );
}
