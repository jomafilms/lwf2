/**
 * Building Zone Summary - Statistics about computed fire-reluctant zones
 * 
 * Adapted from Fireshire project (MIT License) by Robert Head
 * https://github.com/robert-fireshire/fireshire
 */

"use client";

import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";
import { area } from "@turf/area";
import { featureCollection } from "@turf/helpers";

interface BuildingZoneSummaryProps {
  buildings?: FeatureCollection<Polygon | MultiPolygon>;
  zones?: FeatureCollection<Polygon | MultiPolygon>;
  className?: string;
}

function formatArea(areaMeters: number): string {
  const acres = areaMeters * 0.000247105; // Convert sq meters to acres
  if (acres < 0.01) {
    return "<0.01 acres";
  }
  return `${acres.toFixed(2)} acres`;
}

export function BuildingZoneSummary({ buildings, zones, className = "" }: BuildingZoneSummaryProps) {
  if (!buildings || !zones || buildings.features.length === 0) {
    return null;
  }

  // Calculate total building area
  const totalBuildingArea = buildings.features.reduce((sum, feature) => {
    try {
      return sum + area(feature);
    } catch {
      return sum;
    }
  }, 0);

  // Group zones by type and calculate areas
  const zoneStats = zones.features.reduce((stats, feature) => {
    const zoneType = feature.properties?.zone;
    if (!zoneType) return stats;

    if (!stats[zoneType]) {
      stats[zoneType] = { count: 0, area: 0, distance: feature.properties?.distance || "Unknown" };
    }

    stats[zoneType].count++;
    try {
      stats[zoneType].area += area(feature);
    } catch {
      // Skip invalid geometries
    }
    
    return stats;
  }, {} as Record<string, { count: number; area: number; distance: string }>);

  const buildingCount = buildings.features.length;

  return (
    <div className={`rounded-lg bg-white/95 p-3 shadow-lg backdrop-blur-sm ${className}`}>
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Zone Summary</h3>
        <p className="text-xs text-gray-600">
          {buildingCount} building{buildingCount !== 1 ? "s" : ""} • {formatArea(totalBuildingArea)} footprint
        </p>
      </div>

      <div className="space-y-1">
        {Object.entries(zoneStats)
          .sort((a, b) => a[0].localeCompare(b[0])) // Sort by zone id
          .map(([zoneId, stats]) => (
            <div key={zoneId} className="flex items-center justify-between text-xs">
              <span className="text-gray-700">
                Zone {zoneId.replace('zone', '')} ({stats.distance})
              </span>
              <span className="font-medium text-gray-900">
                {formatArea(stats.area)}
              </span>
            </div>
          ))}
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200">
        <p className="text-[10px] text-gray-500 leading-tight">
          Fire-reluctant zones from building footprints.
          Distances measured from structure edges.
        </p>
      </div>
    </div>
  );
}