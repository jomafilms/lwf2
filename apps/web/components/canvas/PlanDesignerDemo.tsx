"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DesignerToolbar } from "./DesignerToolbar";
import { DesignerSidebar } from "./DesignerSidebar";
import { PlantLibraryPanel } from "./PlantLibraryPanel";

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

const DEMO_ZONES: CanvasZone[] = [
  { id: "zone0", name: "Zone 0 (0-5ft)", color: "#ef4444", x: 20, y: 20, width: 120, height: 120 },
  { id: "zone1", name: "Zone 1 (5-30ft)", color: "#f59e0b", x: 150, y: 50, width: 180, height: 140 },
  { id: "zone2", name: "Zone 2 (30-100ft)", color: "#22c55e", x: 340, y: 30, width: 220, height: 180 },
];

const PLANT_OPTIONS: PlantOption[] = [
  { name: "English Lavender", matureSize: 3, zone: "zone1" },
  { name: "Deer Brush", matureSize: 8, zone: "zone2" },
  { name: "Common Yarrow", matureSize: 2, zone: "zone0" },
  { name: "Kinnikinnick", matureSize: 1, zone: "zone0" },
  { name: "Manzanita", matureSize: 6, zone: "zone2" },
];

type Tool = 'select' | 'plant' | 'move' | 'measure';

export function PlanDesignerDemo() {
  const [selectedTool, setSelectedTool] = useState<Tool>('select');
  const [placements, setPlacements] = useState<PlantPlacement[]>([]);
  const [selectedPlacement, setSelectedPlacement] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(PLANT_OPTIONS[0]);
  const [selectedZone, setSelectedZone] = useState("zone1");

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedTool !== 'plant') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (zoom / 100);
    const y = (e.clientY - rect.top) / (zoom / 100);

    // Find which zone this click is in
    const zone = DEMO_ZONES.find(z => 
      x >= z.x && x <= z.x + z.width && 
      y >= z.y && y <= z.y + z.height
    );

    if (!zone) return;

    if (selectedPlant) {
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

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => direction === 'in' 
      ? Math.min(prev + 10, 200) 
      : Math.max(prev - 10, 50)
    );
  };

  const totalPlants = placements.reduce((sum, p) => sum + p.quantity, 0);
  const selectedPlantData = selectedPlacement ? 
    placements.find(p => p.id === selectedPlacement) : undefined;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <DesignerToolbar
            selectedTool={selectedTool}
            onToolChange={setSelectedTool}
            zoom={zoom}
            onZoomChange={handleZoom}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
            totalPlants={totalPlants}
            selectedPlant={!!selectedPlacement}
            onDeleteSelected={handleDeleteSelected}
            onSave={() => alert('Save functionality not implemented')}
            onExport={() => alert('Export functionality not implemented')}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Design Canvas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div onClick={handleCanvasClick}>
                <PlantLibraryPanel
                  placements={placements}
                  zoom={zoom}
                  showGrid={showGrid}
                  onPlantClick={(id) => {
                    setSelectedTool('select');
                    setSelectedPlacement(id);
                  }}
                  selectedPlant={selectedPlacement || undefined}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <DesignerSidebar
          zones={DEMO_ZONES}
          placements={placements}
          selectedPlant={selectedPlantData}
          plantOptions={PLANT_OPTIONS}
          totalPlants={totalPlants}
          onUpdatePlacement={updatePlacement}
        />
      </div>
    </div>
  );
}