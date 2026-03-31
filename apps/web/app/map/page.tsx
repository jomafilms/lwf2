"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AddressSearch } from "@/components/map/AddressSearch";
import {
  PropertyMap,
  type ParcelBoundary,
  type BuildingZoneData,
} from "@/components/map/PropertyMap";
import { ChatPanelWithHistory } from "@/components/agent/ChatPanelWithHistory";
import { ScoresPanel } from "@/components/scoring/ScoresPanel";
import { AssessmentWizard, AssessmentSummary, type AssessmentData } from "@/components/assessment";
import { useSession } from "@/lib/auth-client";
import { detectBuildingSource } from "@/lib/regional/building-service";
import type { PlanPlant } from "@/lib/scoring";
import {
  ArrowLeft,
  MessageSquare,
  X,
  ChevronDown,
  Save,
  Check,
  Loader2,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import type { GeocodingResult } from "@/lib/geo/mapbox";

export default function MapPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [location, setLocation] = useState<GeocodingResult | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [planId, setPlanId] = useState<string | null>(null);
  const [planPlants, setPlanPlants] = useState<PlanPlant[]>([]);

  // Parcel auto-detection state
  const [parcelBoundary, setParcelBoundary] = useState<ParcelBoundary | null>(null);
  const [parcelLoading, setParcelLoading] = useState(false);

  // Building zones state (replaces manual draw)
  const [buildingZoneData, setBuildingZoneData] = useState<BuildingZoneData | null>(null);
  const [savedBuildingZones, setSavedBuildingZones] = useState<BuildingZoneData | null>(null);

  // Assessment state
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [showAssessmentSummary, setShowAssessmentSummary] = useState(false);

  // Derive building source from location
  const buildingSource = location
    ? detectBuildingSource(location.lat, location.lng)
    : "overpass";

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
          // Load saved building zones if available
          if (property.fireZones?.buildings && property.fireZones?.zones) {
            setSavedBuildingZones(property.fireZones as BuildingZoneData);
          }
          // Fetch plans for this property
          fetch(`/api/properties/${propertyId}/plans`)
            .then((r) => r.ok ? r.json() : [])
            .then((plans: Array<{ id: string }>) => {
              if (plans.length > 0) {
                setPlanId(plans[0].id);
                fetch(`/api/plans/${plans[0].id}`)
                  .then((r) => r.ok ? r.json() : null)
                  .then((plan) => {
                    if (plan?.plantPlacements) {
                      setPlanPlants(plan.plantPlacements as PlanPlant[]);
                    }
                  })
                  .catch(() => {});
              }
            })
            .catch(() => {});
        })
        .catch(() => {
          setSavedPropertyId(null);
          setSaveState("idle");
        });
    }
  }, [searchParams]);

  // Load from lat/lng params
  useEffect(() => {
    if (searchParams.get("property")) return;
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const address = searchParams.get("address");
    if (lat && lng) {
      const loc = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        address: address || `${lat}, ${lng}`,
      };
      setLocation(loc);
      fetchParcelBoundary(parseFloat(lat), parseFloat(lng));
    }
  }, [searchParams]);

  // Fetch parcel boundary from GIS API
  const fetchParcelBoundary = useCallback(async (lat: number, lng: number) => {
    setParcelLoading(true);
    setParcelBoundary(null);
    try {
      const res = await fetch(`/api/parcels?lat=${lat}&lng=${lng}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.found && data.parcel) {
        setParcelBoundary({
          coordinates: data.parcel.boundary,
          address: data.parcel.address,
          acreage: data.parcel.acreage,
          accountNumber: data.parcel.accountNumber,
        });
      }
    } catch {
      // Parcel lookup failed — silently fall back
    } finally {
      setParcelLoading(false);
    }
  }, []);

  const handleAddressSelect = (result: GeocodingResult) => {
    setLocation(result);
    setChatOpen(false);
    setSavedPropertyId(null);
    setSaveState("idle");
    setBuildingZoneData(null);
    setSavedBuildingZones(null);
    setPlanId(null);
    setParcelBoundary(null);

    // Auto-detect parcel boundary
    fetchParcelBoundary(result.lat, result.lng);
  };

  const handleBuildingZonesCalculated = useCallback((data: BuildingZoneData) => {
    setBuildingZoneData(data);
    setSaveState("idle");
  }, []);

  const handleEditBoundary = useCallback(() => {
    setParcelBoundary(null);
    setBuildingZoneData(null);
  }, []);

  const handleSave = async () => {
    if (!location || !buildingZoneData) return;

    if (!session?.user) {
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
          parcelBoundary: parcelBoundary ?? null,
          fireZones: buildingZoneData,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      const property = await res.json();
      setSavedPropertyId(property.id);
      setSaveState("saved");

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

  // Has zones ready (either freshly computed or loaded from saved)
  const hasZones = !!(buildingZoneData || savedBuildingZones);

  if (!location) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <h1 className="mb-2 text-center text-3xl font-bold">
            Map Your Property
          </h1>
          <p className="mb-6 text-center text-neutral-500">
            Enter your address to view satellite imagery and fire-reluctant
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
            setChatOpen(false);
            setBuildingZoneData(null);
            setSavedBuildingZones(null);
            setSavedPropertyId(null);
            setSaveState("idle");
            setParcelBoundary(null);
          }}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg p-2 hover:bg-neutral-100"
          title="Back to search"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium sm:text-sm">
            {location.address}
          </p>
          {parcelLoading && (
            <p className="flex items-center gap-1 text-[10px] text-neutral-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Looking up property boundary…
            </p>
          )}
        </div>

        {/* Save button — appears when zones are computed */}
        {hasZones && (
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
                  ? "Saved"
                  : saveState === "error"
                    ? "Error — retry"
                    : "Save Property"}
            </span>
          </button>
        )}

        {/* Download Plan button */}
        {planId && (
          <a
            href={`/plans/${planId}/document`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors sm:text-sm"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download Plan</span>
          </a>
        )}

        {/* Hardening Checklist button */}
        {hasZones && (
          <Link
            href="/hardening"
            className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 transition-colors sm:text-sm"
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Home Hardening</span>
          </Link>
        )}

        {/* Chat toggle */}
        {hasZones && (
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:text-sm ${
              chatOpen
                ? "bg-neutral-100 text-neutral-900"
                : "bg-neutral-900 text-white hover:bg-neutral-800"
            }`}
          >
            <MessageSquare className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
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
            parcelBoundary={parcelBoundary}
            buildingSource={buildingSource}
            onBuildingZonesCalculated={handleBuildingZonesCalculated}
            onEditBoundary={handleEditBoundary}
            savedBuildingZones={savedBuildingZones}
          />
        </div>

        {/* Guided prompt — waiting for parcel */}
        {!parcelBoundary && !parcelLoading && !hasZones && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 sm:bottom-8">
            <div className="rounded-xl bg-white px-4 py-2.5 shadow-lg sm:px-5 sm:py-3">
              <p className="text-xs font-medium text-neutral-700 sm:text-sm">
                Searching for property data…
              </p>
            </div>
          </div>
        )}

        {/* Scores panel — appears when plan has plants */}
        {planPlants.length > 0 && !chatOpen && (
          <div className="absolute left-4 top-4 w-72 rounded-xl bg-white p-4 shadow-lg">
            <ScoresPanel plants={planPlants} />
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
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded p-1 hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ChatPanelWithHistory
              className="flex-1"
              propertyId={savedPropertyId || undefined}
              showHistory={false}
            />
          </div>
        )}

        {/* Mobile chat — bottom sheet */}
        {chatOpen && (
          <div className="absolute inset-x-0 bottom-0 z-20 flex max-h-[75dvh] flex-col rounded-t-2xl border-t bg-white shadow-2xl animate-slide-up md:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex flex-1 items-center justify-center">
                <div className="h-1 w-10 rounded-full bg-neutral-300" />
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg p-2 hover:bg-neutral-100"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
            <ChatPanelWithHistory
              className="flex-1 overflow-hidden"
              propertyId={savedPropertyId || undefined}
              showHistory={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
