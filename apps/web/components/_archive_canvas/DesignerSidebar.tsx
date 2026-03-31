"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PlantPlacement {
  id: string;
  name: string;
  x: number;
  y: number;
  zone: string;
  matureSize: number;
  quantity: number;
}

interface CanvasZone {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PlantOption {
  name: string;
  matureSize: number;
  zone: string;
}

interface DesignerSidebarProps {
  zones: CanvasZone[];
  placements: PlantPlacement[];
  selectedPlant: PlantPlacement | undefined;
  plantOptions: PlantOption[];
  totalPlants: number;
  onUpdatePlacement: (id: string, updates: Partial<PlantPlacement>) => void;
}

export function DesignerSidebar({
  zones,
  placements,
  selectedPlant,
  plantOptions,
  totalPlants,
  onUpdatePlacement
}: DesignerSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Zone legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Fire Zones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {zones.map(zone => (
            <div key={zone.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: zone.color }}
              />
              <span className="text-xs">{zone.name}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Selected plant properties */}
      {selectedPlant && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Plant Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Plant Type</Label>
              <Select
                value={selectedPlant.name}
                onValueChange={(value) => onUpdatePlacement(selectedPlant.id, { name: value })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {plantOptions.map((plant) => (
                    <SelectItem key={plant.name} value={plant.name}>
                      {plant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Quantity</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={selectedPlant.quantity}
                onChange={(e) => onUpdatePlacement(selectedPlant.id, { 
                  quantity: parseInt(e.target.value) || 1 
                })}
                className="h-8"
              />
            </div>

            <div>
              <Label className="text-xs">Mature Size</Label>
              <div className="text-xs text-neutral-600">
                {selectedPlant.matureSize}ft diameter
              </div>
            </div>

            <div className="text-xs text-neutral-500">
              Position: ({Math.round(selectedPlant.x)}, {Math.round(selectedPlant.y)})
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plant summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Plan Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {placements.length === 0 ? (
            <p className="text-xs text-neutral-500">No plants placed</p>
          ) : (
            <div className="space-y-2">
              {zones.map(zone => {
                const zonePlants = placements.filter(p => p.zone === zone.id);
                const count = zonePlants.reduce((sum, p) => sum + p.quantity, 0);
                
                return count > 0 ? (
                  <div key={zone.id} className="flex justify-between text-xs">
                    <span>{zone.name.split(' ')[0]} {zone.name.split(' ')[1]}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ) : null;
              })}
              
              <div className="pt-2 border-t flex justify-between text-xs font-medium">
                <span>Total Plants</span>
                <span>{totalPlants}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-xs text-neutral-600 space-y-1">
            <p><strong>Place Plant:</strong> Click in zones to add</p>
            <p><strong>Select:</strong> Click plants to edit</p>
            <p><strong>Mature size:</strong> Dashed circles</p>
            <p><strong>Spacing:</strong> Keep plants outside each other's mature size circles</p>
            <p><strong>Professional output:</strong> Export to PDF for contractors</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}