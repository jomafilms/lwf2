"use client";

import { useState } from "react";
import { 
  MousePointer,
  Move,
  RotateCcw,
  Trash2,
  ZoomIn,
  ZoomOut,
  Grid,
  Ruler,
  Save,
  Download,
  Palette
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

const DEMO_ZONES: CanvasZone[] = [
  {
    id: "zone-0",
    name: "Zone 0 (0-5ft)",
    color: "#ef4444",
    x: 50,
    y: 50,
    width: 200,
    height: 150,
  },
  {
    id: "zone-1",
    name: "Zone 1 (5-30ft)",
    color: "#f59e0b", 
    x: 270,
    y: 50,
    width: 300,
    height: 250,
  },
  {
    id: "zone-2",
    name: "Zone 2 (30-100ft)",
    color: "#22c55e",
    x: 590,
    y: 50,
    width: 350,
    height: 300,
  }
];

const PLANT_OPTIONS = [
  { name: "English Lavender", matureSize: 3 },
  { name: "Deer Brush", matureSize: 8 },
  { name: "Common Yarrow", matureSize: 2 },
  { name: "Kinnikinnick", matureSize: 4 },
  { name: "Common Sage", matureSize: 3 },
  { name: "Manzanita", matureSize: 6 },
];

export function PlanDesignerDemo() {
  const [placements, setPlacements] = useState<PlantPlacement[]>([]);
  const [selectedTool, setSelectedTool] = useState<'select' | 'plant'>('select');
  const [selectedPlant, setSelectedPlant] = useState(PLANT_OPTIONS[0]);
  const [selectedZone, setSelectedZone] = useState("zone-0");
  const [selectedPlacement, setSelectedPlacement] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedTool !== 'plant') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is within selected zone
    const zone = DEMO_ZONES.find(z => z.id === selectedZone);
    if (!zone) return;

    if (x >= zone.x && x <= zone.x + zone.width && 
        y >= zone.y && y <= zone.y + zone.height) {
      
      const newPlacement: PlantPlacement = {
        id: `plant-${Date.now()}`,
        name: selectedPlant.name,
        x,
        y,
        zone: selectedZone,
        matureSize: selectedPlant.matureSize,
        quantity: 1,
      };

      setPlacements([...placements, newPlacement]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedPlacement) {
      setPlacements(placements.filter(p => p.id !== selectedPlacement));
      setSelectedPlacement(null);
    }
  };

  const updatePlacement = (id: string, updates: Partial<PlantPlacement>) => {
    setPlacements(placements.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const totalPlants = placements.reduce((sum, p) => sum + p.quantity, 0);
  const selectedPlantData = selectedPlacement ? 
    placements.find(p => p.id === selectedPlacement) : null;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Tools */}
              <div className="flex items-center gap-2">
                <Button
                  variant={selectedTool === 'select' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTool('select')}
                >
                  <MousePointer className="h-4 w-4" />
                  Select
                </Button>
                
                <Button
                  variant={selectedTool === 'plant' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTool('plant')}
                >
                  <Palette className="h-4 w-4" />
                  Place Plant
                </Button>
              </div>

              <div className="h-4 w-px bg-neutral-300" />

              {/* Plant selection */}
              {selectedTool === 'plant' && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Plant:</Label>
                  <Select
                    value={selectedPlant.name}
                    onValueChange={(value) => {
                      const plant = PLANT_OPTIONS.find(p => p.name === value);
                      if (plant) setSelectedPlant(plant);
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANT_OPTIONS.map((plant) => (
                        <SelectItem key={plant.name} value={plant.name}>
                          {plant.name} ({plant.matureSize}ft)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Label className="text-sm">Zone:</Label>
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEMO_ZONES.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name.split(' ')[0]} {zone.name.split(' ')[1]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {totalPlants} plants
              </Badge>

              {selectedPlacement && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              <Button variant="outline" size="sm">
                <Save className="h-4 w-4" />
                Save
              </Button>

              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Design Canvas</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.min(zoom + 10, 200))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-neutral-600">{zoom}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.max(zoom - 10, 50))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div
                className="relative bg-neutral-50 border-t"
                style={{ 
                  width: "100%", 
                  height: "500px",
                  backgroundImage: showGrid ? 
                    'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' : 'none',
                  backgroundSize: '20px 20px',
                  cursor: selectedTool === 'plant' ? 'crosshair' : 'default'
                }}
                onClick={handleCanvasClick}
              >
                {/* Fire zones */}
                {DEMO_ZONES.map(zone => (
                  <div
                    key={zone.id}
                    className="absolute border-2 rounded-lg"
                    style={{
                      left: `${zone.x * (zoom / 100)}px`,
                      top: `${zone.y * (zoom / 100)}px`,
                      width: `${zone.width * (zoom / 100)}px`,
                      height: `${zone.height * (zoom / 100)}px`,
                      borderColor: zone.color,
                      backgroundColor: `${zone.color}15`,
                    }}
                  >
                    <div
                      className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: zone.color }}
                    >
                      {zone.name.split(' ')[0]} {zone.name.split(' ')[1]}
                    </div>
                  </div>
                ))}

                {/* Plant placements */}
                {placements.map(placement => {
                  const isSelected = selectedPlacement === placement.id;
                  const radius = (placement.matureSize * 3 * (zoom / 100)); // 3px per foot at 100% zoom
                  
                  return (
                    <div key={placement.id}>
                      {/* Mature size circle */}
                      <div
                        className="absolute border-2 border-green-500 rounded-full"
                        style={{
                          left: `${placement.x * (zoom / 100) - radius}px`,
                          top: `${placement.y * (zoom / 100) - radius}px`,
                          width: `${radius * 2}px`,
                          height: `${radius * 2}px`,
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          borderStyle: 'dashed',
                          borderColor: isSelected ? '#3b82f6' : '#22c55e',
                          borderWidth: isSelected ? '3px' : '2px',
                        }}
                      />
                      
                      {/* Plant marker */}
                      <div
                        className="absolute w-4 h-4 rounded-full border-2 border-white cursor-pointer transform -translate-x-2 -translate-y-2"
                        style={{
                          left: `${placement.x * (zoom / 100)}px`,
                          top: `${placement.y * (zoom / 100)}px`,
                          backgroundColor: isSelected ? '#3b82f6' : '#16a34a',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTool('select');
                          setSelectedPlacement(placement.id);
                        }}
                      />
                      
                      {/* Plant label */}
                      <div
                        className="absolute text-xs font-medium text-center bg-white px-1 rounded shadow-sm"
                        style={{
                          left: `${placement.x * (zoom / 100) - 30}px`,
                          top: `${(placement.y + 20) * (zoom / 100)}px`,
                          width: '60px',
                        }}
                      >
                        {placement.name.split(' ')[0]}
                      </div>

                      {/* Quantity badge */}
                      {placement.quantity > 1 && (
                        <div
                          className="absolute w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
                          style={{
                            left: `${(placement.x + 10) * (zoom / 100)}px`,
                            top: `${(placement.y - 10) * (zoom / 100)}px`,
                          }}
                        >
                          {placement.quantity}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Instructions overlay when no plants */}
                {placements.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-neutral-500">
                      <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select "Place Plant" tool and click in zones to add plants</p>
                      <p className="text-sm mt-2">Professional landscape planning canvas</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties panel */}
        <div className="space-y-4">
          {/* Zone legend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Fire Zones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {DEMO_ZONES.map(zone => (
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
          {selectedPlantData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Plant Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Plant Type</Label>
                  <Select
                    value={selectedPlantData.name}
                    onValueChange={(value) => updatePlacement(selectedPlantData.id, { name: value })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANT_OPTIONS.map((plant) => (
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
                    value={selectedPlantData.quantity}
                    onChange={(e) => updatePlacement(selectedPlantData.id, { 
                      quantity: parseInt(e.target.value) || 1 
                    })}
                    className="h-8"
                  />
                </div>

                <div>
                  <Label className="text-xs">Mature Size</Label>
                  <div className="text-xs text-neutral-600">
                    {selectedPlantData.matureSize}ft diameter
                  </div>
                </div>

                <div className="text-xs text-neutral-500">
                  Position: ({Math.round(selectedPlantData.x)}, {Math.round(selectedPlantData.y)})
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
                  {DEMO_ZONES.map(zone => {
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
      </div>
    </div>
  );
}