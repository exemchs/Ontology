"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/charts/shared/ChartSkeleton";
import type { GpuComparisonItem } from "@/data/gpu-data";

interface GpuComparisonBarProps {
  data: GpuComparisonItem[];
}

export function GpuComparisonBar({ data: _data }: GpuComparisonBarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>GPU Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartSkeleton />
      </CardContent>
    </Card>
  );
}
