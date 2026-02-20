"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { timeFormat } from "d3-time-format";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TruncatedLegend,
  legendItemsFromConfig,
} from "@/components/charts/shared/TruncatedLegend";

interface TrendDataPoint {
  time: string;
  value: number;
}

interface TrendSeries {
  name: string;
  data: TrendDataPoint[];
}

interface TrendChartWidgetProps {
  label: string;
  series: TrendSeries[];
  config: ChartConfig;
}

export default function TrendChartWidget({
  label,
  series,
  config,
}: TrendChartWidgetProps) {
  const formatTime = useMemo(() => timeFormat("%H:%M"), []);

  const seriesNames = useMemo(() => series.map((s) => s.name), [series]);

  const chartData = useMemo(() => {
    if (!series.length || !series[0].data.length) return [];
    return series[0].data.map((_, i) => {
      const row: Record<string, number> = {
        time: new Date(series[0].data[i].time).getTime(),
      };
      series.forEach((s) => {
        row[s.name] = s.data[i]?.value ?? 0;
      });
      return row;
    });
  }, [series]);

  const legendItems = useMemo(
    () => legendItemsFromConfig(config, seriesNames),
    [config, seriesNames]
  );

  return (
    <Card className="group h-full py-2">
      <CardHeader className="px-3 py-1">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-2 flex-1 min-h-0 flex flex-col">
        <ChartContainer config={config} className="flex-1 min-h-0 w-full">
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickFormatter={(v) => formatTime(new Date(v))}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              style={{ fontSize: 9 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              style={{ fontSize: 9 }}
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
            {seriesNames.map((name) => (
              <Area
                key={name}
                type="monotone"
                dataKey={name}
                stroke={`var(--color-${name})`}
                fill={`var(--color-${name})`}
                fillOpacity={0.15}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3 }}
              />
            ))}
          </AreaChart>
        </ChartContainer>
        <TruncatedLegend items={legendItems} maxVisible={4} autoHide />
      </CardContent>
    </Card>
  );
}
