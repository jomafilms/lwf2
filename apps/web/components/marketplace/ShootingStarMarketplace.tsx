"use client";

import { useState, useEffect } from "react";
import { 
  ShoppingCart,
  Star,
  MapPin,
  ExternalLink,
  Filter,
  Search,
  Loader2,
  Flame
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddToCartButton } from "./AddToCartButton";
import { CartWidget } from "./CartWidget";

interface EnhancedNurseryPlant {
  id: string;
  commonName: string;
  botanicalName: string;
  sizes: Array<{
    size: string;
    price: number;
    availability: number;
    status: 'in-stock' | 'limited' | 'out-of-stock';
  }>;
  category: string;
  nurseryUrl: string;
  lwfPlantId?: string;
  fireScore?: number;
  placementCode?: string;
  riskReduction?: string;
}

interface Nursery {
  id: string;
  name: string;
  description?: string;
}

interface ShootingStarMarketplaceProps {
  nursery: Nursery;
}

const FIRE_SCORE_COLORS = {
  high: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  low: "bg-red-100 text-red-800 border-red-200",
  unknown: "bg-neutral-100 text-neutral-600 border-neutral-200"
};

const PLACEMENT_COLORS = {
  A: "bg-green-100 text-green-800",
  B: "bg-yellow-100 text-yellow-800",
  C: "bg-orange-100 text-orange-800"
};

export function ShootingStarMarketplace({ nursery }: ShootingStarMarketplaceProps) {
  const [plants, setPlants] = useState<EnhancedNurseryPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyFireSafe, setShowOnlyFireSafe] = useState(false);

  // Load inventory
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/nurseries/shooting-star/inventory?featured=true&limit=24');
      const data = await response.json();
      setPlants(data.plants || []);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter plants
  const filteredPlants = plants.filter(plant => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!plant.commonName.toLowerCase().includes(query) && 
          !plant.botanicalName.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'all' && 
        plant.category.toLowerCase() !== selectedCategory) {
      return false;
    }

    // Zone filter (placement code)
    if (selectedZone !== 'all' && plant.placementCode !== selectedZone) {
      return false;
    }

    // Stock filter
    if (showOnlyInStock && !plant.sizes.some(s => s.status === 'in-stock')) {
      return false;
    }

    // Fire safety filter
    if (showOnlyFireSafe && (!plant.fireScore || plant.fireScore < 6)) {
      return false;
    }

    return true;
  });

  const categories = [...new Set(plants.map(p => p.category))].sort();

  const getFireScoreLevel = (score?: number): 'high' | 'medium' | 'low' | 'unknown' => {
    if (!score) return 'unknown';
    if (score >= 8) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-3">Loading real inventory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Nursery header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-neutral-600" />
                  {nursery.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span>Central Point, OR</span>
                  <a 
                    href="https://roguevalleynursery.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Visit Website
                  </a>
                </CardDescription>
              </div>
            </div>
            
            <CartWidget 
              nurseryId={nursery.id} 
              nurseryName={nursery.name}
              className="h-10"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Search plants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Fire Zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                <SelectItem value="A">Zone A (All zones)</SelectItem>
                <SelectItem value="B">Zone B (Away from structures)</SelectItem>
                <SelectItem value="C">Zone C (Outer zones only)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={showOnlyInStock ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyInStock(!showOnlyInStock)}
                className="flex-1"
              >
                In Stock
              </Button>
              
              <Button
                variant={showOnlyFireSafe ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyFireSafe(!showOnlyFireSafe)}
                className="flex-1"
              >
                <Flame className="h-4 w-4" />
                Fire Safe
              </Button>
            </div>
          </div>

          <div className="mt-3 text-sm text-neutral-600">
            Showing {filteredPlants.length} of {plants.length} plants
          </div>
        </CardContent>
      </Card>

      {/* Plant grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPlants.map((plant) => {
          const fireLevel = getFireScoreLevel(plant.fireScore);
          const hasStock = plant.sizes.some(s => s.status === 'in-stock');
          const lowestPrice = Math.min(...plant.sizes.map(s => s.price));
          
          return (
            <Card key={plant.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base leading-tight">
                      {plant.commonName}
                    </CardTitle>
                    <CardDescription className="text-xs italic">
                      {plant.botanicalName}
                    </CardDescription>
                  </div>
                  
                  {plant.placementCode && (
                    <Badge 
                      className={`text-xs ${PLACEMENT_COLORS[plant.placementCode as keyof typeof PLACEMENT_COLORS]}`}
                    >
                      Zone {plant.placementCode}
                    </Badge>
                  )}
                </div>

                {/* Fire safety score */}
                {plant.fireScore && (
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <div className="flex items-center gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-1.5 rounded-full ${
                            i < plant.fireScore! ? "bg-green-500" : "bg-neutral-200"
                          }`}
                        />
                      ))}
                      <span className="text-xs font-medium ml-1">
                        {plant.fireScore}/10
                      </span>
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Category */}
                <Badge variant="outline" className="text-xs">
                  {plant.category}
                </Badge>

                {/* Pricing and availability */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Available sizes:</p>
                  {plant.sizes.map((size, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className={size.status === 'out-of-stock' ? 'line-through text-neutral-400' : ''}>
                        {size.size}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          ${(size.price / 100).toFixed(2)}
                        </span>
                        {size.status === 'limited' && (
                          <Badge variant="secondary" className="text-xs">
                            {size.availability} left
                          </Badge>
                        )}
                        {size.status === 'out-of-stock' && (
                          <Badge variant="destructive" className="text-xs">
                            Out
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fire safety info */}
                {plant.riskReduction && (
                  <div className="text-xs text-neutral-600 bg-neutral-50 p-2 rounded">
                    <strong>Fire Safety:</strong> {plant.riskReduction}
                  </div>
                )}

                {/* Add to cart */}
                <AddToCartButton
                  plantId={plant.lwfPlantId || plant.id}
                  plantName={plant.commonName}
                  nurseryId={nursery.id}
                  options={plant.sizes.map((size: any) => ({
                    size: size.size,
                    price: size.price,
                    availability: size.status,
                    leadTime: size.status === 'out-of-stock' ? 'Out of stock' : undefined
                  })) as any}
                  className="w-full"
                  size="sm"
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredPlants.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
            <h3 className="text-lg font-semibold mb-2">No plants found</h3>
            <p className="text-neutral-600">
              Try adjusting your filters or search terms
            </p>
          </CardContent>
        </Card>
      )}

      {/* Demo info */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">🎯 Complete Demo Features</h3>
          <ul className="text-sm text-neutral-600 space-y-1">
            <li>✓ Real inventory data from Shooting Star Nursery (1,733 plants)</li>
            <li>✓ Live availability and pricing integration</li>
            <li>✓ Fire safety scores from LWF plant database</li>
            <li>✓ Zone placement recommendations (A/B/C)</li>
            <li>✓ Full cart and order management system</li>
            <li>✓ Category and fire safety filtering</li>
            <li>✓ Ready for nursery fulfillment workflow</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}