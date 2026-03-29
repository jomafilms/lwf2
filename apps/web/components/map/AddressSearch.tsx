"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { geocodeAddress, type GeocodingResult } from "@/lib/geo/mapbox";

interface AddressSearchProps {
  onSelect: (result: GeocodingResult) => void;
  className?: string;
  compact?: boolean;
}

export function AddressSearch({
  onSelect,
  className = "",
  compact = false,
}: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await geocodeAddress(query);
      setResults(res);
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handleSelect = (result: GeocodingResult) => {
    setQuery("");
    setShowResults(false);
    setResults([]);
    onSelect(result);
  };

  const inputClasses = compact
    ? "w-full rounded-md border border-neutral-200 py-1.5 pl-8 pr-3 text-sm focus:border-neutral-400 focus:outline-none"
    : "w-full rounded-lg border border-neutral-300 py-3 pl-10 pr-4 text-lg focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500";

  const iconClasses = compact
    ? "absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
    : "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400";

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={compact ? "Search address..." : "Enter your address..."}
            className={inputClasses}
          />
          <Search className={iconClasses} />
        </div>
        {!compact && (
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="rounded-lg bg-neutral-900 px-6 py-3 text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {isSearching ? "..." : "Go"}
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-neutral-200 bg-white shadow-lg">
          {results.map((result, i) => (
            <button
              key={i}
              onClick={() => handleSelect(result)}
              className="block w-full border-b border-neutral-100 px-3 py-2.5 text-left text-sm hover:bg-neutral-50 last:border-b-0"
            >
              {result.address}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
