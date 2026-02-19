"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/charts/shared/ChartSkeleton";
import type { GpuTimeSeries } from "@/data/gpu-data";

interface GpuRidgelineProps {
  data: GpuTimeSeries[];
}

export function GpuRidgeline({ data: _data }: GpuRidgelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>GPU Utilization Density</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartSkeleton />
      </CardContent>
    </Card>
  );
}
