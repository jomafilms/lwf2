"use client";

import { useState, useEffect, useRef } from "react";
import type { ScoreResult } from "@/lib/scoring";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScoreCardProps {
  scores: ScoreResult;
  onCategoryClick?: (category: keyof ScoreResult) => void;
  activeCategory?: keyof ScoreResult | null;
}

interface ScoreRingProps {
  score: number;
  label: string;
  emoji: string;
  isActive: boolean;
  onClick: () => void;
  delay: number;
}

// ─── Color helpers ───────────────────────────────────────────────────────────

import { getScoreColor } from "@/lib/design-tokens";

function scoreColor(score: number): string {
  return getScoreColor(score).hex;
}

function scoreBgClass(score: number): string {
  if (score > 70) return "bg-green-50 border-green-200";
  if (score >= 40) return "bg-yellow-50 border-yellow-200";
  return "bg-red-50 border-red-200";
}

// ─── Animated count-up hook ──────────────────────────────────────────────────

function useCountUp(target: number, duration = 800, delay = 0): number {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTime.current) startTime.current = timestamp;
        const elapsed = timestamp - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));

        if (progress < 1) {
          rafId.current = requestAnimationFrame(animate);
        }
      };
      rafId.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafId.current);
    };
  }, [target, duration, delay]);

  return value;
}

// ─── Ring component ──────────────────────────────────────────────────────────

const RING_SIZE = 88;
const STROKE_WIDTH = 6;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ScoreRing({
  score,
  label,
  emoji,
  isActive,
  onClick,
  delay,
}: ScoreRingProps) {
  const displayValue = useCountUp(score, 800, delay);
  const color = scoreColor(score);
  const offset = CIRCUMFERENCE - (displayValue / 100) * CIRCUMFERENCE;

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all hover:scale-105 ${
        isActive
          ? `${scoreBgClass(score)} ring-2 ring-offset-1`
          : "border-neutral-200 bg-white hover:border-neutral-300"
      }`}
      style={isActive ? { "--tw-ring-color": color } as React.CSSProperties : undefined}
      aria-label={`${label} score: ${score}`}
    >
      <div className="relative">
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Progress circle */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold tabular-nums">{displayValue}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-base" aria-hidden="true">
          {emoji}
        </span>
        <span className="text-xs font-medium text-neutral-600">{label}</span>
      </div>
    </button>
  );
}

// ─── ScoreCard ───────────────────────────────────────────────────────────────

const CATEGORIES: {
  key: keyof ScoreResult;
  label: string;
  emoji: string;
}[] = [
  { key: "fire", label: "Fire", emoji: "🔥" },
  { key: "pollinator", label: "Pollinator", emoji: "🦋" },
  { key: "water", label: "Water", emoji: "💧" },
  { key: "deer", label: "Deer", emoji: "🦌" },
];

export function ScoreCard({
  scores,
  onCategoryClick,
  activeCategory,
}: ScoreCardProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {CATEGORIES.map((cat, i) => (
        <ScoreRing
          key={cat.key}
          score={scores[cat.key].score}
          label={cat.label}
          emoji={cat.emoji}
          isActive={activeCategory === cat.key}
          onClick={() => onCategoryClick?.(cat.key)}
          delay={i * 150}
        />
      ))}
    </div>
  );
}
