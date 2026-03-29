"use client";

import { Leaf, Droplets, Shield, Bug, ExternalLink } from "lucide-react";
import { SavePlantButton } from "@/components/plants/SavePlantButton";
import { AddToListButton } from "@/components/plants/AddToListButton";
import { PlanToggleButton } from "@/components/plants/PlanToggleButton";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatPlantData {
  id: string;
  commonName: string;
  genus: string;
  species: string;
  imageUrl: string | null;
  characterScore: number | null;
  placement: { code: string; meaning: string } | null;
  zones: string[];
  waterNeeds: string | null;
  isNative: boolean;
  isDeerResistant: boolean;
  isPollinatorFriendly: boolean;
  note?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SCORE_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  high: "bg-red-100 text-red-800 border-red-200",
};

const ZONE_COLORS: Record<string, string> = {
  "0-5": "bg-red-100 text-red-800",
  "5-10": "bg-orange-100 text-orange-800",
  "10-30": "bg-amber-100 text-amber-800",
  "30-100": "bg-green-100 text-green-800",
  "50-100": "bg-emerald-100 text-emerald-800",
};

function scoreCategory(score: number): string {
  if (score <= 3) return "low";
  if (score <= 6) return "medium";
  return "high";
}

function scoreLabel(score: number): string {
  if (score <= 3) return "Low Risk";
  if (score <= 6) return "Moderate";
  return "Higher Risk";
}

// ─── Card Component ──────────────────────────────────────────────────────────

interface ChatPlantCardProps {
  plant: ChatPlantData;
}

export function ChatPlantCard({ plant }: ChatPlantCardProps) {
  const botanical = `${plant.genus} ${plant.species}`.trim();
  const cat = plant.characterScore != null ? scoreCategory(plant.characterScore) : null;

  return (
    <a
      href={`/plants/${plant.id}`}
      className="group flex gap-3 rounded-lg border border-neutral-200 bg-white p-3 hover:border-neutral-300 hover:shadow-sm transition-all"
    >
      {/* Thumbnail */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-neutral-100">
        {plant.imageUrl ? (
          <img
            src={plant.imageUrl}
            alt={plant.commonName}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Leaf className="h-6 w-6 text-neutral-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Name row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900 leading-tight group-hover:text-orange-600 transition-colors">
              {plant.commonName}
            </p>
            <p className="text-[11px] italic text-neutral-400 truncate">
              {botanical}
            </p>
          </div>
          {/* Fire character score badge */}
          {plant.characterScore != null && cat && (
            <span
              className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${SCORE_COLORS[cat]}`}
              title={`Fire character score: ${plant.characterScore}`}
            >
              🔥 {plant.characterScore} — {scoreLabel(plant.characterScore)}
            </span>
          )}
        </div>

        {/* Zone badges */}
        {plant.zones.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {plant.zones.map((zone) => (
              <span
                key={zone}
                className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                  ZONE_COLORS[zone] || "bg-neutral-100 text-neutral-600"
                }`}
              >
                {zone} ft
              </span>
            ))}
            {plant.placement && (
              <span
                className="inline-flex items-center rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600"
                title={plant.placement.meaning}
              >
                📍 {plant.placement.code}
              </span>
            )}
          </div>
        )}

        {/* Attribute pills */}
        <div className="mt-1.5 flex flex-wrap gap-1">
          {plant.waterNeeds && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700">
              <Droplets className="h-2.5 w-2.5" /> {plant.waterNeeds}
            </span>
          )}
          {plant.isNative && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700">
              <Leaf className="h-2.5 w-2.5" /> Native
            </span>
          )}
          {plant.isDeerResistant && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700">
              <Shield className="h-2.5 w-2.5" /> Deer Resistant
            </span>
          )}
          {plant.isPollinatorFriendly && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-purple-50 px-1.5 py-0.5 text-[10px] text-purple-700">
              <Bug className="h-2.5 w-2.5" /> Pollinator
            </span>
          )}
        </div>

        {/* Note from agent */}
        {plant.note && (
          <p className="mt-1.5 text-[11px] text-neutral-500 leading-snug line-clamp-2">
            {plant.note}
          </p>
        )}

        {/* Action buttons */}
        <div className="mt-1.5 flex items-center gap-1.5" onClick={(e) => e.preventDefault()}>
          <SavePlantButton plantId={plant.id} size="sm" />
          <AddToListButton plantId={plant.id} />
          <PlanToggleButton
            plantId={plant.id}
            commonName={plant.commonName}
            botanicalName={botanical}
            imageUrl={plant.imageUrl}
            variant="pill"
          />
        </div>

        {/* View details link */}
        <span className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-neutral-400 group-hover:text-orange-500 transition-colors">
          View details <ExternalLink className="h-2.5 w-2.5" />
        </span>
      </div>
    </a>
  );
}

// ─── Row Container ───────────────────────────────────────────────────────────

interface ChatPlantCardRowProps {
  plants: ChatPlantData[];
}

export function ChatPlantCardRow({ plants }: ChatPlantCardRowProps) {
  if (plants.length === 0) return null;

  return (
    <div className="ml-0 flex flex-col gap-2 max-w-[440px]">
      {plants.map((plant) => (
        <ChatPlantCard key={plant.id} plant={plant} />
      ))}
    </div>
  );
}
