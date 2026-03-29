"use client";

import { useMemo } from "react";
import type { ScoreResult, ScoreSuggestion } from "@/lib/scoring";
import { generateSuggestions } from "@/lib/scoring";
import type { PlanPlant } from "@/lib/scoring";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScoreBreakdownProps {
  scores: ScoreResult;
  plants: PlanPlant[];
  category: keyof ScoreResult;
  onClose: () => void;
}

// ─── Category metadata ───────────────────────────────────────────────────────

const CATEGORY_META: Record<
  keyof ScoreResult,
  { emoji: string; label: string; description: string }
> = {
  fire: {
    emoji: "🔥",
    label: "Fire Safety",
    description:
      "Based on plant character scores, zone placement compliance, and coverage ratio.",
  },
  pollinator: {
    emoji: "🦋",
    label: "Pollinator Support",
    description:
      "Percentage of pollinator-friendly plants plus bloom season diversity.",
  },
  water: {
    emoji: "💧",
    label: "Water Efficiency",
    description:
      "Average water needs — lower water demand scores higher.",
  },
  deer: {
    emoji: "🦌",
    label: "Deer Resistance",
    description:
      "Average deer resistance rating across all plants.",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function contributionColor(value: number): string {
  if (value > 60) return "text-green-600";
  if (value > 30) return "text-yellow-600";
  if (value > 0) return "text-orange-500";
  return "text-red-500";
}

function contributionBg(value: number): string {
  if (value > 60) return "bg-green-50";
  if (value > 30) return "bg-yellow-50";
  if (value > 0) return "bg-orange-50";
  return "bg-red-50";
}

function scoreLabel(score: number): string {
  if (score > 70) return "Good";
  if (score >= 40) return "Needs Improvement";
  return "Poor";
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ScoreBreakdown({
  scores,
  plants,
  category,
  onClose,
}: ScoreBreakdownProps) {
  const meta = CATEGORY_META[category];
  const { score, breakdown } = scores[category];

  const suggestions = useMemo(() => {
    const all = generateSuggestions(scores, plants);
    return all.filter((s) => s.category === category);
  }, [scores, plants, category]);

  // Sort breakdown: highest contribution first
  const sortedBreakdown = useMemo(
    () => [...breakdown].sort((a, b) => b.contribution - a.contribution),
    [breakdown],
  );

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.emoji}</span>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              {meta.label}
            </h3>
            <p className="text-xs text-neutral-500">{meta.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-2xl font-bold tabular-nums">{score}</span>
            <span className="text-sm text-neutral-400">/100</span>
            <p className="text-xs text-neutral-500">{scoreLabel(score)}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Close breakdown"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Plant breakdown list */}
      <div className="max-h-64 overflow-y-auto">
        {sortedBreakdown.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-neutral-400">
            No plants in your plan yet. Add plants to see their scores.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {sortedBreakdown.map((item) => (
              <li
                key={item.plantId}
                className={`flex items-center gap-3 px-4 py-2.5 ${contributionBg(item.contribution)}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-800">
                    {item.plantName}
                  </p>
                  <p className="truncate text-xs text-neutral-500">
                    {item.reason}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold tabular-nums ${contributionColor(item.contribution)}`}
                >
                  {item.contribution > 0 ? "+" : ""}
                  {item.contribution}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="border-t bg-amber-50 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
            💡 Improve this score
          </p>
          <ul className="space-y-1.5">
            {suggestions.slice(0, 3).map((s, i) => (
              <li key={i} className="text-xs text-amber-800">
                <span className="mr-1">•</span>
                {s.suggestion}
                {s.estimatedImprovement > 0 && (
                  <span className="ml-1 font-medium text-amber-600">
                    (+~{s.estimatedImprovement}pts)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
