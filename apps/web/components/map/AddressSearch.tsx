"use client";

import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import { geocodeAddress, type GeocodingResult } from "@/lib/geo/mapbox";

interface AddressSearchProps {
  onSelect: (result: GeocodingResult) => void;
  className?: string;
}

export function AddressSearch({ onSelect, className = "" }: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

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
    setQuery(result.address);
    setShowResults(false);
    setResults([]);
    onSelect(result);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter your address..."
            className="w-full rounded-lg border border-neutral-300 py-3 pl-10 pr-4 text-lg focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="rounded-lg bg-neutral-900 px-6 py-3 text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {isSearching ? "..." : "Go"}
        </button>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-neutral-200 bg-white shadow-lg">
          {results.map((result, i) => (
            <button
              key={i}
              onClick={() => handleSelect(result)}
              className="block w-full border-b border-neutral-100 px-4 py-3 text-left text-sm hover:bg-neutral-50 last:border-b-0"
            >
              {result.address}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
