'use client';

import { Droplets, TreePine, Flower2, Shield, Sun, Shrub, Leaf } from 'lucide-react';
import type { PlantPresentation } from '@/lib/plants/present';

interface PlantAttributeBadgesProps {
  presentation: PlantPresentation;
  /** "sm" for compact cards, "md" for inline expand / slide-out */
  size?: 'sm' | 'md';
}

const BADGE_BASE = 'inline-flex items-center gap-1 rounded-full font-medium';

const SIZE_CLASSES = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-[11px] px-2 py-0.5',
} as const;

/**
 * Shared attribute badges for plant cards, inline expand, and slide-out.
 * Single source of truth — add new badges here and they appear everywhere.
 */
export function PlantAttributeBadges({ presentation, size = 'md' }: PlantAttributeBadgesProps) {
  const s = SIZE_CLASSES[size];
  const iconSize = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3';

  return (
    <div className="flex flex-wrap gap-1">
      {presentation.waterNeeds && (
        <span className={`${BADGE_BASE} ${s} bg-blue-50 text-blue-700`}>
          <Droplets className={iconSize} /> {presentation.waterNeeds}
        </span>
      )}
      {presentation.nativeStatus && (
        <span className={`${BADGE_BASE} ${s} bg-emerald-50 text-emerald-700`}>
          <TreePine className={iconSize} /> Native
        </span>
      )}
      {presentation.deerResistance && (
        <span className={`${BADGE_BASE} ${s} bg-amber-50 text-amber-700`}>
          <Shield className={iconSize} /> Deer Resistant
        </span>
      )}
      {presentation.benefits.some(b => b.toLowerCase().includes('pollinator')) && (
        <span className={`${BADGE_BASE} ${s} bg-purple-50 text-purple-700`}>
          <Flower2 className={iconSize} /> Pollinator
        </span>
      )}
      {presentation.droughtTolerant && (
        <span className={`${BADGE_BASE} ${s} bg-sky-50 text-sky-700`}>
          <Droplets className={iconSize} /> Drought Tolerant
        </span>
      )}
      {presentation.lightNeeds && (
        <span className={`${BADGE_BASE} ${s} bg-yellow-50 text-yellow-700`}>
          <Sun className={iconSize} /> {presentation.lightNeeds}
        </span>
      )}
      {presentation.evergreen && (
        <span className={`${BADGE_BASE} ${s} bg-green-50 text-green-700`}>
          <Leaf className={iconSize} /> Evergreen
        </span>
      )}
      {presentation.plantStructure && (
        <span className={`${BADGE_BASE} ${s} bg-stone-50 text-stone-600`}>
          <Shrub className={iconSize} /> {presentation.plantStructure}
        </span>
      )}
    </div>
  );
}

/**
 * Compact flammability note for cards.
 * Shows character score with color coding.
 */
export function FlammabilityBadge({ presentation, size = 'md' }: PlantAttributeBadgesProps) {
  if (!presentation.characterScore) return null;

  const { level, label } = presentation.characterScore;
  const s = SIZE_CLASSES[size];

  const colorMap = {
    low: 'bg-green-50 text-green-700',
    moderate: 'bg-amber-50 text-amber-700',
    high: 'bg-red-50 text-red-700',
  };

  return (
    <span className={`${BADGE_BASE} ${s} ${colorMap[level]}`}>
      🔥 {label}
    </span>
  );
}
