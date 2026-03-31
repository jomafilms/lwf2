"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Download, Share2 } from "lucide-react";
import { HardeningChecklist } from "@/components/hardening/HardeningChecklist";
import { HardeningSummary } from "@/components/hardening/HardeningSummary";

export type Priority = "critical" | "important" | "nice-to-have";
export type CostRange = "$" | "$$" | "$$$";

export interface HardeningItemData {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  cost: CostRange;
  completed: boolean;
}

export interface HardeningCategoryData {
  id: string;
  title: string;
  icon: string;
  description: string;
  items: HardeningItemData[];
}

// Hardening checklist data - based on Dennis Holeman's feedback about structural hardening
const HARDENING_CATEGORIES: HardeningCategoryData[] = [
  {
    id: "roof-gutters",
    title: "Roof & Gutters",
    icon: "🏠",
    description: "Class A roofing materials and debris management",
    items: [
      {
        id: "class-a-roof",
        title: "Install Class A fire-rated roofing",
        description: "Asphalt shingles, metal, tile, or slate materials that resist ignition",
        priority: "critical",
        cost: "$$$",
        completed: false,
      },
      {
        id: "gutter-guards",
        title: "Install gutter guards",
        description: "Prevent leaf and debris accumulation in gutters",
        priority: "important",
        cost: "$$",
        completed: false,
      },
      {
        id: "roof-cleaning",
        title: "Regular roof and gutter cleaning",
        description: "Remove leaves, needles, and combustible debris quarterly",
        priority: "important",
        cost: "$",
        completed: false,
      },
      {
        id: "chimney-cap",
        title: "Install chimney spark arrestor/cap",
        description: "1/2\" mesh screen to prevent ember escape",
        priority: "critical",
        cost: "$$",
        completed: false,
      },
    ],
  },
  {
    id: "vents-openings",
    title: "Vents & Openings",
    icon: "🌬️",
    description: "Seal openings to prevent ember entry",
    items: [
      {
        id: "vent-screening",
        title: "Install 1/8\" mesh vent screening",
        description: "Screen all foundation, soffit, and roof vents with fine mesh",
        priority: "critical",
        cost: "$$",
        completed: false,
      },
      {
        id: "soffit-vents",
        title: "Upgrade soffit vents",
        description: "Use enclosed soffit vents or screen existing ones",
        priority: "important",
        cost: "$$",
        completed: false,
      },
      {
        id: "attic-vents",
        title: "Secure attic and ridge vents",
        description: "Ensure all roof vents have proper screening and baffles",
        priority: "important",
        cost: "$",
        completed: false,
      },
      {
        id: "dryer-vent",
        title: "Install dryer vent cover",
        description: "Spring-loaded cover prevents ember entry when not in use",
        priority: "important",
        cost: "$",
        completed: false,
      },
    ],
  },
  {
    id: "exterior-walls",
    title: "Exterior Walls",
    icon: "🧱",
    description: "Fire-resistant siding and gap sealing",
    items: [
      {
        id: "fire-resistant-siding",
        title: "Upgrade to fire-resistant siding",
        description: "Fiber cement, stucco, metal, or brick instead of wood",
        priority: "critical",
        cost: "$$$",
        completed: false,
      },
      {
        id: "caulk-gaps",
        title: "Caulk gaps and cracks",
        description: "Seal gaps around pipes, wires, and building penetrations",
        priority: "important",
        cost: "$",
        completed: false,
      },
      {
        id: "trim-vegetation",
        title: "Maintain siding clearance",
        description: "Keep vegetation 5+ feet from exterior walls",
        priority: "important",
        cost: "$",
        completed: false,
      },
    ],
  },
  {
    id: "windows-doors",
    title: "Windows & Doors",
    icon: "🪟",
    description: "Heat-resistant glazing and weather sealing",
    items: [
      {
        id: "dual-pane-windows",
        title: "Install dual-pane tempered glass windows",
        description: "Multi-pane windows with tempered glass resist heat better",
        priority: "important",
        cost: "$$$",
        completed: false,
      },
      {
        id: "weather-stripping",
        title: "Install tight weather stripping",
        description: "Prevent ember entry through gaps around doors and windows",
        priority: "important",
        cost: "$",
        completed: false,
      },
      {
        id: "exterior-shutters",
        title: "Install exterior shutters or screens",
        description: "Metal shutters or screens provide extra window protection",
        priority: "nice-to-have",
        cost: "$$",
        completed: false,
      },
    ],
  },
  {
    id: "decks-fences",
    title: "Decks & Fences",
    icon: "🔨",
    description: "Non-combustible materials and defensible spacing",
    items: [
      {
        id: "deck-materials",
        title: "Use fire-resistant deck materials",
        description: "Composite, metal, or concrete instead of wood decking",
        priority: "important",
        cost: "$$$",
        completed: false,
      },
      {
        id: "fence-gap",
        title: "Maintain fence-to-house gap",
        description: "5-foot minimum gap between fence and structure",
        priority: "important",
        cost: "$",
        completed: false,
      },
      {
        id: "deck-clearance",
        title: "Clear under-deck space",
        description: "Remove combustible storage and vegetation under decks",
        priority: "critical",
        cost: "$",
        completed: false,
      },
      {
        id: "railing-materials",
        title: "Upgrade deck railings",
        description: "Metal or composite railings instead of wood",
        priority: "nice-to-have",
        cost: "$$",
        completed: false,
      },
    ],
  },
  {
    id: "under-structure",
    title: "Under-structure",
    icon: "🏗️",
    description: "Enclosed and protected foundation areas",
    items: [
      {
        id: "crawl-space-enclosure",
        title: "Enclose crawl spaces",
        description: "Install proper foundation skirting or walls",
        priority: "important",
        cost: "$$",
        completed: false,
      },
      {
        id: "foundation-vents",
        title: "Screen foundation vents",
        description: "1/8\" mesh screening on all foundation ventilation",
        priority: "critical",
        cost: "$",
        completed: false,
      },
      {
        id: "under-house-clearance",
        title: "Clear combustibles from under house",
        description: "Remove storage, debris, and vegetation from foundation area",
        priority: "critical",
        cost: "$",
        completed: false,
      },
    ],
  },
  {
    id: "ember-entry",
    title: "Ember Entry Points",
    icon: "✨",
    description: "Seal all potential ember entry points",
    items: [
      {
        id: "pipe-penetrations",
        title: "Seal all pipe penetrations",
        description: "Caulk around gas, water, and electrical penetrations",
        priority: "important",
        cost: "$",
        completed: false,
      },
      {
        id: "electrical-boxes",
        title: "Seal outdoor electrical boxes",
        description: "Weather-resistant gaskets and covers on all outdoor electrical",
        priority: "important",
        cost: "$",
        completed: false,
      },
      {
        id: "hvac-penetrations",
        title: "Seal HVAC penetrations",
        description: "Close gaps around air conditioning and heating unit connections",
        priority: "important",
        cost: "$",
        completed: false,
      },
      {
        id: "utility-gaps",
        title: "Inspect and seal utility gaps",
        description: "Check for and seal any gaps where utilities enter structure",
        priority: "critical",
        cost: "$",
        completed: false,
      },
    ],
  },
];

export default function HardeningPage() {
  const [categories, setCategories] = useState<HardeningCategoryData[]>([]);

  // Load saved state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("lwf-hardening-checklist");
    if (saved) {
      try {
        const savedData = JSON.parse(saved) as HardeningCategoryData[];
        setCategories(savedData);
      } catch {
        // If parsing fails, use default data
        setCategories(HARDENING_CATEGORIES);
      }
    } else {
      setCategories(HARDENING_CATEGORIES);
    }
  }, []);

  // Save to localStorage whenever categories change
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem("lwf-hardening-checklist", JSON.stringify(categories));
    }
  }, [categories]);

  const updateItemCompletion = (categoryId: string, itemId: string, completed: boolean) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map(item =>
                item.id === itemId ? { ...item, completed } : item
              ),
            }
          : cat
      )
    );
  };

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const completedItems = categories.reduce(
    (sum, cat) => sum + cat.items.filter(item => item.completed).length,
    0
  );

  const resetChecklist = () => {
    if (confirm("This will reset your entire checklist. Are you sure?")) {
      setCategories(HARDENING_CATEGORIES);
      localStorage.removeItem("lwf-hardening-checklist");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center justify-center rounded-lg p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Home Hardening Checklist
                </h1>
                <p className="text-sm text-gray-500">
                  Structural fire-hardening beyond landscaping
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetChecklist}
                className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Reset
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg">
                <Download className="h-4 w-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Summary Card - Left Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <HardeningSummary
                totalItems={totalItems}
                completedItems={completedItems}
                categories={categories}
              />
            </div>
          </div>

          {/* Checklist - Right Column */}
          <div className="lg:col-span-2">
            <HardeningChecklist
              categories={categories}
              onUpdateItem={updateItemCompletion}
            />
          </div>
        </div>
      </div>

      {/* Mobile navigation hint */}
      <div className="fixed bottom-4 left-4 right-4 lg:hidden">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
          <div className="flex items-center gap-2 text-amber-800">
            <Shield className="h-4 w-4" />
            <p className="text-sm font-medium">
              {completedItems} of {totalItems} items completed
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}