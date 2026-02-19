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
import { resourceConfig } from "@/lib/chart-configs";
import { getDashboardResourceBars } from "@/data/dashboard-data";

type BarLayout = "stacked" | "grouped";

interface ResourceBarChartProps {
  layout?: BarLayout;
  className?: string;
}

export function ResourceBarChart({ layout = "stacked", className }: ResourceBarChartProps) {
  const data = useMemo(() => getDashboardResourceBars(), []);

  return (
    <ChartContainer config={resourceConfig} className={className}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          angle={-45}
          textAnchor="end"
          height={60}
          fontSize={10}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          tickFormatter={(v) => `${v}%`}
        />
        <ChartTooltip
          content={<ChartTooltipContent />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="cpu"
          stackId={layout === "stacked" ? "resources" : undefined}
          fill="var(--color-cpu)"
          radius={layout === "stacked" ? [0, 0, 0, 0] : [2, 2, 0, 0]}
        />
        <Bar
          dataKey="memory"
          stackId={layout === "stacked" ? "resources" : undefined}
          fill="var(--color-memory)"
          radius={layout === "stacked" ? [0, 0, 0, 0] : [2, 2, 0, 0]}
        />
        <Bar
          dataKey="disk"
          stackId={layout === "stacked" ? "resources" : undefined}
          fill="var(--color-disk)"
          radius={layout === "stacked" ? [2, 2, 0, 0] : [2, 2, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
