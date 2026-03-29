/**
 * Cost Estimator Component
 * 
 * Interactive cost calculator with budget tiers and nursery pricing.
 * Shows plant costs, labor estimates, materials, and links to purchase.
 */

"use client";

import { useState, useEffect } from "react";
import { Loader2, Calculator, DollarSign, Truck, Wrench, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { CostEstimate, PlantCost } from "../../lib/cost/estimate";
import { formatCostRange, getBudgetTierInfo } from "../../lib/cost/estimate";
import { GrantInfo } from "./GrantInfo";

interface CostEstimatorProps {
  propertyId: string;
  propertyLocation?: {
    city?: string;
    state?: string;
    county?: string;
  };
}

type BudgetTier = 'starter' | 'standard' | 'comprehensive';

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
}

function getTierColor(tier: BudgetTier): string {
  switch (tier) {
    case 'starter': return 'bg-green-50 text-green-700 border-green-200';
    case 'standard': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'comprehensive': return 'bg-purple-50 text-purple-700 border-purple-200';
  }
}

function getTierDescription(tier: BudgetTier): string {
  const info = getBudgetTierInfo(tier);
  return info.description;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function CostEstimator({ propertyId, propertyLocation }: CostEstimatorProps) {
  const [selectedTier, setSelectedTier] = useState<BudgetTier>('standard');
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load cost estimate
  const loadEstimate = async (budgetTier?: BudgetTier) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (budgetTier) {
        params.set('budgetTier', budgetTier);
      }
      
      const response = await fetch(`/api/cost/${propertyId}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to calculate cost estimate');
      }
      
      const data: CostEstimate = await response.json();
      setEstimate(data);
      setSelectedTier(data.budgetTier);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  // Load initial estimate
  useEffect(() => {
    loadEstimate(selectedTier);
  }, [propertyId]);
  
  // Handle tier change
  const handleTierChange = (newTier: BudgetTier) => {
    setSelectedTier(newTier);
    loadEstimate(newTier);
  };
  
  if (loading && !estimate) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Calculating costs...
      </div>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p className="font-medium">Error calculating costs</p>
            <p className="text-sm text-red-400 mt-1">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => loadEstimate(selectedTier)}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!estimate) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* Budget Tier Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cost Estimate
          </CardTitle>
          <CardDescription>
            Choose your budget tier to see customized cost estimates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Budget Tier</label>
              <Select 
                value={selectedTier} 
                onValueChange={handleTierChange}
                disabled={loading}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">
                    Starter ($200-$500) - Zone 0 cleanup + basics
                  </SelectItem>
                  <SelectItem value="standard">
                    Standard ($1K-$5K) - Full Zone 0-1 makeover
                  </SelectItem>
                  <SelectItem value="comprehensive">
                    Comprehensive ($5K-$15K) - All zones + premium
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Current Tier Info */}
            <div className={`p-4 rounded-lg border ${getTierColor(estimate.budgetTier)}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold capitalize">
                  {estimate.budgetTier} Plan
                </h4>
                <Badge variant="outline" className="bg-white/50">
                  {formatCostRange(estimate.totalEstimate)}
                </Badge>
              </div>
              <p className="text-sm">
                {getTierDescription(estimate.budgetTier)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
          <CardDescription>
            Detailed breakdown of your landscaping project costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Plants */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  Plants & Materials
                </h4>
                <span className="text-lg font-semibold">
                  {formatPrice(estimate.plantTotal)}
                </span>
              </div>
              
              {estimate.plants.length > 0 ? (
                <div className="space-y-3">
                  {estimate.plants.map((plant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{plant.name}</div>
                        <div className="text-sm text-gray-600">
                          {plant.containerSize} • {plant.nursery} • Qty: {plant.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(plant.price * plant.quantity)}</div>
                        <div className="text-sm text-gray-600">
                          {formatPrice(plant.price)} each
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Nursery Links */}
                  <div className="mt-4 pt-3 border-t">
                    <h5 className="text-sm font-medium mb-2">Purchase from Nurseries:</h5>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(estimate.plants.map(p => p.nursery))].map(nursery => (
                        <Button
                          key={nursery}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          asChild
                        >
                          <a href="#" className="flex items-center gap-1">
                            {nursery}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No plants selected yet</p>
              )}
            </div>
            
            <Separator />
            
            {/* Labor */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <Wrench className="h-4 w-4 text-orange-500" />
                Labor
              </h4>
              <span className="text-lg font-semibold">
                {formatCostRange(estimate.laborEstimate)}
              </span>
            </div>
            
            <Separator />
            
            {/* Materials */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-500" />
                Materials & Supplies
              </h4>
              <span className="text-lg font-semibold">
                {formatCostRange(estimate.materialsEstimate)}
              </span>
            </div>
            
            <Separator />
            
            {/* Total */}
            <div className="flex items-center justify-between text-xl font-bold">
              <h4 className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Total Estimated Cost
              </h4>
              <span className="text-green-600">
                {formatCostRange(estimate.totalEstimate)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Budget Comparison */}
      {estimate.budgetTier !== 'starter' && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Options</CardTitle>
            <CardDescription>
              Compare different budget tiers for your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['starter', 'standard', 'comprehensive'] as const).map((tier) => (
                <div
                  key={tier}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    tier === estimate.budgetTier 
                      ? getTierColor(tier) 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleTierChange(tier)}
                >
                  <h5 className="font-semibold capitalize mb-2">{tier} Plan</h5>
                  <p className="text-sm text-gray-600 mb-3">
                    {getTierDescription(tier)}
                  </p>
                  <div className="text-lg font-bold">
                    ${getBudgetTierInfo(tier).maxBudget / 100} max
                  </div>
                  {tier !== estimate.budgetTier && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 w-full"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                      View {tier} plan
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Share Your Estimate</CardTitle>
          <CardDescription>
            Export or share this cost estimate with contractors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              Print Estimate
            </Button>
            <Button variant="outline">
              Download PDF
            </Button>
            <Button variant="outline">
              Email to Landscaper
            </Button>
            <Button variant="outline">
              Share Link
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Grant Information */}
      <GrantInfo 
        propertyLocation={propertyLocation}
        estimatedCost={estimate.totalEstimate.max} // Use max estimate for conservative grant planning
        planScope={estimate.budgetTier}
      />
    </div>
  );
}

export default CostEstimator;