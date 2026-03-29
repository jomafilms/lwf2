"use client";

import { useState, useEffect } from "react";
import { Save, Download, Share2, Undo, Redo, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlanCanvas } from "./PlanCanvas";

interface Property {
  id: string;
  address: string;
  lat: number;
  lng: number;
  fireZones?: any;
  structureFootprints?: any;
}

interface Plan {
  id: string;
  name?: string;
  plantPlacements?: any;
  notes?: string;
  status: string;
}

interface PlantPlacement {
  id: string;
  plantId: string;
  plantName: string;
  x: number;
  y: number;
  zone: string;
  matureSize: number;
  quantity: number;
  notes?: string;
}

interface PlanDesignInterfaceProps {
  property: Property;
  existingPlan?: Plan | null;
}

// Generate zones from property fire zones or use defaults
function generateZones(property: Property) {
  if (property.fireZones) {
    // Convert fire zones data to canvas zones
    const fireZones = property.fireZones as any;
    return [
      {
        id: "zone-0",
        name: "Zone 0 (0-5ft)",
        bounds: { x: 50, y: 50, width: 200, height: 200 },
        color: "#ef4444",
        requirements: ["Low flammability plants only", "No dead foliage", "5ft clearance"]
      },
      {
        id: "zone-1",
        name: "Zone 1 (5-30ft)",
        bounds: { x: 250, y: 50, width: 300, height: 300 },
        color: "#f59e0b",
        requirements: ["Fire-resistant plants", "Proper spacing", "Well maintained"]
      },
      {
        id: "zone-2",
        name: "Zone 2 (30-100ft)",
        bounds: { x: 550, y: 50, width: 400, height: 400 },
        color: "#22c55e",
        requirements: ["Fuel breaks", "Emergency access", "Vegetation thinning"]
      }
    ];
  }

  // Default zones if no fire zone data
  return [
    {
      id: "zone-0",
      name: "Zone 0 (0-5ft)",
      bounds: { x: 50, y: 50, width: 200, height: 200 },
      color: "#ef4444",
      requirements: ["Low flammability plants only"]
    },
    {
      id: "zone-1", 
      name: "Zone 1 (5-30ft)",
      bounds: { x: 250, y: 50, width: 300, height: 300 },
      color: "#f59e0b",
      requirements: ["Fire-resistant plants"]
    }
  ];
}

export function PlanDesignInterface({ property, existingPlan }: PlanDesignInterfaceProps) {
  const [placements, setPlacements] = useState<PlantPlacement[]>([]);
  const [planName, setPlanName] = useState(existingPlan?.name || "");
  const [planNotes, setPlanNotes] = useState(existingPlan?.notes || "");
  const [saving, setSaving] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const zones = generateZones(property);
  
  // Load existing plan placements
  useEffect(() => {
    if (existingPlan?.plantPlacements) {
      setPlacements(existingPlan.plantPlacements as PlantPlacement[]);
    }
  }, [existingPlan]);

  // Track unsaved changes
  useEffect(() => {
    if (existingPlan) {
      const hasChanges = JSON.stringify(placements) !== JSON.stringify(existingPlan.plantPlacements || []);
      setUnsavedChanges(hasChanges);
    } else {
      setUnsavedChanges(placements.length > 0);
    }
  }, [placements, existingPlan]);

  const handleSavePlan = async () => {
    if (!planName.trim()) {
      alert("Please enter a plan name");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/plans", {
        method: existingPlan ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: existingPlan?.id,
          propertyId: property.id,
          name: planName.trim(),
          plantPlacements: placements,
          notes: planNotes.trim() || undefined,
          status: "draft"
        })
      });

      if (response.ok) {
        const result = await response.json();
        setUnsavedChanges(false);
        setSaveDialogOpen(false);
        
        // Update URL if this is a new plan
        if (!existingPlan && result.planId) {
          const url = new URL(window.location.href);
          url.searchParams.set('plan', result.planId);
          window.history.pushState({}, '', url);
        }
        
        alert("Plan saved successfully!");
      } else {
        throw new Error("Failed to save plan");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    if (existingPlan?.id) {
      window.open(`/plans/${existingPlan.id}/document`, '_blank');
    } else {
      alert("Please save the plan first to export as PDF");
    }
  };

  const totalPlants = placements.reduce((sum, p) => sum + p.quantity, 0);
  const zoneDistribution = zones.map(zone => ({
    zone: zone.name,
    count: placements.filter(p => p.zone === zone.id).reduce((sum, p) => sum + p.quantity, 0)
  }));

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-medium">
                  {existingPlan ? planName || `Plan ${existingPlan.id.slice(0, 8)}` : "New Plan"}
                </h3>
                <p className="text-sm text-neutral-600">
                  {totalPlants} plants • {zoneDistribution.filter(z => z.count > 0).length} zones used
                </p>
              </div>
              
              {unsavedChanges && (
                <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  Unsaved changes
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant={unsavedChanges ? "default" : "outline"} size="sm">
                    <Save className="h-4 w-4" />
                    Save Plan
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Landscape Plan</DialogTitle>
                    <DialogDescription>
                      Enter details for your landscape plan
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="plan-name">Plan Name</Label>
                      <Input
                        id="plan-name"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        placeholder="e.g., Front Yard Redesign 2026"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="plan-notes">Notes (optional)</Label>
                      <Textarea
                        id="plan-notes"
                        value={planNotes}
                        onChange={(e) => setPlanNotes(e.target.value)}
                        placeholder="Design notes, installation phases, maintenance reminders..."
                        rows={3}
                      />
                    </div>

                    <div className="text-sm text-neutral-600">
                      <p>This plan includes {totalPlants} plants across {zoneDistribution.filter(z => z.count > 0).length} fire zones.</p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSavePlan} disabled={saving}>
                      {saving ? "Saving..." : existingPlan ? "Update Plan" : "Save Plan"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="h-4 w-4" />
                Export PDF
              </Button>

              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design canvas */}
      <PlanCanvas
        zones={zones}
        propertyBounds={{ width: 1000, height: 600 }}
        onPlacementChange={setPlacements}
      />

      {/* Plan summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Zone Distribution</CardTitle>
            <CardDescription>
              Plants placed by fire safety zone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {zoneDistribution.map(item => (
                <div key={item.zone} className="flex justify-between items-center">
                  <span className="text-sm">{item.zone}</span>
                  <span className="font-medium">{item.count} plants</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plant Summary</CardTitle>
            <CardDescription>
              Species breakdown and quantities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(
                placements.reduce((acc, p) => {
                  acc[p.plantName] = (acc[p.plantName] || 0) + p.quantity;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([name, count]) => (
                <div key={name} className="flex justify-between items-center">
                  <span className="text-sm">{name}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              
              {placements.length === 0 && (
                <p className="text-sm text-neutral-500">
                  No plants placed yet. Click on the canvas to start designing.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}