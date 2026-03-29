"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Stage, Layer, Rect, Circle, Text, Line, Group } from "react-konva";
import { 
  Ruler, 
  Move, 
  RotateCcw, 
  Trash2, 
  Settings,
  ZoomIn,
  ZoomOut,
  Hand
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        <div className="flex items-center justify-between p-2 border-b bg-white">
          <div className="flex items-center gap-2">
            <Button
              variant={tool === 'select' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('select')}
              disabled={readOnly}
            >
              <Move className="h-4 w-4" />
            </Button>
            
            <Button
              variant={dragMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDragMode(!dragMode)}
            >
              <Hand className="h-4 w-4" />
            </Button>

            <div className="h-4 w-px bg-neutral-300" />

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom('in')}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom('out')}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <span className="text-sm text-neutral-600">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {placements.length} plants
            </Badge>
            
            {selectedId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

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
            <Layer>
              {/* Property boundary */}
              <Rect
                x={0}
                y={0}
                width={propertyBounds.width}
                height={propertyBounds.height}
                stroke="#94a3b8"
                strokeWidth={2}
                dash={[5, 5]}
                fill="rgba(248, 250, 252, 0.5)"
              />

              {/* Fire zones */}
              {zones.map(zone => (
                <Group key={zone.id}>
                  <Rect
                    x={zone.bounds.x}
                    y={zone.bounds.y}
                    width={zone.bounds.width}
                    height={zone.bounds.height}
                    fill={zone.color}
                    opacity={0.1}
                    stroke={zone.color}
                    strokeWidth={2}
                  />
                  <Text
                    x={zone.bounds.x + 10}
                    y={zone.bounds.y + 10}
                    text={zone.name}
                    fontSize={14}
                    fontStyle="bold"
                    fill={zone.color}
                  />
                </Group>
              ))}

              {/* Plant placements */}
              {placements.map(placement => {
                const isSelected = selectedId === placement.id;
                const radius = (placement.matureSize * SCALE) / 2;
                
                return (
                  <Group key={placement.id}>
                    {/* Mature size circle */}
                    <Circle
                      x={placement.x}
                      y={placement.y}
                      radius={radius}
                      fill="rgba(34, 197, 94, 0.2)"
                      stroke={isSelected ? "#3b82f6" : "#22c55e"}
                      strokeWidth={isSelected ? 3 : 1}
                      dash={[3, 3]}
                    />
                    
                    {/* Plant marker */}
                    <Circle
                      x={placement.x}
                      y={placement.y}
                      radius={6}
                      fill={isSelected ? "#3b82f6" : "#16a34a"}
                      stroke="white"
                      strokeWidth={2}
                      draggable={!readOnly}
                      onClick={() => setSelectedId(placement.id)}
                      onDragMove={(e) => {
                        handlePlantDrag(placement.id, {
                          x: e.target.x(),
                          y: e.target.y()
                        });
                      }}
                    />
                    
                    {/* Plant label */}
                    <Text
                      x={placement.x - 30}
                      y={placement.y + radius + 5}
                      width={60}
                      text={placement.plantName}
                      fontSize={10}
                      align="center"
                      fill="#374151"
                    />

                    {/* Quantity badge */}
                    {placement.quantity > 1 && (
                      <Group>
                        <Circle
                          x={placement.x + 15}
                          y={placement.y - 10}
                          radius={8}
                          fill="#dc2626"
                        />
                        <Text
                          x={placement.x + 10}
                          y={placement.y - 14}
                          text={placement.quantity.toString()}
                          fontSize={10}
                          fill="white"
                          fontStyle="bold"
                        />
                      </Group>
                    )}

                    {/* Spacing guides when selected */}
                    {isSelected && (
                      <Group>
                        <Circle
                          x={placement.x}
                          y={placement.y}
                          radius={radius + 20} // 20ft recommended spacing
                          stroke="#f59e0b"
                          strokeWidth={1}
                          dash={[2, 4]}
                          opacity={0.5}
                        />
                      </Group>
                    )}
                  </Group>
                );
              })}

              {/* Grid (optional) */}
              {zoom > 0.5 && (
                <Group>
                  {[...Array(Math.floor(canvasWidth / 50))].map((_, i) => (
                    <Line
                      key={`v-${i}`}
                      points={[i * 50, 0, i * 50, canvasHeight]}
                      stroke="#e2e8f0"
                      strokeWidth={1}
                      opacity={0.3}
                    />
                  ))}
                  {[...Array(Math.floor(canvasHeight / 50))].map((_, i) => (
                    <Line
                      key={`h-${i}`}
                      points={[0, i * 50, canvasWidth, i * 50]}
                      stroke="#e2e8f0"
                      strokeWidth={1}
                      opacity={0.3}
                    />
                  ))}
                </Group>
              )}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Properties panel */}
      <div className="w-64 space-y-4">
        {/* Legend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fire Zones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {zones.map(zone => (
              <div key={zone.id} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded border"
                  style={{ backgroundColor: zone.color }}
                />
                <span className="text-xs">{zone.name}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Selected plant properties */}
        {selectedId && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Plant Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const plant = placements.find(p => p.id === selectedId);
                if (!plant) return null;

                return (
                  <>
                    <div>
                      <label className="text-xs font-medium">Plant Name</label>
                      <Select
                        value={plant.plantName}
                        onValueChange={(value) => {
                          const newPlacements = placements.map(p =>
                            p.id === selectedId ? { ...p, plantName: value } : p
                          );
                          setPlacements(newPlacements);
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
                        value={plant.matureSize.toString()}
                        onValueChange={(value) => {
                          const newPlacements = placements.map(p =>
                            p.id === selectedId ? { ...p, matureSize: parseInt(value) } : p
                          );
                          setPlacements(newPlacements);
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
                        {zones.find(z => z.id === plant.zone)?.name || 'Unknown'}
                      </div>
                    </div>

                    <div className="text-xs text-neutral-500">
                      Position: {Math.round(plant.x)}, {Math.round(plant.y)}
                    </div>
                  </>
                );
              })()}
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
    </div>
  );
}