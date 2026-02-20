"use client";

import { useMemo, useState, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { timeFormat } from "d3-time-format";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { gpuConfig } from "@/lib/chart-configs";
import { TruncatedLegend, legendItemsFromConfig } from "@/components/charts/shared/TruncatedLegend";
import type { GpuTimeSeries, GpuMetricType } from "@/data/gpu-data";

const METRIC_UNITS: Record<GpuMetricType, string> = {
  utilization: "%",
  temperature: "\u00B0C",
  power: "W",
  memory: "GB",
};


interface GpuPerformanceTrendProps {
  series: GpuTimeSeries[];
  activeMetric?: GpuMetricType;
  className?: string;
}

export function GpuPerformanceTrend({
  series,
  activeMetric = "utilization",
  className,
}: GpuPerformanceTrendProps) {
  const [hiddenGpus, setHiddenGpus] = useState<Set<string>>(new Set());

  const formatTime = useMemo(() => timeFormat("%H:%M"), []);

  const data = useMemo(() => {
    const metricSeries = series.filter((s) => s.metric === activeMetric);
    if (!metricSeries.length) return [];

    const refSeries = metricSeries[0];
    return refSeries.data.map((point, i) => {
      const row: Record<string, number> = { time: point.time.getTime() };
      metricSeries.forEach((s) => {
        row[s.gpuName] = s.data[i]?.value ?? 0;
      });
      return row;
    });
  }, [series, activeMetric]);

  const gpuNames = useMemo(() => {
    const names = new Set<string>();
    series
      .filter((s) => s.metric === activeMetric)
      .forEach((s) => names.add(s.gpuName));
    return Array.from(names);
  }, [series, activeMetric]);

  const handleLegendClick = useCallback(
    (dataKey: string) => {
      setHiddenGpus((prev) => {
        const next = new Set(prev);
        if (next.has(dataKey)) {
          next.delete(dataKey);
        } else {
          // Keep at least one visible
          if (gpuNames.length - next.size > 1) {
            next.add(dataKey);
          }
        }
        return next;
      });
    },
    [gpuNames]
  );

  const legendItems = useMemo(
    () => legendItemsFromConfig(gpuConfig, gpuNames),
    [gpuNames]
  );

  if (!data.length) return null;

  const unit = METRIC_UNITS[activeMetric];

  return (
    <div className={cn("flex flex-col", className)}>
      <ChartContainer config={gpuConfig} className="flex-1 min-h-0 w-full">
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
            tickFormatter={(v) => `${v}${unit}`}
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
          {gpuNames.map((name) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={`var(--color-${name})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              hide={hiddenGpus.has(name)}
              strokeOpacity={hiddenGpus.has(name) ? 0.2 : 1}
            />
          ))}
        </LineChart>
      </ChartContainer>
      <TruncatedLegend
        items={legendItems}
        maxVisible={5}
        hidden={hiddenGpus}
        onToggle={handleLegendClick}
        autoHide
      />
    </div>
  );
}
