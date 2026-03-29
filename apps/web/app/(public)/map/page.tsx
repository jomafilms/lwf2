"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AddressSearch } from "@/components/map/AddressSearch";
import { PropertyMap } from "@/components/map/PropertyMap";
import { ChatPanel } from "@/components/agent/ChatPanel";
import { ArrowLeft, MessageSquare, X, Pencil } from "lucide-react";
import type { GeocodingResult } from "@/lib/geo/mapbox";

type Step = "view" | "draw" | "zones";

export default function MapPage() {
  const searchParams = useSearchParams();
  const [location, setLocation] = useState<GeocodingResult | null>(null);
  const [step, setStep] = useState<Step>("view");
  const [chatOpen, setChatOpen] = useState(false);

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
    setStep("view");
    setChatOpen(false);
  };

  const handleStructureDrawn = () => {
    setStep("zones");
  };

  // No location yet — show search
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
      {/* Header — compact, shows address + step context */}
      <div className="flex items-center gap-3 border-b bg-white px-4 py-2.5">
        <button
          onClick={() => {
            setLocation(null);
            setStep("view");
            setChatOpen(false);
          }}
          className="rounded p-1 hover:bg-neutral-100"
          title="Back to search"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{location.address}</p>
        </div>

        {/* Step indicator */}
        <div className="hidden items-center gap-1 sm:flex">
          {(["view", "draw", "zones"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center">
              {i > 0 && (
                <div
                  className={`mx-1 h-px w-4 ${
                    stepIndex(step) >= i ? "bg-neutral-400" : "bg-neutral-200"
                  }`}
                />
              )}
              <div
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  step === s
                    ? "bg-neutral-900 text-white"
                    : stepIndex(step) > i
                      ? "bg-neutral-200 text-neutral-600"
                      : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {s === "view" ? "Property" : s === "draw" ? "Structure" : "Zones"}
              </div>
            </div>
          ))}
        </div>

        {/* Chat toggle in header */}
        {step === "zones" && (
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              chatOpen
                ? "bg-neutral-100 text-neutral-900"
                : "bg-neutral-900 text-white hover:bg-neutral-800"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {chatOpen ? "Hide chat" : "Plant advisor"}
          </button>
        )}
      </div>

      {/* Main content — map + optional chat */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1">
          <PropertyMap
            center={{ lat: location.lat, lng: location.lng }}
            onDrawStart={() => setStep("draw")}
            onStructureDrawn={handleStructureDrawn}
          />
        </div>

        {/* Guided prompt — appears when user hasn't drawn yet */}
        {step === "view" && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="rounded-xl bg-white px-5 py-3 shadow-lg">
              <p className="text-sm font-medium text-neutral-700">
                Step 1: Find your property on the satellite view
              </p>
              <p className="mt-0.5 text-xs text-neutral-400">
                Then click "Draw Structure" below to outline your building
              </p>
            </div>
          </div>
        )}

        {/* Chat panel — slides in from right */}
        {chatOpen && (
          <div className="flex w-[380px] flex-col border-l bg-white">
            <div className="flex items-center justify-between border-b px-4 py-2.5">
              <div>
                <p className="text-sm font-medium">Plant Advisor</p>
                <p className="text-xs text-neutral-400">
                  Ask about plants for your zones
                </p>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="rounded p-1 hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ChatPanel className="flex-1" />
          </div>
        )}
      </div>
    </div>
  );
}

function stepIndex(step: Step): number {
  return step === "view" ? 0 : step === "draw" ? 1 : 2;
}
