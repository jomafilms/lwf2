"use client";

import {
  Card,
  CardContent,
  CardDescription,
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

interface Zone {
  id: string;
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  color: string;
  requirements: string[];
}

interface PlantPaletteProps {
  selectedId: string | null;
  placements: PlantPlacement[];
  zones: Zone[];
  readOnly?: boolean;
  onPlacementChange: (placements: PlantPlacement[]) => void;
}

export function PlantPalette({
  selectedId,
  placements,
  zones,
  readOnly = false,
  onPlacementChange
}: PlantPaletteProps) {
  if (readOnly) {
    return (
      <div className="w-80 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Plan Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-neutral-600 space-y-1">
              <p>{placements.length} plants placed</p>
              <p>Covers {zones.length} zones</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedPlant = placements.find(p => p.id === selectedId);

  return (
    <div className="w-80 space-y-4">
      {/* Plant Properties */}
      {selectedPlant && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Plant Properties</CardTitle>
            <CardDescription>
              Edit selected plant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium">Plant Type</label>
              <Select
                value={selectedPlant.plantName}
                onValueChange={(value) => {
                  const newPlacements = placements.map(p =>
                    p.id === selectedId ? { ...p, plantName: value } : p
                  );
                  onPlacementChange(newPlacements);
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English Lavender">English Lavender</SelectItem>
                  <SelectItem value="Deer Brush">Deer Brush</SelectItem>
                  <SelectItem value="Common Yarrow">Common Yarrow</SelectItem>
                  <SelectItem value="Kinnikinnick">Kinnikinnick</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium">Mature Size (ft)</label>
              <Select
                value={selectedPlant.matureSize.toString()}
                onValueChange={(value) => {
                  const newPlacements = placements.map(p =>
                    p.id === selectedId ? { ...p, matureSize: parseInt(value) } : p
                  );
                  onPlacementChange(newPlacements);
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 feet</SelectItem>
                  <SelectItem value="4">4 feet</SelectItem>
                  <SelectItem value="6">6 feet</SelectItem>
                  <SelectItem value="8">8 feet</SelectItem>
                  <SelectItem value="12">12 feet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium">Zone</label>
              <div className="text-xs text-neutral-600 mt-1">
                {zones.find(z => z.id === selectedPlant.zone)?.name || 'Unknown'}
              </div>
            </div>

            <div className="text-xs text-neutral-500">
              Position: {Math.round(selectedPlant.x)}, {Math.round(selectedPlant.y)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-xs text-neutral-600 space-y-1">
            <p>• Click in zones to place plants</p>
            <p>• Drag plants to reposition</p>
            <p>• Select plants to edit properties</p>
            <p>• Green circles show mature size</p>
            <p>• Orange circles show spacing guides</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}