"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Package } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "./AddToCartButton";
import { CartWidget } from "./CartWidget";

interface Nursery {
  id: string;
  name: string;
  description?: string;
}

interface DemoPlant {
  id: string;
  genus: string;
  species: string;
  commonName: string;
  fireScore: number;
  placementCode: string;
  options: Array<{
    size: string;
    price: number;
    availability: 'in-stock' | 'order-on-demand' | 'out-of-stock';
  }>;
}

interface MarketplaceDemoProps {
  nursery: Nursery;
}

// Demo plants with pricing (simulating nursery inventory integration)
const DEMO_PLANTS: DemoPlant[] = [
  {
    id: "plant-001",
    genus: "Ceanothus",
    species: "integerrimus",
    commonName: "Deer Brush",
    fireScore: 8,
    placementCode: "A",
    options: [
      { size: "4-inch pot", price: 1299, availability: 'in-stock' },
      { size: "1-gallon", price: 1899, availability: 'in-stock' },
      { size: "5-gallon", price: 4999, availability: 'order-on-demand' }
    ]
  },
  {
    id: "plant-002", 
    genus: "Lavandula",
    species: "angustifolia",
    commonName: "English Lavender",
    fireScore: 9,
    placementCode: "A",
    options: [
      { size: "4-inch pot", price: 899, availability: 'in-stock' },
      { size: "1-gallon", price: 1499, availability: 'in-stock' }
    ]
  },
  {
    id: "plant-003",
    genus: "Arctostaphylos",
    species: "uva-ursi",
    commonName: "Kinnikinnick",
    fireScore: 7,
    placementCode: "B",
    options: [
      { size: "4-inch pot", price: 1599, availability: 'in-stock' },
      { size: "1-gallon", price: 2299, availability: 'out-of-stock' }
    ]
  },
  {
    id: "plant-004",
    genus: "Achillea",
    species: "millefolium", 
    commonName: "Common Yarrow",
    fireScore: 6,
    placementCode: "A",
    options: [
      { size: "4-inch pot", price: 699, availability: 'in-stock' },
      { size: "1-gallon", price: 1299, availability: 'in-stock' }
    ]
  },
  {
    id: "plant-005",
    genus: "Salvia",
    species: "officinalis",
    commonName: "Common Sage",
    fireScore: 8,
    placementCode: "A", 
    options: [
      { size: "4-inch pot", price: 799, availability: 'in-stock' }
    ]
  }
];

const PLACEMENT_COLORS = {
  A: "bg-green-100 text-green-800",
  B: "bg-yellow-100 text-yellow-800", 
  C: "bg-orange-100 text-orange-800"
};

export function MarketplaceDemo({ nursery }: MarketplaceDemoProps) {
  const [selectedZone, setSelectedZone] = useState<string>("Zone 0");

  return (
    <div className="space-y-6">
      {/* Nursery info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {nursery.name}
            </div>
            <CartWidget nurseryId={nursery.id} nurseryName={nursery.name} />
          </CardTitle>
          <CardDescription>
            Fire-resistant plants available for immediate purchase
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Zone selector */}
      <div className="flex gap-2">
        <span className="text-sm font-medium py-2">Shopping for:</span>
        {["Zone 0", "Zone 1", "Zone 2"].map((zone) => (
          <button
            key={zone}
            onClick={() => setSelectedZone(zone)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedZone === zone
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {zone}
          </button>
        ))}
      </div>

      {/* Plant grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_PLANTS.map((plant) => (
          <Card key={plant.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">
                    {plant.commonName}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    <em>{plant.genus} {plant.species}</em>
                  </CardDescription>
                </div>
                <Badge 
                  className={PLACEMENT_COLORS[plant.placementCode as keyof typeof PLACEMENT_COLORS]}
                >
                  Zone {plant.placementCode}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Fire safety score */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">Fire Safety:</span>
                <div className="flex items-center gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full ${
                        i < plant.fireScore ? "bg-green-500" : "bg-neutral-200"
                      }`}
                    />
                  ))}
                  <span className="text-sm font-medium ml-1">
                    {plant.fireScore}/10
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-1">
                <p className="text-sm font-medium">Available sizes:</p>
                {plant.options.map((option, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className={option.availability === 'out-of-stock' ? 'line-through text-neutral-400' : ''}>
                      {option.size}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        ${(option.price / 100).toFixed(2)}
                      </span>
                      {option.availability === 'order-on-demand' && (
                        <Badge variant="secondary" className="text-xs">
                          Special Order
                        </Badge>
                      )}
                      {option.availability === 'out-of-stock' && (
                        <Badge variant="destructive" className="text-xs">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add to cart */}
              <AddToCartButton
                plantId={plant.id}
                plantName={plant.commonName}
                nurseryId={nursery.id}
                options={plant.options}
                zone={selectedZone}
                className="w-full"
                size="sm"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">How the Demo Works</h3>
          <ul className="text-sm text-neutral-600 space-y-1">
            <li>• Add plants to your cart using the buttons above</li>
            <li>• View cart contents using the cart widget in the top-right</li>
            <li>• Submit orders directly to the nursery for fulfillment</li>
            <li>• Orders appear in the nursery dashboard for processing</li>
            <li>• Real implementation would integrate with nursery inventory systems</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}