"use client";

import { GpuHeatmap } from "@/components/gpu/GpuHeatmap";
import { GpuRidgeline } from "@/components/gpu/GpuRidgeline";
import { cn } from "@/lib/utils";
import type { GpuHeatmapCell, GpuTimeSeries } from "@/data/gpu-data";

type ChartView = "heatmap" | "ridgeline";

interface GpuHeatmapRidgelineToggleProps {
  heatmapData: GpuHeatmapCell[];
  timeSeriesData: GpuTimeSeries[];
  view?: ChartView;
  className?: string;
}

export function GpuHeatmapRidgelineToggle({
  heatmapData,
  timeSeriesData,
  view = "heatmap",
  className,
}: GpuHeatmapRidgelineToggleProps) {
  return (
    <div className={cn("h-full", className)}>
      {view === "ridgeline" ? (
        <GpuRidgeline data={timeSeriesData} />
      ) : (
        <GpuHeatmap data={heatmapData} />
      )}
    </div>
  );
}
