"use client";

import { Pencil, RotateCcw, Check, Undo2 } from "lucide-react";

interface MapControlsProps {
  isDrawing: boolean;
  hasZones: boolean;
  pointCount: number;
  parcelBoundary: boolean;
  onStartDrawing: () => void;
  onUndoPoint: () => void;
  onFinishDrawing: () => void;
}

export function MapControls({
  isDrawing,
  hasZones,
  pointCount,
  parcelBoundary,
  onStartDrawing,
  onUndoPoint,
  onFinishDrawing
}: MapControlsProps) {
  return (
    <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2">
      {!isDrawing && !hasZones && (
        <button
          onClick={onStartDrawing}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium shadow-lg hover:bg-neutral-50 active:bg-neutral-100 sm:py-2.5"
        >
          <Pencil className="h-4 w-4" />
          {parcelBoundary ? "Draw Structure Footprint" : "Draw Structure"}
        </button>
      )}

      {!isDrawing && hasZones && (
        <button
          onClick={onStartDrawing}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium shadow-lg hover:bg-neutral-50 active:bg-neutral-100 sm:py-2.5"
        >
          <RotateCcw className="h-4 w-4" />
          Redraw
        </button>
      )}

      {isDrawing && (
        <>
          <div className="rounded-lg bg-white/95 px-3 py-2 text-xs shadow-lg sm:text-sm">
            {pointCount === 0 && (
              <span className="text-neutral-600">
                Tap corners of your building
              </span>
            )}
            {pointCount === 1 && (
              <span className="text-neutral-600">Tap the next corner</span>
            )}
            {pointCount === 2 && (
              <span className="text-neutral-600">One more point min</span>
            )}
            {pointCount >= 3 && (
              <span className="font-medium text-green-700">
                {pointCount} pts — tap Done
              </span>
            )}
          </div>

          <button
            onClick={onUndoPoint}
            disabled={pointCount === 0}
            className="rounded-lg bg-white p-3 shadow-lg hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-30 sm:p-2.5"
            title="Undo last point"
          >
            <Undo2 className="h-4 w-4" />
          </button>

          <button
            onClick={onFinishDrawing}
            disabled={pointCount < 3}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-neutral-800 active:bg-neutral-700 disabled:opacity-30 sm:py-2.5"
          >
            <Check className="h-4 w-4" />
            Done
          </button>
        </>
      )}
    </div>
  );
}