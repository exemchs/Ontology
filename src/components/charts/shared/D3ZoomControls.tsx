"use client";

import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface D3ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToView: () => void;
}

export function D3ZoomControls({
  onZoomIn,
  onZoomOut,
  onFitToView,
}: D3ZoomControlsProps) {
  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        size="icon"
        className="size-7 bg-background/80 backdrop-blur-sm"
        onClick={onZoomIn}
        title="Zoom In"
      >
        <ZoomIn className="size-3.5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="size-7 bg-background/80 backdrop-blur-sm"
        onClick={onZoomOut}
        title="Zoom Out"
      >
        <ZoomOut className="size-3.5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="size-7 bg-background/80 backdrop-blur-sm"
        onClick={onFitToView}
        title="Fit to View"
      >
        <Maximize2 className="size-3.5" />
      </Button>
    </div>
  );
}
