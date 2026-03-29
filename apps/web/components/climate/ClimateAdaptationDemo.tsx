"use client";

import { useState, useEffect } from "react";
import { 
  Globe,
  TrendingUp,
  Thermometer,
  Droplets,
  AlertTriangle,
  Target,
  Calendar,
  RefreshCw
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClimateAdaptationCard } from "./ClimateAdaptationCard";

interface DemoPlant {
  id: string;
  name: string;
  commonName: string;
  category: string;
  expectedRisk: 'low' | 'medium' | 'high' | 'critical';
}

const DEMO_PLANTS: DemoPlant[] = [
  {
    id: 'plant-lavandula-angustifolia',
    name: 'Lavandula angustifolia',
    commonName: 'English Lavender', 
    category: 'Drought-tolerant',
    expectedRisk: 'low'
  },
  {
    id: 'plant-acer-circinatum',
    name: 'Acer circinatum',
    commonName: 'Vine Maple',
    category: 'Native tree',
    expectedRisk: 'medium'
  },
  {
    id: 'plant-rhododendron-macrophyllum',
    name: 'Rhododendron macrophyllum',
    commonName: 'Pacific Rhododendron',
    category: 'Native shrub',
    expectedRisk: 'high'
  },
  {
    id: 'plant-athyrium-filix-femina',
    name: 'Athyrium filix-femina',
    commonName: 'Lady Fern',
    category: 'Shade perennial',
    expectedRisk: 'critical'
  },
  {
    id: 'plant-ceanothus-integerrimus',
    name: 'Ceanothus integerrimus',
    commonName: 'Deer Brush',
    category: 'Native shrub',
    expectedRisk: 'low'
  },
  {
    id: 'plant-arctostaphylos-uva-ursi',
    name: 'Arctostaphylos uva-ursi',
    commonName: 'Kinnikinnick',
    category: 'Native groundcover',
    expectedRisk: 'medium'
  }
];

const CLIMATE_SCENARIOS = [
  {
    value: 'optimistic',
    label: 'Optimistic (Low emissions)',
    description: 'Strong climate action, limited warming'
  },
  {
    value: 'moderate',
    label: 'Moderate (Current trajectory)',
    description: 'Some climate action, moderate warming'
  },
  {
    value: 'pessimistic',
    label: 'Pessimistic (High emissions)',
    description: 'Limited climate action, significant warming'
  }
];

export function ClimateAdaptationDemo() {
  const [selectedScenario, setSelectedScenario] = useState<'optimistic' | 'moderate' | 'pessimistic'>('moderate');
  const [climateInfo, setClimateInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClimateInfo();
  }, [selectedScenario]);

  const loadClimateInfo = async () => {
    try {
      const response = await fetch(`/api/climate/adaptation?region=pacific-northwest&scenario=${selectedScenario}`);
      if (response.ok) {
        const data = await response.json();
        setClimateInfo(data);
      }
    } catch (error) {
      console.error('Failed to load climate info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlternativeSelect = (plantId: string, name: string) => {
    console.log(`Selected alternative plant: ${name} (${plantId})`);
    // In a real app, this would navigate to the plant details or add to plan
  };

  return (
    <div className="space-y-6">
      {/* Climate scenario selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Climate Projection Scenario
          </CardTitle>
          <CardDescription>
            Choose a climate scenario to see how plant resilience changes with different futures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select 
              value={selectedScenario} 
              onValueChange={(value: 'optimistic' | 'moderate' | 'pessimistic') => setSelectedScenario(value)}
            >
              <SelectTrigger className="w-80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLIMATE_SCENARIOS.map(scenario => (
                  <SelectItem key={scenario.value} value={scenario.value}>
                    <div>
                      <div className="font-medium">{scenario.label}</div>
                      <div className="text-xs text-neutral-600">{scenario.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={loadClimateInfo}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Regional climate summary */}
      {climateInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pacific Northwest Climate Outlook</CardTitle>
            <CardDescription>
              Expected changes under {selectedScenario} scenario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* General trends */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Expected Climate Changes
              </h4>
              <ul className="space-y-1 text-sm text-neutral-600">
                {climateInfo.generalTrends.map((trend: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 mt-0.5 text-orange-500 flex-shrink-0" />
                    {trend}
                  </li>
                ))}
              </ul>
            </div>

            {/* Adaptation priorities */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Landscape Adaptation Priorities
              </h4>
              <ul className="space-y-1 text-sm text-neutral-600">
                {climateInfo.adaptationPriorities.map((priority: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Target className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                    {priority}
                  </li>
                ))}
              </ul>
            </div>

            {/* Timeframes */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Planning Timeframes
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(climateInfo.timeframes).map(([timeframe, description]) => (
                  <div key={timeframe} className="p-3 border rounded-lg text-sm">
                    <div className="font-medium">{timeframe}</div>
                    <div className="text-neutral-600 text-xs mt-1">{description as string}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plant assessments */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Plant Climate Resilience Assessment</h2>
        <p className="text-neutral-600 mb-6 text-sm">
          See how different plant species will adapt to changing conditions in your region.
          Risk levels and recommendations update based on the selected climate scenario.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {DEMO_PLANTS.map(plant => (
            <ClimateAdaptationCard
              key={plant.id}
              plantId={plant.id}
              plantName={plant.commonName}
              scenario={selectedScenario}
              onAlternativeSelect={handleAlternativeSelect}
            />
          ))}
        </div>
      </div>

      {/* Demo info */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">🌡️ Climate Adaptation Features</h3>
          <ul className="text-sm text-neutral-600 space-y-1">
            <li>✓ Current and projected climate stress analysis</li>
            <li>✓ Three climate scenarios (optimistic, moderate, pessimistic)</li>
            <li>✓ Species-specific adaptation recommendations</li>
            <li>✓ Alternative climate-adapted species suggestions</li>
            <li>✓ Regional climate outlook and planning guidance</li>
            <li>✓ Integration with fire safety and plant selection tools</li>
            <li>✓ Long-term landscape resilience planning (5, 10, 20-year horizons)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}