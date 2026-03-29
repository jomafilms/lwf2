"use client";

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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Tool = 'select' | 'plant' | 'move' | 'measure';

interface DesignerToolbarProps {
  selectedTool: Tool;
  onToolChange: (tool: Tool) => void;
  zoom: number;
  onZoomChange: (direction: 'in' | 'out') => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  totalPlants: number;
  selectedPlant: boolean;
  onDeleteSelected: () => void;
  onSave: () => void;
  onExport: () => void;
}

export function DesignerToolbar({
  selectedTool,
  onToolChange,
  zoom,
  onZoomChange,
  showGrid,
  onToggleGrid,
  totalPlants,
  selectedPlant,
  onDeleteSelected,
  onSave,
  onExport
}: DesignerToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Tool selection */}
        <div className="flex items-center gap-2">
          <Button
            variant={selectedTool === 'select' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolChange('select')}
          >
            <MousePointer className="h-4 w-4" />
          </Button>
          <Button
            variant={selectedTool === 'plant' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolChange('plant')}
          >
            <Palette className="h-4 w-4" />
          </Button>
          <Button
            variant={selectedTool === 'move' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolChange('move')}
          >
            <Move className="h-4 w-4" />
          </Button>
          <Button
            variant={selectedTool === 'measure' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolChange('measure')}
          >
            <Ruler className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-4 w-px bg-neutral-300" />

        {/* View controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onZoomChange('out')}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium w-12 text-center">
            {zoom}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onZoomChange('in')}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant={showGrid ? 'default' : 'outline'}
            size="sm"
            onClick={onToggleGrid}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {totalPlants} plants
        </Badge>
        
        {selectedPlant && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteSelected}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={onSave}>
          <Save className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}