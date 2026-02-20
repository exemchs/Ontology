"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { timeFormat } from "d3-time-format";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { thresholdConfig } from "@/lib/chart-configs";

interface ThresholdDataPoint {
  time: string;
  value: number;
}

interface ThresholdWidgetProps {
  label: string;
  data: ThresholdDataPoint[];
  warningThreshold: number;
  criticalThreshold: number;
}

export default function ThresholdWidget({
  label,
  data,
  warningThreshold,
  criticalThreshold,
}: ThresholdWidgetProps) {
  const formatTime = useMemo(() => timeFormat("%H:%M"), []);

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        time: new Date(d.time).getTime(),
        latency: d.value,
      })),
    [data]
  );

  return (
    <Card className="h-full py-2">
      <CardHeader className="px-3 py-1">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-2 flex-1 min-h-0">
        <ChartContainer config={thresholdConfig} className="h-full w-full">
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
                  formatter={(value) => [`${value} ms`, "Latency"]}
                />
              }
            />
            <ReferenceLine
              y={warningThreshold}
              stroke="#f59e0b"
              strokeDasharray="4 3"
              strokeWidth={1}
            />
            <ReferenceLine
              y={criticalThreshold}
              stroke="#ef4444"
              strokeDasharray="4 3"
              strokeWidth={1}
            />
            <defs>
              <linearGradient id="thresholdFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-latency)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-latency)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="latency"
              stroke="var(--color-latency)"
              fill="url(#thresholdFill)"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
