"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import type { GeocodingResult } from "@/lib/geo/mapbox";

interface LazyZoneMapHeroProps {
  onAddressSelect?: (result: GeocodingResult) => void;
  showMiniPreview?: boolean;
  previewAddress?: string;
  className?: string;
}

export function LazyZoneMapHero(props: LazyZoneMapHeroProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [ZoneMapHero, setZoneMapHero] = useState<React.ComponentType<LazyZoneMapHeroProps> | null>(null);

  // Intersection observer to trigger loading when component is near viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px", // Start loading 200px before component comes into view
        threshold: 0,
      }
    );

    const element = document.getElementById("zone-map-hero-trigger");
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  // Dynamically import the ZoneMapHero component when needed
  useEffect(() => {
    if (isIntersecting && !ZoneMapHero) {
      import("./ZoneMapHero").then((module) => {
        setZoneMapHero(() => module.ZoneMapHero);
      });
    }
  }, [isIntersecting, ZoneMapHero]);

  return (
    <div id="zone-map-hero-trigger" className={props.className}>
      {ZoneMapHero ? (
        <ZoneMapHero {...props} />
      ) : (
        // Loading placeholder with same dimensions
        <div className="relative bg-gradient-to-br from-green-100 via-emerald-50 to-green-100 rounded-xl overflow-hidden">
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-green-600 mx-auto mb-3 animate-pulse" />
              <p className="text-green-700 font-medium">Loading interactive map...</p>
              <p className="text-green-600 text-sm mt-1">Preparing your fire zone visualization</p>
            </div>
          </div>
          
          {/* Mimic the content layout */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
            <div className="max-w-md">
              <div className="h-8 bg-white/20 rounded mb-3 animate-pulse"></div>
              <div className="h-4 bg-white/15 rounded mb-4 animate-pulse max-w-xs"></div>
              <div className="h-12 bg-white/25 rounded mb-4 animate-pulse"></div>
              <div className="h-3 bg-white/10 rounded animate-pulse max-w-48"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}