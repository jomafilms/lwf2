"use client";

import Link from "next/link";
import { Flame, TreePine, Map, MessageSquare, Users, Home } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-20 pb-12 sm:pt-28 sm:pb-16">
        <div className="w-full max-w-3xl text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Flame className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold text-stone-900 sm:text-3xl">Living With Fire</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-5xl">
            Choose the right plants.
            <br />
            <span className="text-green-700">Protect what matters.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-stone-500 sm:mt-6 sm:text-lg">
            1,300+ plants rated for fire safety. Built for communities
            in the Rogue Valley — starting with Ashland, OR.
          </p>
        </div>
      </section>

      {/* Where do you want to start? */}
      <section className="px-4 pb-12 sm:pb-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-stone-400 mb-8">
            Where do you want to start?
          </h2>

          {/* Three tools */}
          <div className="grid gap-4 sm:grid-cols-3 mb-4">
            <ToolCard
              href="/plants"
              icon={<TreePine className="h-7 w-7" />}
              iconBg="bg-green-100 text-green-700"
              title="Browse Plants"
              description="Filter 1,300+ plants by fire score, zone, water needs, deer resistance, and more"
            />
            <ToolCard
              href="/dashboard/chat"
              icon={<MessageSquare className="h-7 w-7" />}
              iconBg="bg-purple-100 text-purple-700"
              title="Chat with Advisor"
              description="Ask our AI plant advisor for personalized recommendations and hardening tips"
            />
            <ToolCard
              href="/map"
              icon={<Map className="h-7 w-7" />}
              iconBg="bg-blue-100 text-blue-700"
              title="Map My Property"
              description="See your fire zones and understand what to plant where"
            />
          </div>

          {/* Two audience entries */}
          <div className="grid gap-4 sm:grid-cols-2">
            <AudienceCard
              href="/lists"
              icon={<Users className="h-6 w-6" />}
              iconBg="bg-orange-100 text-orange-700"
              title="Community Organization"
              subtitle="HOA, nursery, city, or neighborhood group"
              description="Create approved plant lists with CC&R guidance for your community"
              cta="Browse community lists"
            />
            <AudienceCard
              href="/plants"
              icon={<Home className="h-6 w-6" />}
              iconBg="bg-emerald-100 text-emerald-700"
              title="Resident"
              subtitle="Homeowner or renter"
              description="Find fire-safe plants for your yard, save favorites, and see what your HOA recommends"
              cta="Start browsing plants"
            />
          </div>
        </div>
      </section>

      {/* Credibility bar */}
      <section className="border-y border-stone-200 bg-stone-50 px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <span><strong className="text-stone-700">1,300+</strong> <span className="text-stone-500">plants</span></span>
          <span className="text-stone-300 hidden sm:inline">·</span>
          <span><strong className="text-stone-700">250+</strong> <span className="text-stone-500">native species</span></span>
          <span className="text-stone-300 hidden sm:inline">·</span>
          <span className="text-stone-500">Data sourced & verified</span>
          <span className="text-stone-300 hidden sm:inline">·</span>
          <span className="text-stone-500">Built for Ashland, OR</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 text-center">
        <p className="text-xs leading-relaxed text-stone-400 sm:text-sm">
          Data maintained by{" "}
          <span className="font-medium text-stone-500">Charisse Sydoriak</span>
          . Built at{" "}
          <span className="font-medium text-stone-500">Rogue Raise 2026</span>.
        </p>
      </footer>
    </main>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function ToolCard({
  href,
  icon,
  iconBg,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center text-center rounded-xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-stone-300 transition-all"
    >
      <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${iconBg} mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-base font-semibold text-stone-900 group-hover:text-green-700 transition-colors">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-stone-500">
        {description}
      </p>
    </Link>
  );
}

function AudienceCard({
  href,
  icon,
  iconBg,
  title,
  subtitle,
  description,
  cta,
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-stone-300 transition-all"
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-stone-900 group-hover:text-green-700 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>
        <p className="mt-1.5 text-sm text-stone-500 leading-relaxed">{description}</p>
        <span className="mt-2 inline-block text-sm font-medium text-green-600 group-hover:text-green-700">
          {cta} →
        </span>
      </div>
    </Link>
  );
}
