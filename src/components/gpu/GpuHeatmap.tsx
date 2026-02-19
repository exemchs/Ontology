"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/charts/shared/ChartSkeleton";
import type { GpuHeatmapCell } from "@/data/gpu-data";

interface GpuHeatmapProps {
  data: GpuHeatmapCell[];
}

export function GpuHeatmap({ data: _data }: GpuHeatmapProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>GPU Utilization Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartSkeleton />
      </CardContent>
    </Card>
  );
}
