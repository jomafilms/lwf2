"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { getMapboxToken } from "@/lib/geo/mapbox";
import {
  calculateFireZones,
  fireZonesToGeoJSON,
  ZONE_COLORS,
  ZONE_OPACITY,
} from "@/lib/geo/fire-zones";
import type mapboxgl from "mapbox-gl";

interface PropertyMapProps {
  center: { lat: number; lng: number };
  onStructureDrawn?: (coords: [number, number][]) => void;
}

type DrawState =
  | { mode: "idle" }
  | { mode: "drawing"; points: [number, number][] };

export function PropertyMap({ center, onStructureDrawn }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [drawState, setDrawState] = useState<DrawState>({ mode: "idle" });
  const [hasZones, setHasZones] = useState(false);
  const drawStateRef = useRef<DrawState>({ mode: "idle" });

  // Keep ref in sync
  useEffect(() => {
    drawStateRef.current = drawState;
  }, [drawState]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    let map: mapboxgl.Map;

    const initMap = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      await import("mapbox-gl/dist/mapbox-gl.css");

      mapboxgl.accessToken = getMapboxToken();

      map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/satellite-v9",
        center: [center.lng, center.lat],
        zoom: 19,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      mapRef.current = map;

      map.on("load", () => {
        // Add empty sources for drawing and zones
        map.addSource("draw-points", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addSource("draw-line", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addSource("structure", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addSource("fire-zones", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        // Draw points layer
        map.addLayer({
          id: "draw-points-layer",
          type: "circle",
          source: "draw-points",
          paint: {
            "circle-radius": 6,
            "circle-color": "#3b82f6",
            "circle-stroke-color": "#fff",
            "circle-stroke-width": 2,
          },
        });

        // Draw line layer
        map.addLayer({
          id: "draw-line-layer",
          type: "line",
          source: "draw-line",
          paint: {
            "line-color": "#3b82f6",
            "line-width": 2,
            "line-dasharray": [2, 2],
          },
        });

        // Fire zone fills — render in order: zone2 (bottom), zone1, zone0 (top)
        map.addLayer({
          id: "fire-zones-fill",
          type: "fill",
          source: "fire-zones",
          paint: {
            "fill-color": [
              "match",
              ["get", "zone"],
              "zone0", ZONE_COLORS.zone0,
              "zone1", ZONE_COLORS.zone1,
              "zone2", ZONE_COLORS.zone2,
              "#888",
            ],
            "fill-opacity": [
              "match",
              ["get", "zone"],
              "zone0", ZONE_OPACITY.zone0,
              "zone1", ZONE_OPACITY.zone1,
              "zone2", ZONE_OPACITY.zone2,
              0.2,
            ],
          },
        });

        // Fire zone outlines
        map.addLayer({
          id: "fire-zones-outline",
          type: "line",
          source: "fire-zones",
          paint: {
            "line-color": [
              "match",
              ["get", "zone"],
              "zone0", ZONE_COLORS.zone0,
              "zone1", ZONE_COLORS.zone1,
              "zone2", ZONE_COLORS.zone2,
              "#888",
            ],
            "line-width": 2,
            "line-opacity": 0.8,
          },
        });

        // Structure fill
        map.addLayer({
          id: "structure-fill",
          type: "fill",
          source: "structure",
          paint: {
            "fill-color": "#1e293b",
            "fill-opacity": 0.5,
          },
        });

        // Structure outline
        map.addLayer({
          id: "structure-outline",
          type: "line",
          source: "structure",
          paint: {
            "line-color": "#1e293b",
            "line-width": 2,
          },
        });
      });

      // Handle clicks for drawing
      map.on("click", (e) => {
        const state = drawStateRef.current;
        if (state.mode !== "drawing") return;

        const point: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        const newPoints = [...state.points, point];
        setDrawState({ mode: "drawing", points: newPoints });
        updateDrawPreview(map, newPoints);
      });
    };

    initMap();

    return () => {
      map?.remove();
      mapRef.current = null;
    };
  }, [center]);

  const updateDrawPreview = (map: mapboxgl.Map, points: [number, number][]) => {
    // Update points
    const pointsSource = map.getSource("draw-points") as mapboxgl.GeoJSONSource;
    if (pointsSource) {
      pointsSource.setData({
        type: "FeatureCollection",
        features: points.map((p) => ({
          type: "Feature" as const,
          geometry: { type: "Point" as const, coordinates: p },
          properties: {},
        })),
      });
    }

    // Update line
    if (points.length >= 2) {
      const lineSource = map.getSource("draw-line") as mapboxgl.GeoJSONSource;
      if (lineSource) {
        lineSource.setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature" as const,
              geometry: {
                type: "LineString" as const,
                coordinates: [...points, points[0]],
              },
              properties: {},
            },
          ],
        });
      }
    }
  };

  const startDrawing = useCallback(() => {
    setDrawState({ mode: "drawing", points: [] });
    setHasZones(false);
    // Clear existing zones and structure
    const map = mapRef.current;
    if (map) {
      const zoneSrc = map.getSource("fire-zones") as mapboxgl.GeoJSONSource;
      const structSrc = map.getSource("structure") as mapboxgl.GeoJSONSource;
      if (zoneSrc) zoneSrc.setData({ type: "FeatureCollection", features: [] });
      if (structSrc) structSrc.setData({ type: "FeatureCollection", features: [] });
    }
  }, []);

  const undoPoint = useCallback(() => {
    if (drawState.mode !== "drawing") return;
    const newPoints = drawState.points.slice(0, -1);
    setDrawState({ mode: "drawing", points: newPoints });
    if (mapRef.current) updateDrawPreview(mapRef.current, newPoints);
  }, [drawState]);

  const finishDrawing = useCallback(() => {
    if (drawState.mode !== "drawing" || drawState.points.length < 3) return;

    const map = mapRef.current;
    if (!map) return;

    const coords = drawState.points;

    // Close the polygon ring
    const closedCoords = [...coords, coords[0]];

    // Show structure
    const structSrc = map.getSource("structure") as mapboxgl.GeoJSONSource;
    if (structSrc) {
      structSrc.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Polygon", coordinates: [closedCoords] },
            properties: {},
          },
        ],
      });
    }

    // Calculate and show fire zones
    const zones = calculateFireZones(coords);
    const zonesGeoJSON = fireZonesToGeoJSON(zones);
    const zoneSrc = map.getSource("fire-zones") as mapboxgl.GeoJSONSource;
    if (zoneSrc) {
      zoneSrc.setData(zonesGeoJSON);
    }

    // Clear drawing preview
    const ptsSrc = map.getSource("draw-points") as mapboxgl.GeoJSONSource;
    const lineSrc = map.getSource("draw-line") as mapboxgl.GeoJSONSource;
    if (ptsSrc) ptsSrc.setData({ type: "FeatureCollection", features: [] });
    if (lineSrc) lineSrc.setData({ type: "FeatureCollection", features: [] });

    setDrawState({ mode: "idle" });
    setHasZones(true);
    onStructureDrawn?.(coords);
  }, [drawState, onStructureDrawn]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Drawing controls */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {drawState.mode === "idle" && (
          <button
            onClick={startDrawing}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-lg hover:bg-neutral-50"
          >
            {hasZones ? "Redraw Structure" : "Draw Structure"}
          </button>
        )}

        {drawState.mode === "drawing" && (
          <>
            <div className="rounded-lg bg-white/90 px-3 py-2 text-sm shadow-lg">
              Click to add points ({drawState.points.length})
            </div>
            <button
              onClick={undoPoint}
              disabled={drawState.points.length === 0}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-lg hover:bg-neutral-50 disabled:opacity-50"
            >
              Undo
            </button>
            <button
              onClick={finishDrawing}
              disabled={drawState.points.length < 3}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-neutral-800 disabled:opacity-50"
            >
              Done
            </button>
          </>
        )}
      </div>

      {/* Zone legend */}
      {hasZones && (
        <div className="absolute right-4 top-4 rounded-lg bg-white/90 p-3 shadow-lg">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Fire Zones
          </p>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-zone0 opacity-60" />
              Zone 0 (0-5ft)
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-zone1 opacity-60" />
              Zone 1 (5-30ft)
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-zone2 opacity-60" />
              Zone 2 (30-100ft)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
