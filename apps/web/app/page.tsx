"use client";

import { useRouter } from "next/navigation";
import { AddressSearch } from "@/components/map/AddressSearch";
import { MapPin, Flame, TreePine } from "lucide-react";
import type { GeocodingResult } from "@/lib/geo/mapbox";

export default function Home() {
  const router = useRouter();

  const handleSelect = (result: GeocodingResult) => {
    const params = new URLSearchParams({
      lat: String(result.lat),
      lng: String(result.lng),
      address: result.address,
    });
    router.push(`/map?${params.toString()}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          FireScape
        </h1>
        <p className="mt-3 text-lg text-neutral-500">
          See your fire zones. Find the right plants.
        </p>

        <div className="mt-8">
          <AddressSearch onSelect={handleSelect} />
        </div>

        <div className="mt-10 flex justify-center gap-8 text-sm text-neutral-400">
          <div className="flex flex-col items-center gap-1.5">
            <MapPin className="h-5 w-5" />
            <span>Map your property</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Flame className="h-5 w-5" />
            <span>See fire zones</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <TreePine className="h-5 w-5" />
            <span>Get plant advice</span>
          </div>
        </div>
      </div>
    </main>
  );
}
