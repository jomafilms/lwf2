'use client';

import type { Plant } from '@lwf/types';
import { useCompare } from '@/lib/compare/store';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getBotanicalName(plant: Plant): string {
  const parts = [plant.genus, plant.species].filter(Boolean);
  return parts.join(' ');
}

// ─── Component ───────────────────────────────────────────────────────────────

interface CompareButtonProps {
  plant: Plant;
  /** Button variant */
  variant?: 'checkbox' | 'button';
  /** Size for button variant */
  size?: 'sm' | 'md';
}

export function CompareButton({ plant, variant = 'checkbox', size = 'sm' }: CompareButtonProps) {
  const { addToCompare, removeFromCompare, isInCompare, isFull } = useCompare();
  
  const inCompare = isInCompare(plant.id);
  const canAdd = !isFull || inCompare;

  function handleToggle() {
    if (inCompare) {
      removeFromCompare(plant.id);
    } else {
      addToCompare({
        id: plant.id,
        commonName: plant.commonName,
        botanicalName: getBotanicalName(plant),
        imageUrl: plant.primaryImage?.url || null,
      });
    }
  }

  // Button variant
  const buttonSizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <button
      onClick={handleToggle}
      disabled={!canAdd && !inCompare}
      className={`
        ${buttonSizeClasses[size]} font-medium rounded-full shadow-sm transition-colors
        ${inCompare
          ? 'bg-orange-600 text-white hover:bg-orange-700'
          : canAdd
            ? 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-orange-600'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }
      `}
      title={
        inCompare 
          ? 'Remove from comparison' 
          : !canAdd 
            ? 'Maximum 3 plants can be compared'
            : 'Add to comparison'
      }
    >
      {inCompare ? 'In Compare' : 'Compare'}
    </button>
  );
}