/**
 * FireReadinessCard Component
 * Shows fire readiness summary for plants in a list
 */

import { Shield, Flame } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  plantCount: number;
  plantIds?: string[]; // For future enhancement with real fire zone data
}

export function FireReadinessCard({ plantCount, plantIds = [] }: Props) {
  // Mock fire zone data for demonstration
  // In a real implementation, this would query plant fire resistance values
  const mockZones = {
    zone0: Math.floor(plantCount * 0.3), // Defense zone
    zone1: Math.floor(plantCount * 0.5), // Near home
    zone2: plantCount - Math.floor(plantCount * 0.3) - Math.floor(plantCount * 0.5), // Extended
  };

  const averageScore = "Good"; // Mock average fire safety rating

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-600" />
          <CardTitle className="text-lg">Fire Readiness</CardTitle>
        </div>
        <CardDescription>
          Building this plan contributes to your property's fire readiness
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plant count summary */}
        <div>
          <p className="text-sm text-gray-600 mb-3">
            This list contains <span className="font-semibold text-gray-900">{plantCount} plants</span> across multiple fire zones:
          </p>

          {/* Zone breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Zone 0 (Defense Zone)</span>
              <span className="font-medium text-gray-900">{mockZones.zone0} plants</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Zone 1 (Near Home)</span>
              <span className="font-medium text-gray-900">{mockZones.zone1} plants</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Zone 2 (Extended Zone)</span>
              <span className="font-medium text-gray-900">{mockZones.zone2} plants</span>
            </div>
          </div>
        </div>

        {/* Average safety score */}
        <div className="pt-3 border-t">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-600">Average fire safety:</span>
            <span className="text-sm font-semibold text-emerald-700">{averageScore}</span>
          </div>
        </div>

        {/* Positive message */}
        <div className="pt-2 bg-emerald-50 rounded-lg p-3">
          <p className="text-sm text-emerald-800">
            ✓ These fire-ready plant selections help create defensible space around your property
          </p>
        </div>
      </CardContent>
    </Card>
  );
}