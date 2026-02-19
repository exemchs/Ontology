"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { GpuHeatmap } from "@/components/gpu/GpuHeatmap";
import { GpuRidgeline } from "@/components/gpu/GpuRidgeline";
import type { GpuHeatmapCell, GpuTimeSeries } from "@/data/gpu-data";

interface GpuHeatmapRidgelineToggleProps {
  heatmapData: GpuHeatmapCell[];
  timeSeriesData: GpuTimeSeries[];
}

export function GpuHeatmapRidgelineToggle({
  heatmapData,
  timeSeriesData,
}: GpuHeatmapRidgelineToggleProps) {
  const [showRidgeline, setShowRidgeline] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end gap-3">
        <span
          className={`text-sm ${!showRidgeline ? "font-medium" : "text-muted-foreground"}`}
        >
          Heatmap
        </span>
        <Switch checked={showRidgeline} onCheckedChange={setShowRidgeline} />
        <span
          className={`text-sm ${showRidgeline ? "font-medium" : "text-muted-foreground"}`}
        >
          Ridgeline
        </span>
      </div>
      {showRidgeline ? (
        <GpuRidgeline data={timeSeriesData} />
      ) : (
        <GpuHeatmap data={heatmapData} />
      )}
    </div>
  );
}
