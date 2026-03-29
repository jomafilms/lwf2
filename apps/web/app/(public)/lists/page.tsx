"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Filter, Globe, Lock, Building2, Star } from "lucide-react";
import { fetchTags, type Tag } from "@/lib/tags/api";
import { getPlant } from "@/lib/api/lwf";
import { StarButton } from "@/components/lists/StarButton";

interface TagWithCount extends Tag {
  itemCount: number;
  ownerName?: string;
  ownerEmail?: string;
  orgName?: string;
  orgType?: string;
}

interface FeaturedList {
  name: string;
  organization: {
    type: string;
    name: string;
  };
  description: string;
  plants: Array<{
    plantId: string;
    commonName: string;
    botanicalName: string;
    reason: string;
  }>;
}

const VISIBILITY_ICONS = {
  private: Lock,
  public: Globe,
  org: Building2,
};

const VISIBILITY_LABELS = {
  private: "Private",
  public: "Public", 
  org: "Organization",
};

const ORG_TYPE_LABELS: Record<string, string> = {
  hoa: "HOA",
  city: "City",
  nursery: "Nursery",
  community: "Community",
  neighborhood: "Neighborhood",
  firewise: "Fire Safe",
  landscaping_company: "Landscaper",
  other: "Other",
};

export default function PublicListsPage() {
  const [publicLists, setPublicLists] = useState<TagWithCount[]>([]);
  const [featuredLists, setFeaturedLists] = useState<FeaturedList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCreatorType, setSelectedCreatorType] = useState<string>("");
  const [selectedVisibility, setSelectedVisibility] = useState<string>("");

  const loadData = useCallback(async () => {
    try {
      // Load featured lists from seed data
      const featuredRes = await fetch("/api/lists/featured");
      if (featuredRes.ok) {
        const featured = await featuredRes.json();
        setFeaturedLists(featured);
      }

      // For now, we'll need to create a new API endpoint for public lists
      // This is a placeholder - we'll create the API next
      const publicRes = await fetch("/api/lists/public");
      if (publicRes.ok) {
        const lists = await publicRes.json();
        setPublicLists(lists);
      }
    } catch (error) {
      console.error("Failed to load lists:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter lists based on search and filters
  const filteredLists = publicLists.filter((list) => {
    const matchesSearch = list.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVisibility = !selectedVisibility || list.visibility === selectedVisibility;
    const matchesCreatorType = !selectedCreatorType || list.orgType === selectedCreatorType;
    return matchesSearch && matchesVisibility && matchesCreatorType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading lists...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Plant Collections
          </h1>
          <p className="text-sm text-gray-500">
            Curated plant lists from local experts, HOAs, and fire-safe communities
          </p>
        </div>

        {/* Featured Lists */}
        {featuredLists.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-yellow-500" />
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Featured Collections</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredLists.map((list, index) => (
                <Link
                  key={index}
                  href={`/lists/featured/${index}`}
                  className="group bg-white rounded-lg border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded font-medium">
                      {ORG_TYPE_LABELS[list.organization.type] || "Community"}
                    </span>
                    <span className="text-xs text-gray-400">{list.plants.length} plants</span>
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 group-hover:text-orange-600 transition-colors leading-snug mb-1">
                    {list.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{list.description}</p>
                  <p className="text-xs text-gray-400 mt-2">{list.organization.name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Visibility Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedVisibility}
                onChange={(e) => setSelectedVisibility(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white"
              >
                <option value="">All Visibility</option>
                <option value="public">Public</option>
                <option value="org">Organization</option>
              </select>
            </div>

            {/* Creator Type Filter */}
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCreatorType}
                onChange={(e) => setSelectedCreatorType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white"
              >
                <option value="">All Creators</option>
                <option value="homeowner">Homeowner</option>
                <option value="hoa">HOA</option>
                <option value="nursery">Nursery</option>
                <option value="city">City</option>
                <option value="community">Community</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLists.map((list) => {
            const VisibilityIcon = VISIBILITY_ICONS[list.visibility];
            
            return (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {list.color && (
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: list.color }}
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight">
                          {list.name}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        list.visibility === 'public' 
                          ? 'text-green-600 bg-green-50' 
                          : list.visibility === 'org'
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 bg-gray-50'
                      }`}>
                        <VisibilityIcon className="w-3 h-3" />
                        {VISIBILITY_LABELS[list.visibility]}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {list.orgName || list.ownerName || "Unknown creator"}
                      {list.orgType && ` • ${ORG_TYPE_LABELS[list.orgType] || list.orgType}`}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {list.itemCount} plants
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-gray-600 text-sm">
                      Created {new Date(list.createdAt).toLocaleDateString()}
                    </span>
                    <div onClick={(e) => e.preventDefault()}>
                      <StarButton tagId={list.id} className="text-xs" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredLists.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-gray-500">No public lists found</p>
          </div>
        )}
      </div>
    </div>
  );
}