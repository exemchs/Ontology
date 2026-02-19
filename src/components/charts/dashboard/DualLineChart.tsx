"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { timeFormat } from "d3-time-format";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { timeSeriesConfig } from "@/lib/chart-configs";
import { getDashboardTimeSeries } from "@/data/dashboard-data";

type Interval = "hourly" | "daily";

interface DualLineChartProps {
  interval?: Interval;
  className?: string;
}

export function DualLineChart({ interval = "hourly", className }: DualLineChartProps) {
  const data = useMemo(() => {
    const series = getDashboardTimeSeries(interval);
    if (!series.length || !series[0].data.length) return [];

    // Flatten to Recharts format: [{time, requestRate, queryQps}, ...]
    return series[0].data.map((point, i) => ({
      time: point.time.getTime(),
      requestRate: point.value,
      queryQps: series[1]?.data[i]?.value ?? 0,
    }));
  }, [interval]);

  const formatTime = useMemo(() => {
    const fmt = interval === "daily" ? "%m/%d %H:%M" : "%H:%M";
    return timeFormat(fmt);
  }, [interval]);

  if (!data.length) return null;

  return (
    <ChartContainer config={timeSeriesConfig} className={className}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          tickFormatter={(v) => formatTime(new Date(v))}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          tickFormatter={(v) =>
            v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v)
          }
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const ts = payload?.[0]?.payload?.time;
                return ts ? formatTime(new Date(ts)) : "";
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="requestRate"
          stroke="var(--color-requestRate)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="queryQps"
          stroke="var(--color-queryQps)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
