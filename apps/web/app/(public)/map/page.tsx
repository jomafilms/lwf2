"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AddressSearch } from "@/components/map/AddressSearch";
import {
  PropertyMap,
  type SavedPropertyData,
} from "@/components/map/PropertyMap";
import { ChatPanel } from "@/components/agent/ChatPanel";
import { useSession } from "@/lib/auth-client";
import {
  ArrowLeft,
  MessageSquare,
  X,
  ChevronDown,
  Save,
  Check,
  Loader2,
} from "lucide-react";
import type { GeocodingResult } from "@/lib/geo/mapbox";
import type { FireZones } from "@/lib/geo/fire-zones";

type Step = "view" | "draw" | "zones";

interface ZoneData {
  structureCoords: [number, number][];
  fireZones: FireZones;
}

export default function MapPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [location, setLocation] = useState<GeocodingResult | null>(null);
  const [step, setStep] = useState<Step>("view");
  const [chatOpen, setChatOpen] = useState(false);
  const [zoneData, setZoneData] = useState<ZoneData | null>(null);
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [savedData, setSavedData] = useState<SavedPropertyData | null>(null);

  // Load saved property from URL param
  useEffect(() => {
    const propertyId = searchParams.get("property");
    if (propertyId) {
      setSavedPropertyId(propertyId);
      setSaveState("saved");
      fetch(`/api/properties/${propertyId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load property");
          return res.json();
        })
        .then((property) => {
          setLocation({
            lat: property.lat,
            lng: property.lng,
            address: property.address,
          });
          if (property.structureFootprints && property.fireZones) {
            setSavedData({
              structureFootprints: property.structureFootprints,
              fireZones: property.fireZones,
            });
            setStep("zones");
          }
        })
        .catch(() => {
          // Property not found or not authorized — just show address search
          setSavedPropertyId(null);
          setSaveState("idle");
        });
    }
  }, [searchParams]);

  // Load from lat/lng params
  useEffect(() => {
    if (searchParams.get("property")) return; // skip if loading from property
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
    setSavedPropertyId(null);
    setSaveState("idle");
    setZoneData(null);
    setSavedData(null);
  };

  const handleZonesCalculated = useCallback((data: ZoneData) => {
    setZoneData(data);
    setSaveState("idle");
    setSavedPropertyId(null);
  }, []);

  const handleSave = async () => {
    if (!location || !zoneData) return;

    if (!session?.user) {
      // Redirect to sign-in with return URL
      const returnUrl = `/map?lat=${location.lat}&lng=${location.lng}&address=${encodeURIComponent(location.address)}`;
      router.push(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setSaveState("saving");

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: location.address,
          lat: location.lat,
          lng: location.lng,
          structureFootprints: zoneData.structureCoords,
          fireZones: zoneData.fireZones,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      const property = await res.json();
      setSavedPropertyId(property.id);
      setSaveState("saved");

      // Update URL without full navigation
      const url = new URL(window.location.href);
      url.searchParams.set("property", property.id);
      url.searchParams.delete("lat");
      url.searchParams.delete("lng");
      url.searchParams.delete("address");
      window.history.replaceState({}, "", url.toString());
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
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
    <div className="flex h-[100dvh] flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b bg-white px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
        <button
          onClick={() => {
            setLocation(null);
            setStep("view");
            setChatOpen(false);
            setZoneData(null);
            setSavedPropertyId(null);
            setSaveState("idle");
            setSavedData(null);
          }}
          className="rounded p-1.5 hover:bg-neutral-100"
          title="Back to search"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium sm:text-sm">
            {location.address}
          </p>
        </div>

        {/* Step indicator — desktop only */}
        <div className="hidden items-center gap-1 md:flex">
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
                {s === "view"
                  ? "Property"
                  : s === "draw"
                    ? "Structure"
                    : "Zones"}
              </div>
            </div>
          ))}
        </div>

        {/* Save button — appears after zones */}
        {step === "zones" && (zoneData || savedPropertyId) && (
          <button
            onClick={handleSave}
            disabled={saveState === "saving" || saveState === "saved"}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
              saveState === "saved"
                ? "bg-green-100 text-green-800"
                : saveState === "saving"
                  ? "bg-neutral-100 text-neutral-500"
                  : saveState === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            {saveState === "saving" && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            {saveState === "saved" && <Check className="h-3.5 w-3.5" />}
            {saveState === "idle" && <Save className="h-3.5 w-3.5" />}
            {saveState === "error" && <Save className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">
              {saveState === "saving"
                ? "Saving…"
                : saveState === "saved"
                  ? "Saved ✓"
                  : saveState === "error"
                    ? "Error — retry"
                    : "Save Property"}
            </span>
          </button>
        )}

        {/* Chat toggle */}
        {step === "zones" && (
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
              chatOpen
                ? "bg-neutral-100 text-neutral-900"
                : "bg-neutral-900 text-white hover:bg-neutral-800"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {chatOpen ? "Hide chat" : "Plant advisor"}
            </span>
          </button>
        )}
      </div>

      {/* Main — map + chat */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Map fills available space */}
        <div className="flex-1">
          <PropertyMap
            center={{ lat: location.lat, lng: location.lng }}
            onDrawStart={() => setStep("draw")}
            onStructureDrawn={() => setStep("zones")}
            onZonesCalculated={handleZonesCalculated}
            savedData={savedData}
          />
        </div>

        {/* Guided prompt */}
        {step === "view" && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 sm:bottom-8">
            <div className="rounded-xl bg-white px-4 py-2.5 shadow-lg sm:px-5 sm:py-3">
              <p className="text-xs font-medium text-neutral-700 sm:text-sm">
                Find your property, then draw your building
              </p>
            </div>
          </div>
        )}

        {/* Desktop chat — side panel */}
        {chatOpen && (
          <div className="hidden w-[380px] flex-col border-l bg-white md:flex">
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

        {/* Mobile chat — bottom sheet */}
        {chatOpen && (
          <div className="absolute inset-x-0 bottom-0 flex max-h-[70dvh] flex-col rounded-t-2xl border-t bg-white shadow-2xl md:hidden">
            <div className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="mx-auto h-1 w-8 rounded-full bg-neutral-300" />
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="rounded p-1 hover:bg-neutral-100"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <ChatPanel className="flex-1 overflow-hidden" />
          </div>
        )}
      </div>
    </div>
  );
}

function stepIndex(step: Step): number {
  return step === "view" ? 0 : step === "draw" ? 1 : 2;
}
