"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { gpuComparisonConfig } from "@/lib/chart-configs";
import type { GpuComparisonItem } from "@/data/gpu-data";

const TEMP_NORM_MAX = 90;

interface GpuComparisonBarProps {
  data: GpuComparisonItem[];
  className?: string;
}

export function GpuComparisonBar({ data, className }: GpuComparisonBarProps) {
  const chartData = useMemo(
    () =>
      data.map((gpu) => ({
        gpuName: gpu.gpuName,
        utilization: gpu.utilization,
        memory: gpu.memoryPercent,
        temperature: Math.min(100, (gpu.temperature / TEMP_NORM_MAX) * 100),
        power: gpu.powerPercent,
      })),
    [data]
  );

  return (
    <ChartContainer config={gpuComparisonConfig} className={className}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="gpuName"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          tickFormatter={(v) => `${v}%`}
          domain={[0, 100]}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="utilization" fill="var(--color-utilization)" radius={[2, 2, 0, 0]} />
        <Bar dataKey="memory" fill="var(--color-memory)" radius={[2, 2, 0, 0]} />
        <Bar dataKey="temperature" fill="var(--color-temperature)" radius={[2, 2, 0, 0]} />
        <Bar dataKey="power" fill="var(--color-power)" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
