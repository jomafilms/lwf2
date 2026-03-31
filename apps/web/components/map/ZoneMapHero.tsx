"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getMapboxToken } from "@/lib/geo/mapbox";
import { calculateFireZones, fireZonesToGeoJSON } from "@/lib/geo/fire-zones";
import { AddressSearch } from "./AddressSearch";
import { MAP_COLORS, ZONE_COLORS } from "@/lib/design-tokens";
import { MapPin, ArrowRight } from "lucide-react";
import type mapboxgl from "mapbox-gl";
import type { GeocodingResult } from "@/lib/geo/mapbox";

// Sample property coordinates in Ashland, OR
const ASHLAND_CENTER = { lat: 42.1946, lng: -122.7095 };

// Demo building footprint (house-like shape)
const DEMO_BUILDING: [number, number][] = [
  [-122.7098, 42.1948],  // Northwest corner
  [-122.7092, 42.1948],  // Northeast corner
  [-122.7092, 42.1944],  // Southeast corner
  [-122.7098, 42.1944],  // Southwest corner
];

interface ZoneMapHeroProps {
  onAddressSelect?: (result: GeocodingResult) => void;
  showMiniPreview?: boolean;
  previewAddress?: string;
  className?: string;
}

export function ZoneMapHero({
  onAddressSelect,
  showMiniPreview = false,
  previewAddress,
  className = "",
}: ZoneMapHeroProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const router = useRouter();

  // Initialize demo map
  useEffect(() => {
    if (!mapContainer.current || isMapLoaded) return;

    const initMap = async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        
        mapboxgl.accessToken = getMapboxToken();

        const map = new mapboxgl.Map({
          container: mapContainer.current!,
          style: "mapbox://styles/mapbox/satellite-v9",
          center: [ASHLAND_CENTER.lng, ASHLAND_CENTER.lat],
          zoom: showMiniPreview ? 17.5 : 16.5,
          interactive: !showMiniPreview, // Disable interactions for mini preview
          attributionControl: false,
        });

        mapRef.current = map;

        map.on("load", () => {
          addMapSources(map);
          addMapLayers(map);
          showDemoZones(map);
          setIsMapLoaded(true);
        });

        // Add click handler for demo map (redirect to full map)
        if (!showMiniPreview) {
          map.on("click", () => {
            router.push(`/map?lat=${ASHLAND_CENTER.lat}&lng=${ASHLAND_CENTER.lng}&address=${encodeURIComponent("Ashland, OR")}`);
          });
          
          // Add cursor pointer
          map.getCanvas().style.cursor = "pointer";
        }
      } catch (error) {
        console.error("Failed to load map:", error);
      }
    };

    initMap();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [isMapLoaded, showMiniPreview, router]);

  const handleAddressSelect = useCallback((result: GeocodingResult) => {
    if (onAddressSelect) {
      onAddressSelect(result);
    } else {
      // Default behavior: navigate to map page
      const params = new URLSearchParams({
        lat: String(result.lat),
        lng: String(result.lng),
        address: result.address,
      });
      router.push(`/map?${params.toString()}`);
    }
  }, [onAddressSelect, router]);

  const showDemoZones = (map: mapboxgl.Map) => {
    // Add demo building
    const buildingCoords = [...DEMO_BUILDING, DEMO_BUILDING[0]]; // Close the polygon
    
    setSourceData(map, "demo-structure", {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [buildingCoords],
          },
          properties: {},
        },
      ],
    });

    // Calculate and show fire zones
    const zones = calculateFireZones(DEMO_BUILDING);
    const zonesGeoJSON = fireZonesToGeoJSON(zones);
    setSourceData(map, "demo-zones", zonesGeoJSON);
  };

  if (showMiniPreview) {
    return (
      <div className={`relative ${className}`}>
        <div ref={mapContainer} className="h-full w-full rounded-lg overflow-hidden" />
        
        {/* Mini preview overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-lg pointer-events-none" />
        
        {/* Address label */}
        {previewAddress && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-md px-2 py-1">
            <div className="flex items-center gap-1 text-xs font-medium">
              <MapPin className="h-3 w-3 text-green-600" />
              <span className="truncate max-w-[120px]">{previewAddress}</span>
            </div>
          </div>
        )}

        {/* View full link */}
        <div className="absolute top-3 right-3">
          <button
            onClick={() => router.push(`/map?lat=${ASHLAND_CENTER.lat}&lng=${ASHLAND_CENTER.lng}&address=${encodeURIComponent(previewAddress || "Ashland, OR")}`)}
            className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium hover:bg-white transition-colors"
          >
            View Full
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="h-full w-full rounded-xl overflow-hidden" />
      
      {/* Map overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl pointer-events-none" />
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
        <div className="max-w-md">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            See Your Fire Zones
          </h2>
          <p className="text-sm sm:text-base text-white/90 mb-4 leading-relaxed">
            Enter your address to see fire defensible space zones around your property
          </p>
          
          {/* Address search */}
          <div className="mb-4">
            <AddressSearch
              onSelect={handleAddressSelect}
              placeholder="Enter your address to see your fire zones"
              className="w-full"
            />
          </div>

          {/* Click anywhere hint */}
          <p className="text-xs text-white/70 flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-white/70 rounded-full animate-pulse" />
            Click anywhere on this demo to explore the full map
          </p>
        </div>
      </div>

      {/* Zone legend */}
      <div className="absolute bottom-6 right-6 hidden sm:block">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
          <div className="text-xs text-white font-medium mb-2">Defensible Space Zones</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/90">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: ZONE_COLORS.zone0.hex, opacity: 0.8 }}
              />
              0-5 ft: Non-combustible
            </div>
            <div className="flex items-center gap-2 text-xs text-white/90">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: ZONE_COLORS.zone1.hex, opacity: 0.8 }}
              />
              5-30 ft: Lean & clean
            </div>
            <div className="flex items-center gap-2 text-xs text-white/90">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: ZONE_COLORS.zone2.hex, opacity: 0.8 }}
              />
              30-100 ft: Reduced fuel
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Map Helper Functions ────────────────────────────────────────────────────

function addMapSources(map: mapboxgl.Map) {
  const empty: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };
  map.addSource("demo-structure", { type: "geojson", data: empty });
  map.addSource("demo-zones", { type: "geojson", data: empty });
}

function addMapLayers(map: mapboxgl.Map) {
  // Fire zone fills
  map.addLayer({
    id: "demo-zones-fill",
    type: "fill",
    source: "demo-zones",
    paint: {
      "fill-color": [
        "match", ["get", "zone"],
        "zone0", ZONE_COLORS.zone0.hex,
        "zone1", ZONE_COLORS.zone1.hex,
        "zone2", ZONE_COLORS.zone2.hex,
        "#888",
      ],
      "fill-opacity": [
        "match", ["get", "zone"],
        "zone0", 0.6,
        "zone1", 0.5,
        "zone2", 0.4,
        0.2,
      ],
    },
  });

  // Fire zone outlines
  map.addLayer({
    id: "demo-zones-outline",
    type: "line",
    source: "demo-zones",
    paint: {
      "line-color": [
        "match", ["get", "zone"],
        "zone0", ZONE_COLORS.zone0.hex,
        "zone1", ZONE_COLORS.zone1.hex,
        "zone2", ZONE_COLORS.zone2.hex,
        "#888",
      ],
      "line-width": 2,
      "line-opacity": 0.8,
    },
  });

  // Demo structure
  map.addLayer({
    id: "demo-structure-fill",
    type: "fill",
    source: "demo-structure",
    paint: { 
      "fill-color": MAP_COLORS.structureFill, 
      "fill-opacity": 0.8 
    },
  });
  
  map.addLayer({
    id: "demo-structure-outline",
    type: "line",
    source: "demo-structure",
    paint: { 
      "line-color": MAP_COLORS.structureStroke, 
      "line-width": 3,
      "line-opacity": 1,
    },
  });
}

function setSourceData(map: mapboxgl.Map, id: string, data: GeoJSON.FeatureCollection) {
  const src = map.getSource(id) as mapboxgl.GeoJSONSource | undefined;
  src?.setData(data);
}