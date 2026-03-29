"use client";

import { 
  Move, 
  Hand,
  ZoomIn,
  ZoomOut,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CanvasToolbarProps {
  tool: string;
  setTool: (tool: string) => void;
  dragMode: boolean;
  setDragMode: (dragMode: boolean) => void;
  zoom: number;
  onZoom: (direction: 'in' | 'out') => void;
  placementsCount: number;
  selectedId: string | null;
  onDelete: () => void;
  readOnly?: boolean;
}

export function CanvasToolbar({
  tool,
  setTool,
  dragMode,
  setDragMode,
  zoom,
  onZoom,
  placementsCount,
  selectedId,
  onDelete,
  readOnly = false
}: CanvasToolbarProps) {
  return (
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
          onClick={() => onZoom('in')}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onZoom('out')}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <span className="text-sm text-neutral-600">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {placementsCount} plants
        </Badge>
        
        {selectedId && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}