"use client";

import { useRouter } from "next/navigation";
import { AddressSearch } from "@/components/map/AddressSearch";
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
        <p className="mt-4 text-lg text-neutral-600">
          Fire-safe landscaping for your property. Enter your address to see
          your fire zones and get plant recommendations.
        </p>
        <div className="mt-8">
          <AddressSearch onSelect={handleSelect} />
        </div>
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-zone0" />
            Zone 0 (0-5ft)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-zone1" />
            Zone 1 (5-30ft)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-zone2" />
            Zone 2 (30-100ft)
          </span>
        </div>
      </div>
    </main>
  );
}
