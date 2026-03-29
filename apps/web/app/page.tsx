"use client";

import { useRouter } from "next/navigation";
import { AddressSearch } from "@/components/map/AddressSearch";
import {
  MapPin,
  Flame,
  TreePine,
  Home,
  Ruler,
  Users,
  Building2,
} from "lucide-react";
import type { GeocodingResult } from "@/lib/geo/mapbox";

export default function HomePage() {
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
    <main className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            See your fire zones.
            <br />
            <span className="text-neutral-500">Plan your landscape.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-neutral-500 sm:text-lg">
            Enter your address to see which fire zones apply to your property
            and get plant recommendations from local nurseries.
          </p>

          <div className="mt-8">
            <AddressSearch onSelect={handleSelect} />
          </div>

          {/* How it works */}
          <div className="mt-12 flex justify-center gap-10 sm:gap-14">
            <Step icon={MapPin} label="Enter your address" />
            <Step icon={Flame} label="See fire zones" />
            <Step icon={TreePine} label="Get plant advice" />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-t bg-neutral-50 px-4 py-6">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-neutral-500 sm:text-sm">
          <span>1,300+ plants</span>
          <span className="hidden text-neutral-300 sm:inline">|</span>
          <span>5 local nurseries</span>
          <span className="hidden text-neutral-300 sm:inline">|</span>
          <span>Built on Charisse Sydoriak&apos;s fire-reluctant plant database</span>
        </div>
      </section>

      {/* Stakeholder callouts */}
      <section className="border-t px-4 py-12 sm:py-16">
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          <Callout
            icon={Home}
            title="Homeowners"
            description="Know what to plant in every zone. Find fire-reluctant plants available at local nurseries."
          />
          <Callout
            icon={Ruler}
            title="Landscapers"
            description="Design compliant yards with real plant data, zone calculations, and local pricing."
          />
          <Callout
            icon={Building2}
            title="Nurseries"
            description="Connect your inventory to the demand created by fire-safe landscaping requirements."
          />
          <Callout
            icon={Users}
            title="Cities & HOAs"
            description="Track community wildfire readiness and drive adoption of fire-safe landscapes."
          />
        </div>
      </section>
    </main>
  );
}

function Step({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Icon className="h-5 w-5 text-neutral-400" />
      <span className="text-xs text-neutral-500">{label}</span>
    </div>
  );
}

function Callout({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Home;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 p-5">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-neutral-400" />
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
        {description}
      </p>
    </div>
  );
}
