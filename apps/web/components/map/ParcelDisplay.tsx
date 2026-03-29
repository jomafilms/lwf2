"use client";

import { Pencil } from "lucide-react";
import type { ParcelBoundary } from "./PropertyMap";

interface ParcelDisplayProps {
  parcelBoundary: ParcelBoundary | null;
  isDrawing: boolean;
  onEditBoundary?: () => void;
}

export function ParcelDisplay({ parcelBoundary, isDrawing, onEditBoundary }: ParcelDisplayProps) {
  if (!parcelBoundary || isDrawing) return null;

  return (
    <div className="absolute left-4 top-4 flex items-center gap-2">
      <div className="rounded-lg bg-emerald-600/90 px-3 py-2 text-white shadow-lg backdrop-blur-sm">
        <p className="text-xs font-semibold">✓ Property boundary found</p>
        <p className="text-[11px] opacity-90">
          {parcelBoundary.address} · {parcelBoundary.acreage} acres
        </p>
      </div>
      {onEditBoundary && (
        <button
          onClick={onEditBoundary}
          className="rounded-lg bg-white/90 px-3 py-2 text-xs font-medium shadow-lg backdrop-blur-sm hover:bg-white"
        >
          <Pencil className="mr-1 inline-block h-3 w-3" />
          Edit
        </button>
      )}
    </div>
  );
}