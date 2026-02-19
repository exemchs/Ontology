"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/charts/shared/ChartSkeleton";
import type { GpuTimeSeries } from "@/data/gpu-data";

interface GpuPerformanceTrendProps {
  series: GpuTimeSeries[];
}

export function GpuPerformanceTrend({ series: _series }: GpuPerformanceTrendProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartSkeleton />
      </CardContent>
    </Card>
  );
}
