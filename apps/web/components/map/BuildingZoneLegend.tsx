/**
 * Building Zone Legend - Fire-Reluctant Zone Distances
 * 
 * Adapted from Fireshire project (MIT License) by Robert Head
 * https://github.com/robert-fireshire/fireshire
 * 
 * Shows legend for building-based zone rings with fire-reluctant strategies.
 */

"use client";

import { useState } from "react";
import { ZONE_COLORS } from "@/lib/design-tokens";

interface BuildingZone {
  id: string;
  label: string;
  range: string;
  color: string;
  strategy: string;
}

const BUILDING_ZONES: BuildingZone[] = [
  {
    id: "zone1",
    label: "Zone 1",
    range: "0–5 ft",
    color: ZONE_COLORS.zone0.hex, // Red - most critical
    strategy: "Non-combustible zone",
  },
  {
    id: "zone2",
    label: "Zone 2",
    range: "5–10 ft",
    color: ZONE_COLORS.zone1.hex, // Orange
    strategy: "Ember catch zone",
  },
  {
    id: "zone3",
    label: "Zone 3", 
    range: "10–30 ft",
    color: ZONE_COLORS.zone2.hex, // Yellow
    strategy: "Lean, clean, green planting",
  },
  {
    id: "zone4",
    label: "Zone 4",
    range: "30–100 ft", 
    color: "#48bb78", // Green
    strategy: "Reduce fuel continuity",
  },
] as const;

interface BuildingZoneLegendProps {
  hasZones: boolean;
  isDrawing?: boolean;
  compact?: boolean;
}

export function BuildingZoneLegend({ hasZones, isDrawing = false, compact = false }: BuildingZoneLegendProps) {
  const [expanded, setExpanded] = useState(!compact);

  if (!hasZones || isDrawing) return null;

  if (compact && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/25 bg-black/50 text-white shadow-lg backdrop-blur-sm"
        aria-label="Show fire-reluctant zone legend"
        title="Show zone details"
      >
        ◧
      </button>
    );
  }

  return (
    <div className="min-w-[220px] rounded-lg border border-white/20 bg-black/55 p-3 shadow-lg backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <strong className="text-sm text-white">Fire-Reluctant Zones</strong>
        {compact && (
          <button
            onClick={() => setExpanded(false)}
            className="text-slate-400 hover:text-white"
            aria-label="Hide zone legend"
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {BUILDING_ZONES.map((zone) => (
          <div key={zone.id} className="flex items-center gap-2">
            <span
              className="h-3.5 w-3.5 flex-shrink-0 rounded-sm"
              style={{ backgroundColor: zone.color, opacity: 0.8 }}
            />
            <div className="text-slate-200">
              <div className="text-xs font-medium">
                {zone.label} ({zone.range})
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {zone.strategy}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-white/10">
        <p className="text-[10px] text-slate-400 leading-tight">
          Zones computed from existing building footprints.
          Based on NFPA guidelines for fire-reluctant landscaping.
        </p>
      </div>
    </div>
  );
}