"use client";

import { useState } from "react";
import { GpuHeatmap } from "@/components/gpu/GpuHeatmap";
import { GpuRidgeline } from "@/components/gpu/GpuRidgeline";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GpuHeatmapCell, GpuTimeSeries } from "@/data/gpu-data";

type ChartView = "heatmap" | "ridgeline";

interface GpuHeatmapRidgelineToggleProps {
  heatmapData: GpuHeatmapCell[];
  timeSeriesData: GpuTimeSeries[];
  view?: ChartView;
  className?: string;
  /** When true, renders its own Card wrapper (widget mode) */
  widget?: boolean;
}

export function GpuHeatmapRidgelineToggle({
  heatmapData,
  timeSeriesData,
  view: externalView,
  className,
  widget = false,
}: GpuHeatmapRidgelineToggleProps) {
  const [internalView, setInternalView] = useState<ChartView>("heatmap");
  const activeView = widget ? internalView : (externalView ?? internalView);

  const chart = (
    <div className="h-full">
      {activeView === "ridgeline" ? (
        <GpuRidgeline data={timeSeriesData} />
      ) : (
        <GpuHeatmap data={heatmapData} />
      )}
    </div>
  );

  if (!widget) {
    return <div className={cn("h-full", className)}>{chart}</div>;
  }

  return (
    <Card className={cn("border-border/40 h-full flex flex-col", className)}>
      <CardHeader className="pb-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">Utilization Distribution</CardTitle>
          <Tabs
            value={activeView}
            onValueChange={(v) => setInternalView(v as ChartView)}
          >
            <TabsList className="h-7">
              <TabsTrigger value="heatmap" className="text-xs px-2">
                Heatmap
              </TabsTrigger>
              <TabsTrigger value="ridgeline" className="text-xs px-2">
                Ridgeline
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {chart}
      </CardContent>
    </Card>
  );
}
