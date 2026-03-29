"use client";

import { useState, useMemo } from "react";
import { ScoreCard } from "./ScoreCard";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { calculateScores } from "@/lib/scoring";
import type { PlanPlant, ScoreResult } from "@/lib/scoring";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScoresPanelProps {
  plants: PlanPlant[];
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ScoresPanel({ plants, className = "" }: ScoresPanelProps) {
  const [activeCategory, setActiveCategory] =
    useState<keyof ScoreResult | null>(null);

  const scores = useMemo(() => calculateScores(plants), [plants]);

  const overallScore = useMemo(() => {
    const { fire, pollinator, water, deer } = scores;
    return Math.round(
      (fire.score + pollinator.score + water.score + deer.score) / 4,
    );
  }, [scores]);

  if (plants.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header with overall score */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-700">
          Plan Scores
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-500">Overall</span>
          <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-bold text-white tabular-nums">
            {overallScore}
          </span>
        </div>
      </div>

      {/* Score rings */}
      <ScoreCard
        scores={scores}
        activeCategory={activeCategory}
        onCategoryClick={(cat) =>
          setActiveCategory(activeCategory === cat ? null : cat)
        }
      />

      {/* Expanded breakdown */}
      {activeCategory && (
        <ScoreBreakdown
          scores={scores}
          plants={plants}
          category={activeCategory}
          onClose={() => setActiveCategory(null)}
        />
      )}
    </div>
  );
}
