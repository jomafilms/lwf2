"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { getMapboxToken } from "@/lib/geo/mapbox";
import {
  computeBuildingZoneRings,
  buildingZonesToGeoJSON,
} from "@/lib/geo/fire-zones";
import {
  fetchBuildingFootprints,
  getBufferedBoundingBox,
  type BuildingSource,
} from "@/lib/regional/building-service";
import { MAP_COLORS } from "@/lib/design-tokens";
import { BuildingZoneOverlay } from "./BuildingZoneOverlay";
import { BuildingZoneLegend } from "./BuildingZoneLegend";
import { BuildingZoneSummary } from "./BuildingZoneSummary";
import { Pencil, Loader2 } from "lucide-react";
import type mapboxgl from "mapbox-gl";
import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";

export interface BuildingZoneData {
  buildings: FeatureCollection<Polygon | MultiPolygon>;
  zones: FeatureCollection<Polygon | MultiPolygon>;
}

export interface ParcelBoundary {
  coordinates: [number, number][][];
  address: string;
  acreage: number;
  accountNumber: string;
}

interface PropertyMapProps {
  center: { lat: number; lng: number };
  parcelBoundary?: ParcelBoundary | null;
  buildingSource?: BuildingSource;
  onBuildingZonesCalculated?: (data: BuildingZoneData) => void;
  onEditBoundary?: () => void;
  savedBuildingZones?: BuildingZoneData | null;
}

export function PropertyMap({
  center,
  parcelBoundary,
  buildingSource = "overpass",
  onBuildingZonesCalculated,
  onEditBoundary,
  savedBuildingZones,
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [buildingZoneData, setBuildingZoneData] =
    useState<BuildingZoneData | null>(null);
  const [hasBuildingZones, setHasBuildingZones] = useState(false);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [buildingError, setBuildingError] = useState<string | null>(null);

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

        // Show parcel boundary if already available
        if (parcelBoundary) {
          showParcelBoundary(map, parcelBoundary);
        }

        // Show saved building zones if loading a saved property
        if (savedBuildingZones) {
          setBuildingZoneData(savedBuildingZones);
          setHasBuildingZones(true);
        }
      });
    };

    initMap();

    return () => {
      map?.remove();
      mapRef.current = null;
    };
  }, [center]);

  // Auto-load building footprints when parcel boundary arrives
  useEffect(() => {
    if (!parcelBoundary || !mapRef.current || savedBuildingZones) return;

    const loadBuildingZones = async () => {
      setLoadingBuildings(true);
      setBuildingError(null);

      try {
        const coords = parcelBoundary.coordinates[0];
        if (!coords || coords.length < 3) {
          throw new Error("Invalid parcel boundary coordinates");
        }

        const bbox = getBufferedBoundingBox(coords, 200);
        const response = await fetchBuildingFootprints(bbox, buildingSource);

        if (!response.success || !response.buildings) {
          throw new Error(response.error || "Failed to fetch buildings");
        }

        if (response.buildings.features.length === 0) {
          setBuildingZoneData(null);
          setHasBuildingZones(false);
          setBuildingError("No building footprints found in this area");
          return;
        }

        const zoneRings = computeBuildingZoneRings(response.buildings);
        const zonesGeoJSON = buildingZonesToGeoJSON(zoneRings);

        const newData: BuildingZoneData = {
          buildings: response.buildings,
          zones: zonesGeoJSON,
        };

        setBuildingZoneData(newData);
        setHasBuildingZones(true);
        onBuildingZonesCalculated?.(newData);
      } catch (error) {
        console.error("Failed to load building zones:", error);
        setBuildingZoneData(null);
        setHasBuildingZones(false);
        setBuildingError(
          error instanceof Error ? error.message : "Failed to load buildings",
        );
      } finally {
        setLoadingBuildings(false);
      }
    };

    loadBuildingZones();
  }, [parcelBoundary, buildingSource, savedBuildingZones, onBuildingZonesCalculated]);

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

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Building zone overlay */}
      {buildingZoneData && (
        <BuildingZoneOverlay
          map={mapRef.current}
          buildings={buildingZoneData.buildings}
          zones={buildingZoneData.zones}
          onZonesReady={setHasBuildingZones}
        />
      )}

      {/* Parcel info badge */}
      {parcelBoundary && (
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <div className="rounded-lg bg-emerald-600/90 px-3 py-2 text-white shadow-lg backdrop-blur-sm">
            <p className="text-xs font-semibold">Property boundary found</p>
            <p className="text-[11px] opacity-90">
              {parcelBoundary.address} · {parcelBoundary.acreage} acres
            </p>
            {loadingBuildings && (
              <p className="mt-1 flex items-center gap-1 text-[10px] opacity-75">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading building footprints…
              </p>
            )}
            {buildingSource === "overpass" && hasBuildingZones && (
              <p className="mt-1 text-[10px] opacity-60">
                Building data: OpenStreetMap
              </p>
            )}
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
      )}

      {/* Loading overlay */}
      {loadingBuildings && (
        <div className="absolute inset-x-0 bottom-20 flex justify-center sm:bottom-8">
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
            <p className="text-xs font-medium text-neutral-700">
              Computing fire-reluctant zones…
            </p>
          </div>
        </div>
      )}

      {/* No buildings found */}
      {buildingError && !loadingBuildings && (
        <div className="absolute inset-x-0 bottom-20 flex justify-center sm:bottom-8">
          <div className="rounded-xl bg-white px-4 py-2.5 shadow-lg">
            <p className="text-xs font-medium text-neutral-500">
              {buildingError}
            </p>
            <p className="text-[10px] text-neutral-400">
              Building data coverage varies by region
            </p>
          </div>
        </div>
      )}

      {/* Building zone legend and summary */}
      {hasBuildingZones && (
        <div className="absolute bottom-6 left-4 space-y-3">
          <BuildingZoneLegend hasZones={hasBuildingZones} compact={false} />
          {buildingZoneData && (
            <BuildingZoneSummary
              buildings={buildingZoneData.buildings}
              zones={buildingZoneData.zones}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

function addMapSources(map: mapboxgl.Map) {
  const empty: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [],
  };
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
      let minLng = Infinity,
        minLat = Infinity,
        maxLng = -Infinity,
        maxLat = -Infinity;
      for (const [lng, lat] of coords) {
        if (lng < minLng) minLng = lng;
        if (lat < minLat) minLat = lat;
        if (lng > maxLng) maxLng = lng;
        if (lat > maxLat) maxLat = lat;
      }
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 80, maxZoom: 19, duration: 1000 },
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

function setSourceData(
  map: mapboxgl.Map,
  id: string,
  data: GeoJSON.FeatureCollection,
) {
  const src = map.getSource(id) as mapboxgl.GeoJSONSource | undefined;
  src?.setData(data);
}
