"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Stage } from "react-konva";
import { CanvasToolbar } from "./CanvasToolbar";
import { PlantPalette } from "./PlantPalette";
import { CanvasZoneLayer } from "./CanvasZoneLayer";

interface PlantPlacement {
  id: string;
  plantId: string;
  plantName: string;
  x: number;
  y: number;
  zone: string;
  matureSize: number; // feet diameter
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

interface PlanCanvasProps {
  zones: Zone[];
  propertyBounds: { width: number; height: number };
  onPlacementChange: (placements: PlantPlacement[]) => void;
  readOnly?: boolean;
}

const DEFAULT_ZONES: Zone[] = [
  {
    id: "zone-0",
    name: "Zone 0 (0-5ft)",
    bounds: { x: 50, y: 50, width: 200, height: 200 },
    color: "#ef4444",
    requirements: ["Low flammability", "No dead foliage", "5ft clearance"]
  },
  {
    id: "zone-1", 
    name: "Zone 1 (5-30ft)",
    bounds: { x: 250, y: 50, width: 300, height: 300 },
    color: "#f59e0b",
    requirements: ["Fire-resistant", "Proper spacing", "Maintained"]
  },
  {
    id: "zone-2",
    name: "Zone 2 (30-100ft)", 
    bounds: { x: 550, y: 50, width: 400, height: 400 },
    color: "#22c55e",
    requirements: ["Fuel breaks", "Emergency access", "Thinned vegetation"]
  }
];

// Convert feet to canvas pixels (1 foot = 10 pixels)
const SCALE = 10;

export function PlanCanvas({
  zones = DEFAULT_ZONES,
  propertyBounds = { width: 1000, height: 500 },
  onPlacementChange,
  readOnly = false
}: PlanCanvasProps) {
  const [placements, setPlacements] = useState<PlantPlacement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'move' | 'measure'>('select');
  const [zoom, setZoom] = useState(1);
  const [dragMode, setDragMode] = useState(false);
  const stageRef = useRef<any>(null);

  const canvasWidth = Math.max(propertyBounds.width, 800);
  const canvasHeight = Math.max(propertyBounds.height, 600);

  // Handle plant placement
  const handleStageClick = useCallback((e: any) => {
    if (readOnly || tool !== 'select') return;

    const pos = e.target.getStage().getPointerPosition();
    const stageAttrs = e.target.getStage().attrs;
    
    // Convert screen coordinates to canvas coordinates
    const x = (pos.x - stageAttrs.x) / zoom;
    const y = (pos.y - stageAttrs.y) / zoom;

    // Check if clicking on empty space to add plant
    if (e.target === e.target.getStage()) {
      // Determine which zone this point is in
      const zone = zones.find(z => 
        x >= z.bounds.x && x <= z.bounds.x + z.bounds.width &&
        y >= z.bounds.y && y <= z.bounds.y + z.bounds.height
      );

      if (zone) {
        const newPlacement: PlantPlacement = {
          id: `plant-${Date.now()}`,
          plantId: 'placeholder',
          plantName: 'New Plant',
          x,
          y,
          zone: zone.id,
          matureSize: 6, // default 6ft diameter
          quantity: 1,
        };

        const newPlacements = [...placements, newPlacement];
        setPlacements(newPlacements);
        onPlacementChange(newPlacements);
        setSelectedId(newPlacement.id);
      }
    }
  }, [readOnly, tool, zoom, zones, placements, onPlacementChange]);

  // Handle plant drag
  const handlePlantDrag = useCallback((id: string, newPos: { x: number; y: number }) => {
    if (readOnly) return;

    const newPlacements = placements.map(p => 
      p.id === id ? { ...p, x: newPos.x, y: newPos.y } : p
    );
    setPlacements(newPlacements);
    onPlacementChange(newPlacements);
  }, [readOnly, placements, onPlacementChange]);

  // Delete selected plant
  const handleDelete = useCallback(() => {
    if (readOnly || !selectedId) return;

    const newPlacements = placements.filter(p => p.id !== selectedId);
    setPlacements(newPlacements);
    onPlacementChange(newPlacements);
    setSelectedId(null);
  }, [readOnly, selectedId, placements, onPlacementChange]);

  // Zoom controls
  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' 
      ? Math.min(zoom * 1.2, 3)
      : Math.max(zoom / 1.2, 0.3);
    setZoom(newZoom);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readOnly) return;
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        setSelectedId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readOnly, handleDelete]);

  return (
    <div className="flex gap-4 h-[600px]">
      {/* Canvas */}
      <div className="flex-1 border rounded-lg overflow-hidden bg-neutral-50">
        {/* Toolbar */}
        <CanvasToolbar
          tool={tool}
          setTool={setTool}
          dragMode={dragMode}
          setDragMode={setDragMode}
          zoom={zoom}
          onZoom={handleZoom}
          placementsCount={placements.length}
          selectedId={selectedId}
          onDelete={handleDelete}
          readOnly={readOnly}
        />

        {/* Stage */}
        <div className="relative">
          <Stage
            ref={stageRef}
            width={canvasWidth}
            height={canvasHeight - 50} // Account for toolbar
            scaleX={zoom}
            scaleY={zoom}
            draggable={dragMode}
            onClick={handleStageClick}
          >
            <CanvasZoneLayer
              propertyBounds={propertyBounds}
              zones={zones}
              placements={placements}
              selectedId={selectedId}
              scale={SCALE}
              readOnly={readOnly}
              onPlantSelect={setSelectedId}
              onPlantDrag={handlePlantDrag}
            />
          </Stage>
        </div>
      </div>

      {/* Sidebar */}
      <PlantPalette
        selectedId={selectedId}
        placements={placements}
        zones={zones}
        readOnly={readOnly}
        onPlacementChange={(newPlacements) => {
          setPlacements(newPlacements);
          onPlacementChange(newPlacements);
        }}
      />
    </div>
  );
}