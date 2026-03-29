"use client";

import { ZONE_COLORS } from "@/lib/geo/fire-zones";

interface ZoneOverlayProps {
  hasZones: boolean;
  isDrawing: boolean;
}

export function ZoneOverlay({ hasZones, isDrawing }: ZoneOverlayProps) {
  if (!hasZones || isDrawing) return null;

  return (
    <div className="absolute bottom-6 left-4 rounded-lg bg-black/70 px-3 py-2.5 text-white shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ background: ZONE_COLORS.zone0, opacity: 0.8 }}
          />
          0-5ft
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ background: ZONE_COLORS.zone1, opacity: 0.8 }}
          />
          5-30ft
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ background: ZONE_COLORS.zone2, opacity: 0.8 }}
          />
          30-100ft
        </div>
      </div>
    </div>
  );
}