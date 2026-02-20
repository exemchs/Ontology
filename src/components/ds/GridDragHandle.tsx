"use client";

import { GripHorizontal } from "lucide-react";

export function GridDragHandle() {
  return (
    <div
      className="grid-drag-handle absolute top-1 left-1/2 -translate-x-1/2 z-10
        p-0.5 rounded text-muted-foreground/40 hover:text-muted-foreground/70
        cursor-grab active:cursor-grabbing"
    >
      <GripHorizontal className="h-3.5 w-3.5" />
    </div>
  );
}
