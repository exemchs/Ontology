"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { typeDistributionConfig } from "@/lib/chart-configs";
import { getTypeDistribution } from "@/data/studio-data";
import { cn } from "@/lib/utils";

type BarMode = "stacked" | "grouped";

interface TypeDistributionChartProps {
  className?: string;
}

export function TypeDistributionChart({ className }: TypeDistributionChartProps) {
  const [barMode, setBarMode] = useState<BarMode>("stacked");
  const data = useMemo(() => getTypeDistribution(), []);

  const formatNumber = (v: number) => {
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return String(v);
  };

  return (
    <div
      className={cn("relative flex flex-col w-full h-full min-h-[200px]", className)}
      data-testid="type-distribution-chart"
    >
      {/* Header row: toggle */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1 shrink-0">
        <Tabs value={barMode} onValueChange={(v) => setBarMode(v as BarMode)}>
          <TabsList className="h-7">
            <TabsTrigger value="stacked" className="text-xs px-2">
              Stacked
            </TabsTrigger>
            <TabsTrigger value="grouped" className="text-xs px-2">
              Grouped
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 px-3 pb-3">
        <ChartContainer config={typeDistributionConfig} className="h-full w-full">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-35}
              textAnchor="end"
              height={50}
              fontSize={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tickFormatter={formatNumber}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="records"
              stackId={barMode === "stacked" ? "distribution" : undefined}
              fill="var(--color-records)"
              radius={barMode === "stacked" ? [0, 0, 0, 0] : [2, 2, 0, 0]}
            />
            <Bar
              dataKey="queries"
              stackId={barMode === "stacked" ? "distribution" : undefined}
              fill="var(--color-queries)"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
