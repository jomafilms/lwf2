"use client";

import { Group, Rect, Text, Circle, Layer } from "react-konva";

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

interface PropertyBounds {
  width: number;
  height: number;
}

interface CanvasZoneLayerProps {
  propertyBounds: PropertyBounds;
  zones: Zone[];
  placements: PlantPlacement[];
  selectedId: string | null;
  scale: number;
  readOnly?: boolean;
  onPlantSelect: (id: string | null) => void;
  onPlantDrag: (id: string, newPos: { x: number; y: number }) => void;
}

export function CanvasZoneLayer({
  propertyBounds,
  zones,
  placements,
  selectedId,
  scale,
  readOnly = false,
  onPlantSelect,
  onPlantDrag
}: CanvasZoneLayerProps) {
  return (
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
        const radius = (placement.matureSize * scale) / 2;
        
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
              onClick={() => onPlantSelect(placement.id)}
              onDragMove={(e) => {
                onPlantDrag(placement.id, {
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
                  x={placement.x + 12}
                  y={placement.y - 12}
                  radius={8}
                  fill="#f59e0b"
                  stroke="white"
                  strokeWidth={1}
                />
                <Text
                  x={placement.x + 5}
                  y={placement.y - 17}
                  width={14}
                  text={placement.quantity.toString()}
                  fontSize={10}
                  align="center"
                  fill="white"
                  fontStyle="bold"
                />
              </Group>
            )}

            {/* Spacing indicators */}
            {isSelected && (
              <Circle
                x={placement.x}
                y={placement.y}
                radius={placement.matureSize * scale * 0.75}
                stroke="#f59e0b"
                strokeWidth={1}
                dash={[2, 4]}
                opacity={0.6}
              />
            )}
          </Group>
        );
      })}
    </Layer>
  );
}