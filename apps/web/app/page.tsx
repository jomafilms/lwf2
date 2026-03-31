"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AddressSearch } from "@/components/map/AddressSearch";
import { LazyZoneMapHero } from "@/components/map/LazyZoneMapHero";
import { DefensibleSpaceInfo } from "@/components/zones/DefensibleSpaceInfo";
import type { GeocodingResult } from "@/lib/geo/mapbox";

export default function HomePage() {
  const router = useRouter();
  const [communityStats, setCommunityStats] = useState<{
    propertiesAssessed: number;
  } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<GeocodingResult | null>(null);

  useEffect(() => {
    // Load community stats for the progress counter
    async function fetchCommunityStats() {
      try {
        const response = await fetch("/api/community/stats");
        if (response.ok) {
          const data = await response.json();
          setCommunityStats({
            propertiesAssessed: data.community?.propertiesAssessed || 340
          });
        }
      } catch {
        // Use fallback number if API fails
        setCommunityStats({ propertiesAssessed: 340 });
      }
    }
    fetchCommunityStats();
  }, []);

  const handleSelect = (result: GeocodingResult) => {
    const params = new URLSearchParams({
      lat: String(result.lat),
      lng: String(result.lng),
      address: result.address,
    });
    router.push(`/map?${params.toString()}`);
  };

  const handleHeroAddressSelect = (result: GeocodingResult) => {
    setSelectedAddress(result);
    // Don't immediately navigate - show preview first
  };

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
            Choosing Plants for
            <br />
            <span className="text-green-700">Fire-Prone Yards</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-600 sm:mt-6 sm:text-lg">
            This tool helps you choose plants that are appropriate for your home or business by comparing characteristics such as how easily plants ignite, how much water and sunlight they need, whether they support wildlife, and how well they fit your site.
          </p>

          <div className="mx-auto mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row sm:justify-center">
            <Link
              href="/plants"
              className="inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 text-lg font-semibold text-white hover:bg-green-700 transition-colors"
            >
              Browse Plants
            </Link>
            <div className="sm:hidden">
              <AddressSearch onSelect={handleSelect} placeholder="Search your address" />
            </div>
            <Link
              href="/map"
              className="inline-flex items-center justify-center rounded-lg border border-green-600 px-6 py-3 text-lg font-semibold text-green-600 hover:bg-green-50 transition-colors"
            >
              Map My Property
            </Link>
          </div>
          
          <div className="mx-auto mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/hardening"
              className="inline-flex items-center justify-center rounded-lg border border-orange-600 px-6 py-3 text-lg font-semibold text-orange-600 hover:bg-orange-50 transition-colors"
            >
              Home Hardening
            </Link>
            <Link
              href="/hoa"
              className="inline-flex items-center justify-center rounded-lg border border-blue-600 px-6 py-3 text-lg font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
            >
              For HOAs
            </Link>
          </div>

          <div className="mx-auto mt-6 hidden max-w-md sm:block">
            <AddressSearch onSelect={handleSelect} placeholder="Or start by entering your address" />
          </div>
        </div>
      </section>

      {/* Zone Map Hero */}
      <section className="px-4 py-12 sm:px-6 sm:py-16 bg-stone-50">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: Map */}
            <div className="order-2 lg:order-1">
              <LazyZoneMapHero
                onAddressSelect={handleHeroAddressSelect}
                className="h-96 sm:h-[28rem]"
              />
            </div>
            
            {/* Right: Content + Address Search + Preview */}
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-stone-900 mb-4 lg:text-4xl">
                Visualize Your Fire Zones
              </h2>
              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                See exactly where fire-reluctant plants should be placed around your property. 
                Our interactive map shows the critical 5/10/30/100-foot defensible space zones 
                that can protect your home from wildfire.
              </p>

              {/* Address Search */}
              <div className="mb-6">
                <AddressSearch
                  onSelect={handleHeroAddressSelect}
                  placeholder="Enter your address to see your fire zones"
                />
              </div>

              {/* Mini Preview */}
              {selectedAddress && (
                <div className="mb-6 rounded-xl border-2 border-green-200 bg-green-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-green-900 mb-1">Preview Ready</h3>
                      <p className="text-sm text-green-700 truncate">{selectedAddress.address}</p>
                      <div className="mt-3">
                        <LazyZoneMapHero
                          showMiniPreview={true}
                          previewAddress={selectedAddress.address}
                          className="h-32 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleSelect(selectedAddress)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      View Full Assessment →
                    </button>
                    <button
                      onClick={() => setSelectedAddress(null)}
                      className="text-green-700 hover:text-green-800 text-sm font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white rounded-lg p-4 border border-stone-200">
                  <div className="text-2xl font-bold text-red-600">4</div>
                  <div className="text-sm text-stone-600">Defense Zones</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-stone-200">
                  <div className="text-2xl font-bold text-orange-600">100ft</div>
                  <div className="text-sm text-stone-600">Protection Radius</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Defensible Space Information */}
      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <DefensibleSpaceInfo />
        </div>
      </section>

      {/* Community Progress Counter */}
      <section className="border-y border-stone-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">
            Ashland Community Progress
          </h2>
          <div className="mt-6 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 sm:text-5xl">
                {communityStats?.propertiesAssessed || 340}
              </div>
              <div className="mt-1 text-lg font-medium text-stone-700">
                plans created
              </div>
            </div>
            <div className="max-w-md text-center sm:text-left">
              <p className="text-lg text-stone-600">
                Join your neighbors in building a fire-ready community
              </p>
              <Link
                href="/community"
                className="mt-3 inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold"
              >
                See community progress →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Lists */}
      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-stone-900 sm:text-3xl">
            Featured Plant Collections
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeaturedListCard
              title="City of Ashland — Restricted Plants"
              description="Official list of plants to avoid in fire-prone areas"
              category="Municipal"
              plantCount="25+"
              href="/lists/featured/0"
            />
            <FeaturedListCard
              title="Native Fire-Reluctant Plants"
              description="Indigenous species that naturally resist ignition"
              category="Native"
              plantCount="120+"
              href="/lists/featured/1"
            />
            <FeaturedListCard
              title="Low-Water Fire-Safe Garden"
              description="Drought-tolerant plants that reduce fire risk"
              category="Water-Wise"
              plantCount="85+"
              href="/lists/featured/2"
            />
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/lists"
              className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold"
            >
              Browse all plant lists →
            </Link>
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
            emoji="🌿"
            step="1"
            title="Browse fire-reluctant plants"
            description="Explore 1,300+ researched plants with detailed fire-safety ratings."
          />
          <HowStep
            emoji="🗺️"
            step="2"
            title="Map your property"
            description="See fire zones and get site-specific plant recommendations."
          />
          <HowStep
            emoji="📋"
            step="3"
            title="Create your plan"
            description="Build a custom landscaping plan that fits your site and needs."
          />
        </div>
      </section>

      {/* Why Choose Fire-Reluctant Plants */}
      <section className="px-4 py-12 sm:px-6 sm:py-16 bg-stone-50">
        <h2 className="mb-8 text-center text-lg font-semibold text-stone-800 sm:mb-12 sm:text-xl">
          Why choose fire-reluctant plants?
        </h2>
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 sm:gap-6">
          <BenefitCard
            emoji="🔥"
            title="Reduce Fire Risk"
            description="Plants with high moisture content and low ignition potential create defensible spaces around your home."
            accent="bg-red-50 border-red-200"
          />
          <BenefitCard
            emoji="💧"
            title="Water Efficient"
            description="Many fire-reluctant plants are drought-tolerant, requiring less water while providing fire protection."
            accent="bg-blue-50 border-blue-200"
          />
          <BenefitCard
            emoji="🦋"
            title="Support Wildlife"
            description="Native fire-reluctant plants provide habitat for local birds, pollinators, and beneficial insects."
            accent="bg-green-50 border-green-200"
          />
          <BenefitCard
            emoji="🏡"
            title="Beautiful & Functional"
            description="Create stunning landscapes that protect your property without sacrificing aesthetic appeal."
            accent="bg-amber-50 border-amber-200"
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

function FeaturedListCard({
  title,
  description,
  category,
  plantCount,
  href,
}: {
  title: string;
  description: string;
  category: string;
  plantCount: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-stone-900 group-hover:text-green-600 transition-colors">
            {title}
          </h3>
          <p className="mt-1 text-sm text-stone-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-green-700 font-medium">
          {category}
        </span>
        <span className="text-stone-500">{plantCount} plants</span>
      </div>
    </Link>
  );
}

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

function BenefitCard({
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
