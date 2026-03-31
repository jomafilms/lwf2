/**
 * Building Zone Overlay - Mapbox rendering for building-based fire zones
 * 
 * Adapted from Fireshire project (MIT License) by Robert Head
 * https://github.com/robert-fireshire/fireshire
 * 
 * Renders fire-reluctant zone rings computed from building footprints onto Mapbox map.
 */

"use client";

import { useEffect } from "react";
import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";
import type mapboxgl from "mapbox-gl";
import { ZONE_COLORS } from "@/lib/design-tokens";

interface BuildingZoneStyle {
  id: string;
  color: string;
  opacity: number;
}

const BUILDING_ZONE_STYLES: BuildingZoneStyle[] = [
  { id: "zone4", color: "#48bb78", opacity: 0.25 }, // Green - 30-100ft
  { id: "zone3", color: ZONE_COLORS.zone2.hex, opacity: 0.25 }, // Yellow - 10-30ft  
  { id: "zone2", color: ZONE_COLORS.zone1.hex, opacity: 0.35 }, // Orange - 5-10ft
  { id: "zone1", color: ZONE_COLORS.zone0.hex, opacity: 0.35 }, // Red - 0-5ft
];

const LAYER_IDS = [
  ...BUILDING_ZONE_STYLES.map(z => `${z.id}-fill`),
  ...BUILDING_ZONE_STYLES.map(z => `${z.id}-line`),
  "buildings-fill",
  "buildings-outline"
];

const SOURCE_IDS = [
  ...BUILDING_ZONE_STYLES.map(z => z.id),
  "buildings"
];

interface BuildingZoneOverlayProps {
  map: mapboxgl.Map | null;
  buildings?: FeatureCollection<Polygon | MultiPolygon>;
  zones?: FeatureCollection<Polygon | MultiPolygon>;
  onZonesReady?: (ready: boolean) => void;
}

function cleanupLayers(map: mapboxgl.Map) {
  for (const id of LAYER_IDS) {
    if (map.getLayer(id)) {
      try {
        map.removeLayer(id);
      } catch (e) {
        // Layer may already be removed
      }
    }
  }
  for (const id of SOURCE_IDS) {
    if (map.getSource(id)) {
      try {
        map.removeSource(id);
      } catch (e) {
        // Source may already be removed
      }
    }
  }
}

export function BuildingZoneOverlay({ 
  map, 
  buildings, 
  zones, 
  onZonesReady 
}: BuildingZoneOverlayProps) {
  
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    try {
      // Cleanup existing layers/sources
      cleanupLayers(map);

      if (!zones || !buildings) {
        onZonesReady?.(false);
        return;
      }

      // Add building footprints
      if (!map.getSource("buildings")) {
        map.addSource("buildings", {
          type: "geojson",
          data: buildings,
        });
      }

      // Building fill (darker, subtle)
      if (!map.getLayer("buildings-fill")) {
        map.addLayer({
          id: "buildings-fill",
          type: "fill",
          source: "buildings",
          paint: {
            "fill-color": "#334155",
            "fill-opacity": 0.6,
          },
        });
      }

      // Building outline (white, crisp)
      if (!map.getLayer("buildings-outline")) {
        map.addLayer({
          id: "buildings-outline",
          type: "line",
          source: "buildings",
          paint: {
            "line-color": "#ffffff",
            "line-width": 1.5,
            "line-opacity": 0.8,
          },
        });
      }

      // Group zone features by zone type for proper rendering
      const zoneData: Record<string, FeatureCollection<Polygon | MultiPolygon>> = {
        zone4: { type: "FeatureCollection", features: [] },
        zone3: { type: "FeatureCollection", features: [] },
        zone2: { type: "FeatureCollection", features: [] },
        zone1: { type: "FeatureCollection", features: [] },
      };

      // Group features by zone property
      for (const feature of zones.features) {
        const zoneType = feature.properties?.zone;
        if (zoneType && zoneData[zoneType]) {
          zoneData[zoneType].features.push(feature);
        }
      }

      // Add zone sources and layers
      for (const style of BUILDING_ZONE_STYLES) {
        const data = zoneData[style.id];
        
        // Add source
        if (!map.getSource(style.id)) {
          map.addSource(style.id, {
            type: "geojson",
            data,
          });
        }

        // Fill layer
        if (!map.getLayer(`${style.id}-fill`)) {
          map.addLayer({
            id: `${style.id}-fill`,
            type: "fill",
            source: style.id,
            paint: {
              "fill-color": style.color,
              "fill-opacity": style.opacity,
            },
          });
        }

        // Line layer (for zone boundaries)
        if (!map.getLayer(`${style.id}-line`)) {
          map.addLayer({
            id: `${style.id}-line`,
            type: "line",
            source: style.id,
            paint: {
              "line-color": style.color,
              "line-width": 1.5,
              "line-opacity": 0.7,
            },
          });
        }
      }

      onZonesReady?.(true);

    } catch (error) {
      console.warn("Failed to add building zone layers:", error);
      onZonesReady?.(false);
    }

    // Cleanup on unmount
    return () => {
      try {
        if (map && map.getStyle()) {
          cleanupLayers(map);
        }
      } catch (e) {
        // Map may be destroyed
      }
      onZonesReady?.(false);
    };
  }, [map, buildings, zones, onZonesReady]);

  return null; // This is a data-only component
}