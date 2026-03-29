'use client';

import { useState } from 'react';
import type { Plant } from '@lwf/types';
import { useCompare } from '@/lib/compare/store';
import { toast } from '@/components/ui/Toast';

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
  const [isHovering, setIsHovering] = useState(false);
  
  const inCompare = isInCompare(plant.id);
  const canAdd = !isFull || inCompare;

  function handleToggle() {
    if (inCompare) {
      removeFromCompare(plant.id);
      toast('Removed from comparison');
    } else {
      const success = addToCompare({
        id: plant.id,
        commonName: plant.commonName,
        botanicalName: getBotanicalName(plant),
        imageUrl: plant.primaryImage?.url || null,
      });
      
      if (success) {
        toast('Added to comparison');
      } else {
        toast('Maximum 3 plants can be compared');
      }
    }
  }

  if (variant === 'checkbox') {
    return (
      <label
        className={`relative inline-flex items-center cursor-pointer ${
          !canAdd && !inCompare ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={
          inCompare 
            ? 'Remove from comparison' 
            : !canAdd 
              ? 'Maximum 3 plants can be compared'
              : 'Add to comparison'
        }
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <input
          type="checkbox"
          checked={inCompare}
          onChange={handleToggle}
          disabled={!canAdd && !inCompare}
          className="sr-only"
        />
        <div className={`
          relative w-5 h-5 rounded border-2 transition-all duration-200
          ${inCompare 
            ? 'bg-orange-600 border-orange-600' 
            : isHovering && canAdd
              ? 'border-orange-400 bg-orange-50'
              : 'border-gray-300 bg-white'
          }
          ${!canAdd && !inCompare ? 'border-gray-200' : 'shadow-sm'}
        `}>
          {inCompare && (
            <svg
              className="absolute inset-0.5 w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        <span className="ml-2 text-sm font-medium text-gray-700">
          Compare
        </span>
      </label>
    );
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
      {inCompare ? (
        <>
          <svg
            className="inline w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          In Compare
        </>
      ) : (
        <>
          <svg
            className="inline w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Compare
        </>
      )}
    </button>
  );
}