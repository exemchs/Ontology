"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { getDgraphShards } from "@/data/dgraph-data";
import { cn } from "@/lib/utils";

const SHARD_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];

interface ShardBarChartProps {
  className?: string;
}

export function ShardBarChart({ className }: ShardBarChartProps) {
  const shardData = useMemo(() => getDgraphShards(), []);

  // Collect all unique shard names
  const allShardNames = useMemo(() => {
    const names = new Set<string>();
    shardData.forEach((group) => {
      group.shards.forEach((s) => names.add(s.name));
    });
    return Array.from(names);
  }, [shardData]);

  // Build chart config from shard names
  const config = useMemo(() => {
    const cfg: ChartConfig = {};
    allShardNames.forEach((name, i) => {
      cfg[name] = {
        label: name,
        color: SHARD_COLORS[i % SHARD_COLORS.length],
      };
    });
    return cfg;
  }, [allShardNames]);

  // Flatten to Recharts format: [{group, Equipment: 832, Process: 24500, ...}, ...]
  const chartData = useMemo(
    () =>
      shardData.map((group) => {
        const row: Record<string, string | number> = { group: group.group };
        group.shards.forEach((s) => {
          row[s.name] = s.size;
        });
        return row;
      }),
    [shardData]
  );

  const formatNumber = (v: number) => {
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return String(v);
  };

  return (
    <ChartContainer config={config} className={cn("aspect-[16/9]", className)}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="group"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          tickFormatter={formatNumber}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {allShardNames.map((name) => (
          <Bar
            key={name}
            dataKey={name}
            fill={`var(--color-${name})`}
            radius={[2, 2, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
