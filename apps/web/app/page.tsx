"use client";

import { useRouter } from "next/navigation";
import { AddressSearch } from "@/components/map/AddressSearch";
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
      <section className="relative flex flex-col items-center justify-center bg-gradient-to-b from-stone-50 to-white px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
            See your fire zones.
            <br />
            <span className="text-amber-700">Plan your landscape.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-stone-600 sm:mt-6 sm:text-lg">
            Powered by 1,300+ researched plants. Informed decisions for{" "}
            <strong className="text-stone-800">YOUR</strong> property.
          </p>

          <div className="mx-auto mt-8 max-w-md sm:mt-10">
            <AddressSearch onSelect={handleSelect} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-stone-200 bg-white px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="mb-8 text-center text-lg font-semibold text-stone-800 sm:mb-12 sm:text-xl">
          How it works
        </h2>
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-3 sm:gap-8">
          <HowStep
            emoji="🗺️"
            step="1"
            title="Enter your address"
            description="Satellite view loads with your property boundary auto-detected."
          />
          <HowStep
            emoji="🎯"
            step="2"
            title="See your fire zones"
            description="Color-coded zones overlay automatically based on your structures."
          />
          <HowStep
            emoji="🌿"
            step="3"
            title="Get informed recommendations"
            description="AI advisor suggests plants with local nursery pricing."
          />
        </div>
      </section>

      {/* Stakeholder Sections */}
      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="mb-8 text-center text-lg font-semibold text-stone-800 sm:mb-12 sm:text-xl">
          Built for everyone in the chain
        </h2>
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 sm:gap-6">
          <StakeholderCard
            emoji="🏠"
            title="Homeowners"
            description="Understand what's on YOUR property and make informed choices about fire-reluctant landscaping."
            accent="bg-amber-50 border-amber-200"
          />
          <StakeholderCard
            emoji="🌱"
            title="Landscapers"
            description="Design with real fire data and submit compliant plans backed by zone calculations."
            accent="bg-green-50 border-green-200"
          />
          <StakeholderCard
            emoji="🏪"
            title="Nurseries"
            description="Connect your inventory to what homeowners actually need — zone-matched and locally available."
            accent="bg-sky-50 border-sky-200"
          />
          <StakeholderCard
            emoji="🏛️"
            title="Cities & HOAs"
            description="Track community progress toward wildfire readiness with real adoption data."
            accent="bg-violet-50 border-violet-200"
          />
        </div>
      </section>

      {/* Credibility Bar */}
      <section className="border-y border-stone-200 bg-stone-50 px-4 py-8 sm:py-10">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-3 sm:gap-x-6">
          <CredBadge value="1,300+" label="plants" />
          <Dot />
          <CredBadge value="250+" label="native species" />
          <Dot />
          <CredBadge value="✓" label="data sourced & verified" />
          <Dot />
          <CredBadge value="📍" label="Built for Ashland, OR" />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 text-center sm:py-10">
        <p className="text-xs leading-relaxed text-stone-400 sm:text-sm">
          Data maintained by{" "}
          <span className="font-medium text-stone-500">
            Charisse Sydoriak
          </span>
          . Built at{" "}
          <span className="font-medium text-stone-500">
            Rogue Raise 2026
          </span>
          .
        </p>
      </footer>
    </main>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function HowStep({
  emoji,
  step,
  title,
  description,
}: {
  emoji: string;
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-2xl sm:h-16 sm:w-16">
        {emoji}
      </div>
      <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">
        Step {step}
      </div>
      <h3 className="mt-1 text-sm font-semibold text-stone-800 sm:text-base">
        {title}
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-stone-500 sm:text-sm">
        {description}
      </p>
    </div>
  );
}

function StakeholderCard({
  emoji,
  title,
  description,
  accent,
}: {
  emoji: string;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div
      className={`rounded-xl border p-5 transition-shadow hover:shadow-md sm:p-6 ${accent}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <h3 className="text-sm font-semibold text-stone-800 sm:text-base">
          {title}
        </h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        {description}
      </p>
    </div>
  );
}

function CredBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs sm:text-sm">
      <span className="font-bold text-stone-700">{value}</span>
      <span className="text-stone-500">{label}</span>
    </div>
  );
}

function Dot() {
  return (
    <span className="hidden text-stone-300 sm:inline" aria-hidden>
      ·
    </span>
  );
}
