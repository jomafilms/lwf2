"use client";

import { useState, useEffect } from "react";
import { 
  Thermometer,
  Droplets,
  AlertTriangle,
  TrendingUp,
  Leaf,
  ArrowRight,
  Info,
  Calendar,
  Target
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ClimateAdaptation, ClimateStress } from "@/lib/climate/adaptation-service";

interface ClimateAdaptationCardProps {
  plantId: string;
  plantName: string;
  location?: { lat: number; lng: number };
  scenario?: 'optimistic' | 'moderate' | 'pessimistic';
  onAlternativeSelect?: (plantId: string, name: string) => void;
}

const STRESS_ICONS = {
  heat: Thermometer,
  drought: Droplets,
  flooding: Droplets,
  frost: Thermometer,
  wind: TrendingUp,
  soil_change: Leaf
};

const STRESS_COLORS = {
  low: "bg-green-100 text-green-800 border-green-200",
  moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200"
};

const RISK_COLORS = {
  low: "text-green-600",
  medium: "text-yellow-600", 
  high: "text-orange-600",
  critical: "text-red-600"
};

export function ClimateAdaptationCard({
  plantId,
  plantName,
  location = { lat: 42.3, lng: -122.8 }, // Default to Jackson County, OR
  scenario = 'moderate',
  onAlternativeSelect
}: ClimateAdaptationCardProps) {
  const [adaptation, setAdaptation] = useState<ClimateAdaptation | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadAdaptationData();
  }, [plantId, scenario]);

  const loadAdaptationData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/climate/adaptation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantId,
          location,
          scenario
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAdaptation(data);
      }
    } catch (error) {
      console.error('Failed to load climate adaptation data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Climate Adaptation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500">Loading climate assessment...</p>
        </CardContent>
      </Card>
    );
  }

  if (!adaptation) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Climate Adaptation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500">Climate data not available for this plant.</p>
        </CardContent>
      </Card>
    );
  }

  const hasStresses = adaptation.currentStresses.length > 0 || adaptation.projectedStresses.length > 0;

  return (
    <TooltipProvider>
      <Card className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Climate Resilience
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline"
                className={`text-xs ${RISK_COLORS[adaptation.riskLevel]}`}
              >
                {adaptation.riskLevel.charAt(0).toUpperCase() + adaptation.riskLevel.slice(1)} Risk
              </Badge>
              
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-neutral-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Assessment based on {scenario} climate scenario</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <CardDescription>
            Climate adaptation assessment for changing conditions
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quick summary */}
          {!hasStresses ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Target className="h-4 w-4" />
              This plant shows good climate resilience for your region
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-neutral-600">
                {adaptation.currentStresses.length > 0 && 
                  `Currently experiencing ${adaptation.currentStresses.length} stress factor${adaptation.currentStresses.length > 1 ? 's' : ''}`}
                {adaptation.currentStresses.length > 0 && adaptation.projectedStresses.length > 0 && ', '}
                {adaptation.projectedStresses.length > 0 && 
                  `${adaptation.projectedStresses.length} projected future stress${adaptation.projectedStresses.length > 1 ? 'es' : ''}`}
              </p>

              {/* Current stresses preview */}
              {adaptation.currentStresses.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {adaptation.currentStresses.slice(0, 2).map((stress, index) => {
                    const StressIcon = STRESS_ICONS[stress.stressType];
                    return (
                      <Badge 
                        key={index}
                        variant="outline"
                        className={`text-xs ${STRESS_COLORS[stress.severity]}`}
                      >
                        <StressIcon className="h-3 w-3 mr-1" />
                        {stress.stressType}
                      </Badge>
                    );
                  })}
                  {adaptation.currentStresses.length > 2 && (
                    <Badge variant="outline" className="text-xs text-neutral-600">
                      +{adaptation.currentStresses.length - 2} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Expandable details */}
          <Collapsible open={expanded} onOpenChange={setExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between p-0">
                <span className="text-sm">
                  {expanded ? 'Hide details' : 'View detailed assessment'}
                </span>
                <ArrowRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-4 mt-4">
              {/* Current stresses */}
              {adaptation.currentStresses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Current Climate Stresses</h4>
                  <div className="space-y-2">
                    {adaptation.currentStresses.map((stress, index) => (
                      <ClimateStressItem key={index} stress={stress} />
                    ))}
                  </div>
                </div>
              )}

              {/* Projected stresses */}
              {adaptation.projectedStresses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Projected Future Stresses</h4>
                  <div className="space-y-2">
                    {adaptation.projectedStresses.map((stress, index) => (
                      <ClimateStressItem key={index} stress={stress} />
                    ))}
                  </div>
                </div>
              )}

              {/* Adaptation recommendations */}
              {adaptation.adaptationRecommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Adaptation Strategies</h4>
                  <ul className="space-y-1 text-sm text-neutral-600">
                    {adaptation.adaptationRecommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alternative species */}
              {adaptation.alternativeSpecies.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Climate-Adapted Alternatives</h4>
                  <div className="space-y-2">
                    {adaptation.alternativeSpecies.map((alt, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                        <div>
                          <p className="font-medium">{alt.name}</p>
                          <p className="text-neutral-600 text-xs">{alt.reason}</p>
                        </div>
                        {onAlternativeSelect && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAlternativeSelect(alt.plantId, alt.name)}
                          >
                            View
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assessment info */}
              <div className="text-xs text-neutral-500 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Last assessed: {adaptation.lastAssessment.toLocaleDateString()}
                </div>
                <p className="mt-1">
                  Scenario: {scenario} • Pacific Northwest climate projections
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

function ClimateStressItem({ stress }: { stress: ClimateStress }) {
  const StressIcon = STRESS_ICONS[stress.stressType];
  
  return (
    <div className="p-2 border rounded text-sm">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <StressIcon className="h-4 w-4 text-orange-600" />
          <span className="font-medium capitalize">{stress.stressType}</span>
          <Badge 
            variant="outline"
            className={`text-xs ${STRESS_COLORS[stress.severity]}`}
          >
            {stress.severity}
          </Badge>
        </div>
        <span className="text-xs text-neutral-500">{stress.timeframe}</span>
      </div>
      
      {stress.indicators.length > 0 && (
        <ul className="text-xs text-neutral-600 ml-6 space-y-0.5">
          {stress.indicators.map((indicator, index) => (
            <li key={index}>• {indicator}</li>
          ))}
        </ul>
      )}
    </div>
  );
}