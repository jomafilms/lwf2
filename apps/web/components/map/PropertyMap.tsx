"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { getMapboxToken } from "@/lib/geo/mapbox";
import {
  calculateFireZones,
  fireZonesToGeoJSON,
  ZONE_COLORS,
  ZONE_OPACITY,
  type FireZones,
} from "@/lib/geo/fire-zones";
import { Pencil, RotateCcw, Check, Undo2 } from "lucide-react";
import type mapboxgl from "mapbox-gl";

export interface SavedPropertyData {
  structureFootprints: [number, number][];
  fireZones: FireZones;
}

interface PropertyMapProps {
  center: { lat: number; lng: number };
  onDrawStart?: () => void;
  onStructureDrawn?: (coords: [number, number][]) => void;
  onZonesCalculated?: (data: {
    structureCoords: [number, number][];
    fireZones: FireZones;
  }) => void;
  savedData?: SavedPropertyData | null;
}

type DrawState =
  | { mode: "idle" }
  | { mode: "drawing"; points: [number, number][] };

export function PropertyMap({
  center,
  onDrawStart,
  onStructureDrawn,
  onZonesCalculated,
  savedData,
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [drawState, setDrawState] = useState<DrawState>({ mode: "idle" });
  const [hasZones, setHasZones] = useState(false);
  const drawStateRef = useRef<DrawState>({ mode: "idle" });

  useEffect(() => {
    drawStateRef.current = drawState;
  }, [drawState]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    let map: mapboxgl.Map;

    const initMap = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
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
        addMapSources(map);
        addMapLayers(map);

        // Load saved property data if available
        if (savedData) {
          const coords = savedData.structureFootprints;
          const closedCoords = [...coords, coords[0]];

          setSourceData(map, "structure", {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: [closedCoords],
                },
                properties: {},
              },
            ],
          });

          const zonesGeoJSON = fireZonesToGeoJSON(savedData.fireZones);
          setSourceData(map, "fire-zones", zonesGeoJSON);
          setHasZones(true);
        }
      });

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

  const startDrawing = useCallback(() => {
    setDrawState({ mode: "drawing", points: [] });
    setHasZones(false);
    onDrawStart?.();
    const map = mapRef.current;
    if (map) {
      clearSource(map, "fire-zones");
      clearSource(map, "structure");
      map.getCanvas().style.cursor = "crosshair";
    }
  }, [onDrawStart]);

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
    const closedCoords = [...coords, coords[0]];

    // Show structure
    setSourceData(map, "structure", {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [closedCoords] },
          properties: {},
        },
      ],
    });

    // Calculate and show fire zones
    const zones = calculateFireZones(coords);
    const zonesGeoJSON = fireZonesToGeoJSON(zones);
    setSourceData(map, "fire-zones", zonesGeoJSON);

    // Clear drawing preview
    clearSource(map, "draw-points");
    clearSource(map, "draw-line");

    map.getCanvas().style.cursor = "";
    setDrawState({ mode: "idle" });
    setHasZones(true);
    onStructureDrawn?.(coords);
    onZonesCalculated?.({ structureCoords: coords, fireZones: zones });
  }, [drawState, onStructureDrawn, onZonesCalculated]);

  const isDrawing = drawState.mode === "drawing";
  const pointCount = isDrawing ? drawState.points.length : 0;

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Drawing controls — bottom center, touch-friendly */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {!isDrawing && (
          <button
            onClick={startDrawing}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium shadow-lg hover:bg-neutral-50 active:bg-neutral-100 sm:py-2.5"
          >
            {hasZones ? (
              <>
                <RotateCcw className="h-4 w-4" />
                Redraw
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Draw Structure
              </>
            )}
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
              onClick={undoPoint}
              disabled={pointCount === 0}
              className="rounded-lg bg-white p-3 shadow-lg hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-30 sm:p-2.5"
              title="Undo last point"
            >
              <Undo2 className="h-4 w-4" />
            </button>

            <button
              onClick={finishDrawing}
              disabled={pointCount < 3}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-neutral-800 active:bg-neutral-700 disabled:opacity-30 sm:py-2.5"
            >
              <Check className="h-4 w-4" />
              Done
            </button>
          </>
        )}
      </div>

      {/* Zone legend — bottom left, out of the way */}
      {hasZones && !isDrawing && (
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
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

function addMapSources(map: mapboxgl.Map) {
  const empty = { type: "FeatureCollection" as const, features: [] };
  map.addSource("draw-points", { type: "geojson", data: empty });
  map.addSource("draw-line", { type: "geojson", data: empty });
  map.addSource("structure", { type: "geojson", data: empty });
  map.addSource("fire-zones", { type: "geojson", data: empty });
}

function addMapLayers(map: mapboxgl.Map) {
  // Fire zone fills
  map.addLayer({
    id: "fire-zones-fill",
    type: "fill",
    source: "fire-zones",
    paint: {
      "fill-color": [
        "match", ["get", "zone"],
        "zone0", ZONE_COLORS.zone0,
        "zone1", ZONE_COLORS.zone1,
        "zone2", ZONE_COLORS.zone2,
        "#888",
      ],
      "fill-opacity": [
        "match", ["get", "zone"],
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
        "match", ["get", "zone"],
        "zone0", ZONE_COLORS.zone0,
        "zone1", ZONE_COLORS.zone1,
        "zone2", ZONE_COLORS.zone2,
        "#888",
      ],
      "line-width": 1.5,
      "line-opacity": 0.7,
    },
  });

  // Structure
  map.addLayer({
    id: "structure-fill",
    type: "fill",
    source: "structure",
    paint: { "fill-color": "#1e293b", "fill-opacity": 0.6 },
  });
  map.addLayer({
    id: "structure-outline",
    type: "line",
    source: "structure",
    paint: { "line-color": "#f8fafc", "line-width": 2 },
  });

  // Draw preview
  map.addLayer({
    id: "draw-line-layer",
    type: "line",
    source: "draw-line",
    paint: {
      "line-color": "#ffffff",
      "line-width": 2,
      "line-dasharray": [3, 2],
    },
  });
  map.addLayer({
    id: "draw-points-layer",
    type: "circle",
    source: "draw-points",
    paint: {
      "circle-radius": 7,
      "circle-color": "#ffffff",
      "circle-stroke-color": "#1e293b",
      "circle-stroke-width": 2.5,
    },
  });
}

function clearSource(map: mapboxgl.Map, id: string) {
  const src = map.getSource(id) as mapboxgl.GeoJSONSource | undefined;
  src?.setData({ type: "FeatureCollection", features: [] });
}

function setSourceData(map: mapboxgl.Map, id: string, data: GeoJSON.FeatureCollection) {
  const src = map.getSource(id) as mapboxgl.GeoJSONSource | undefined;
  src?.setData(data);
}

function updateDrawPreview(map: mapboxgl.Map, points: [number, number][]) {
  setSourceData(map, "draw-points", {
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: p },
      properties: {},
    })),
  });

  if (points.length >= 2) {
    setSourceData(map, "draw-line", {
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
  } else {
    clearSource(map, "draw-line");
  }
}
