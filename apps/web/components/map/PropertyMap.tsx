"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { getMapboxToken } from "@/lib/geo/mapbox";
import {
  calculateFireZones,
  fireZonesToGeoJSON,
  ZONE_COLORS,
  ZONE_OPACITY,
  type FireZones,
} from "@/lib/geo/fire-zones";
import { MAP_COLORS } from "@/lib/design-tokens";
import type mapboxgl from "mapbox-gl";
import { MapControls } from "./MapControls";
import { ZoneOverlay } from "./ZoneOverlay";
import { ParcelDisplay } from "./ParcelDisplay";

export interface SavedPropertyData {
  structureFootprints: [number, number][];
  fireZones: FireZones;
}

export interface ParcelBoundary {
  coordinates: [number, number][][];
  address: string;
  acreage: number;
  accountNumber: string;
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
  parcelBoundary?: ParcelBoundary | null;
  onEditBoundary?: () => void;
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
  parcelBoundary,
  onEditBoundary,
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

        // Show parcel boundary if provided
        if (parcelBoundary) {
          showParcelBoundary(map, parcelBoundary);
        }
      });

      map.on("click", (e: { lngLat: { lng: number; lat: number } }) => {
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

  // Update parcel boundary when it changes after map init
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (parcelBoundary) {
      showParcelBoundary(map, parcelBoundary);
    } else {
      clearSource(map, "parcel-boundary");
    }
  }, [parcelBoundary]);

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

    const zones = calculateFireZones(coords);
    const zonesGeoJSON = fireZonesToGeoJSON(zones);
    setSourceData(map, "fire-zones", zonesGeoJSON);

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

      {/* Parcel info badge */}
      <ParcelDisplay
        parcelBoundary={parcelBoundary}
        isDrawing={isDrawing}
        onEditBoundary={onEditBoundary}
      />

      {/* Drawing controls */}
      <MapControls
        isDrawing={isDrawing}
        hasZones={hasZones}
        pointCount={pointCount}
        parcelBoundary={!!parcelBoundary}
        onStartDrawing={startDrawing}
        onUndoPoint={undoPoint}
        onFinishDrawing={finishDrawing}
      />

      {/* Zone legend */}
      <ZoneOverlay hasZones={hasZones} isDrawing={isDrawing} />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

function addMapSources(map: mapboxgl.Map) {
  const empty: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };
  map.addSource("draw-points", { type: "geojson", data: empty });
  map.addSource("draw-line", { type: "geojson", data: empty });
  map.addSource("structure", { type: "geojson", data: empty });
  map.addSource("fire-zones", { type: "geojson", data: empty });
  map.addSource("parcel-boundary", { type: "geojson", data: empty });
}

function addMapLayers(map: mapboxgl.Map) {
  // Parcel boundary fill (subtle)
  map.addLayer({
    id: "parcel-boundary-fill",
    type: "fill",
    source: "parcel-boundary",
    paint: {
      "fill-color": MAP_COLORS.parcelFill,
      "fill-opacity": 0.08,
    },
  });

  // Parcel boundary outline
  map.addLayer({
    id: "parcel-boundary-outline",
    type: "line",
    source: "parcel-boundary",
    paint: {
      "line-color": MAP_COLORS.parcelStroke,
      "line-width": 2.5,
      "line-dasharray": [4, 2],
      "line-opacity": 0.9,
    },
  });

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
    paint: { "fill-color": MAP_COLORS.structureFill, "fill-opacity": 0.6 },
  });
  map.addLayer({
    id: "structure-outline",
    type: "line",
    source: "structure",
    paint: { "line-color": MAP_COLORS.structureStroke, "line-width": 2 },
  });

  // Draw preview
  map.addLayer({
    id: "draw-line-layer",
    type: "line",
    source: "draw-line",
    paint: {
      "line-color": MAP_COLORS.drawLine,
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
      "circle-color": MAP_COLORS.drawPoint,
      "circle-stroke-color": MAP_COLORS.drawPointStroke,
      "circle-stroke-width": 2.5,
    },
  });
}

function showParcelBoundary(map: mapboxgl.Map, parcel: ParcelBoundary) {
  setSourceData(map, "parcel-boundary", {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: parcel.coordinates,
        },
        properties: {
          address: parcel.address,
          acreage: parcel.acreage,
        },
      },
    ],
  });

  // Fit map to parcel bounds
  try {
    const coords = parcel.coordinates[0];
    if (coords && coords.length > 2) {
      let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
      for (const [lng, lat] of coords) {
        if (lng < minLng) minLng = lng;
        if (lat < minLat) minLat = lat;
        if (lng > maxLng) maxLng = lng;
        if (lat > maxLat) maxLat = lat;
      }
      map.fitBounds(
        [[minLng, minLat], [maxLng, maxLat]],
        { padding: 80, maxZoom: 19, duration: 1000 }
      );
    }
  } catch {
    // fitBounds is best-effort
  }
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
