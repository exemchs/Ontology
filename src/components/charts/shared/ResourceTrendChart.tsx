"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { timeFormat } from "d3-time-format";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { serverConfig } from "@/lib/chart-configs";
import type { ServerResourceTrend } from "@/data/system-resource-data";

interface ResourceTrendChartProps {
  title: string;
  series: ServerResourceTrend[];
  unit: string;
  syncId?: string;
  className?: string;
}

export function ResourceTrendChart({
  title,
  series,
  unit,
  syncId,
  className,
}: ResourceTrendChartProps) {
  const formatTime = useMemo(() => timeFormat("%H:%M"), []);

  // Recharts 형식으로 변환: { time, "Server-A": val, "Server-B": val, ... }
  const data = useMemo(() => {
    if (!series.length) return [];
    const refSeries = series[0];
    return refSeries.data.map((point, i) => {
      const row: Record<string, number> = { time: point.time.getTime() };
      series.forEach((s) => {
        row[s.serverName] = s.data[i]?.value ?? 0;
      });
      return row;
    });
  }, [series]);

  const serverNames = useMemo(
    () => series.map((s) => s.serverName),
    [series]
  );

  if (!data.length) return null;

  return (
    <div className={className}>
      <p className="text-[11px] font-medium text-foreground mb-1 ml-1">
        {title}
      </p>
      <ChartContainer config={serverConfig} className="h-[calc(100%-20px)] w-full">
        <AreaChart data={data} syncId={syncId} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickFormatter={(v) => formatTime(new Date(v))}
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            fontSize={9}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={2}
            fontSize={9}
            tickFormatter={(v) => `${v}`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="min-w-[10rem]"
                labelFormatter={(_, payload) => {
                  const ts = payload?.[0]?.payload?.time;
                  return ts ? formatTime(new Date(ts)) : "";
                }}
              />
            }
          />
          {serverNames.map((name) => (
            <Area
              key={name}
              type="monotone"
              dataKey={name}
              stroke={`var(--color-${name})`}
              fill={`var(--color-${name})`}
              fillOpacity={0.15}
              strokeWidth={1.5}
              dot={{ r: 2, strokeWidth: 0 }}
              activeDot={{ r: 3.5 }}
            />
          ))}
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
