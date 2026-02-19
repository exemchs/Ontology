"use client";

import { useMemo } from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";

import { ChartContainer } from "@/components/ui/chart";
import type { GaugeData } from "@/types";
import { ChartEmpty } from "@/components/charts/shared/ChartEmpty";

interface ResourceGaugeProps {
  data: GaugeData;
  className?: string;
}

export function ResourceGauge({ data, className }: ResourceGaugeProps) {
  const chartData = useMemo(
    () => [{ value: data.value, fill: data.color }],
    [data.value, data.color]
  );

  const config = useMemo(
    () =>
      ({
        value: { label: data.label, color: data.color },
      }) satisfies ChartConfig,
    [data.label, data.color]
  );

  if (!data || data.value == null) {
    return <ChartEmpty message="No gauge data available" className={className} />;
  }

  const percentage = Math.round((data.value / data.max) * 100);

  return (
    <ChartContainer config={config} className={className}>
      <RadialBarChart
        data={chartData}
        startAngle={225}
        endAngle={-45}
        innerRadius="70%"
        outerRadius="100%"
        barSize={12}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, data.max]}
          angleAxisId={0}
          tick={false}
        />
        <RadialBar
          dataKey="value"
          cornerRadius={6}
          background={{ fill: "var(--muted)" }}
        />
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground text-2xl font-bold"
        >
          {percentage}%
        </text>
        <text
          x="50%"
          y="62%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted-foreground text-xs"
        >
          {data.label}
        </text>
      </RadialBarChart>
    </ChartContainer>
  );
}
