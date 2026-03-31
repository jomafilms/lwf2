"use client";

import { Palette } from "lucide-react";

interface PlantPlacement {
  id: string;
  name: string;
  x: number;
  y: number;
  zone: string;
  matureSize: number;
  quantity: number;
}

interface PlantLibraryPanelProps {
  placements: PlantPlacement[];
  zoom: number;
  showGrid: boolean;
  onPlantClick: (id: string) => void;
  selectedPlant?: string;
}

export function PlantLibraryPanel({
  placements,
  zoom,
  showGrid,
  onPlantClick,
  selectedPlant
}: PlantLibraryPanelProps) {
  return (
    <div
      className="relative bg-neutral-50 border-2 border-dashed border-neutral-200 overflow-hidden"
      style={{
        width: '100%',
        height: '400px',
        backgroundImage: showGrid 
          ? 'radial-gradient(circle, #ccc 1px, transparent 1px)'
          : undefined,
        backgroundSize: showGrid ? '20px 20px' : undefined,
      }}
    >
      {/* Zone backgrounds */}
      <div
        className="absolute rounded"
        style={{
          left: '20px',
          top: '20px',
          width: '120px',
          height: '120px',
          backgroundColor: '#ef444480',
          border: '2px solid #ef4444',
        }}
      />
      <div
        className="absolute text-xs font-medium text-red-700"
        style={{
          left: '25px',
          top: '25px',
        }}
      >
        Zone 0 (0-5ft)
      </div>

      <div
        className="absolute rounded"
        style={{
          left: '150px',
          top: '50px',
          width: '180px',
          height: '140px',
          backgroundColor: '#f59e0b80',
          border: '2px solid #f59e0b',
        }}
      />
      <div
        className="absolute text-xs font-medium text-orange-700"
        style={{
          left: '155px',
          top: '55px',
        }}
      >
        Zone 1 (5-30ft)
      </div>

      <div
        className="absolute rounded"
        style={{
          left: '340px',
          top: '30px',
          width: '220px',
          height: '180px',
          backgroundColor: '#22c55e80',
          border: '2px solid #22c55e',
        }}
      />
      <div
        className="absolute text-xs font-medium text-green-700"
        style={{
          left: '345px',
          top: '35px',
        }}
      >
        Zone 2 (30-100ft)
      </div>

      {/* Plant placements */}
      {placements.map(placement => {
        const matureRadius = placement.matureSize * 4 * (zoom / 100);
        const isSelected = selectedPlant === placement.id;
        
        return (
          <div key={placement.id}>
            {/* Mature size circle */}
            <div
              className="absolute rounded-full border-2 border-dashed opacity-50 pointer-events-none"
              style={{
                left: `${placement.x * (zoom / 100) - matureRadius}px`,
                top: `${placement.y * (zoom / 100) - matureRadius}px`,
                width: `${matureRadius * 2}px`,
                height: `${matureRadius * 2}px`,
                borderColor: isSelected ? '#3b82f6' : '#22c55e',
                backgroundColor: isSelected ? '#3b82f620' : '#22c55e20',
              }}
            />
            
            {/* Plant dot */}
            <div
              className={`absolute w-3 h-3 rounded-full border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                isSelected ? 'bg-blue-500' : 'bg-green-600'
              }`}
              style={{
                left: `${placement.x * (zoom / 100)}px`,
                top: `${placement.y * (zoom / 100)}px`,
              }}
              onClick={() => onPlantClick(placement.id)}
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
  );
}