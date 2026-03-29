"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AddressSearch } from "@/components/map/AddressSearch";
import { PropertyMap } from "@/components/map/PropertyMap";
import { ArrowLeft } from "lucide-react";
import type { GeocodingResult } from "@/lib/geo/mapbox";

export default function MapPage() {
  const searchParams = useSearchParams();
  const [location, setLocation] = useState<GeocodingResult | null>(null);
  const [structureCoords, setStructureCoords] = useState<
    [number, number][] | null
  >(null);

  // Read initial location from URL params (from home page search)
  useEffect(() => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const address = searchParams.get("address");
    if (lat && lng) {
      setLocation({
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        address: address || `${lat}, ${lng}`,
      });
    }
  }, [searchParams]);

  const handleAddressSelect = (result: GeocodingResult) => {
    setLocation(result);
    setStructureCoords(null);
  };

  if (!location) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <h1 className="mb-2 text-center text-3xl font-bold">
            Map Your Property
          </h1>
          <p className="mb-6 text-center text-neutral-500">
            Enter your address to view satellite imagery and calculate fire
            zones.
          </p>
          <AddressSearch onSelect={handleAddressSelect} />
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <button
          onClick={() => {
            setLocation(null);
            setStructureCoords(null);
          }}
          className="rounded-lg p-1.5 hover:bg-neutral-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-medium">{location.address}</p>
          <p className="text-xs text-neutral-500">
            {structureCoords
              ? `Structure drawn (${structureCoords.length} points) — fire zones calculated`
              : "Click 'Draw Structure' to outline your building, then see fire zones"}
          </p>
        </div>
        <AddressSearch onSelect={handleAddressSelect} className="w-80" />
      </div>

      {/* Map */}
      <div className="flex-1">
        <PropertyMap
          center={{ lat: location.lat, lng: location.lng }}
          onStructureDrawn={(coords) => setStructureCoords(coords)}
        />
      </div>
    </div>
  );
}
