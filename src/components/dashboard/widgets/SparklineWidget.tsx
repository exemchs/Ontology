"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SparklineDataPoint {
  time: string;
  value: number;
}

interface SparklineWidgetProps {
  label: string;
  value: number;
  unit: string;
  data: SparklineDataPoint[];
}

export default function SparklineWidget({
  label,
  value,
  unit,
  data,
}: SparklineWidgetProps) {
  const changePercent = useMemo(() => {
    if (data.length < 2) return 0;
    const first = data[0].value;
    const last = data[data.length - 1].value;
    if (first === 0) return 0;
    return Math.round(((last - first) / first) * 100);
  }, [data]);

  const isUp = changePercent >= 0;

  return (
    <Card className="h-full py-3">
      <CardContent className="flex flex-col gap-1 px-3 h-full">
        <span className="text-xs text-muted-foreground truncate">{label}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
          <span className="text-xs text-muted-foreground">{unit}</span>
          <span
            className={`ml-auto inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
              isUp
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {isUp ? (
              <TrendingUp className="h-2.5 w-2.5" />
            ) : (
              <TrendingDown className="h-2.5 w-2.5" />
            )}
            {changePercent > 0 ? "+" : ""}
            {changePercent}%
          </span>
        </div>
        <div className="flex-1 min-h-0 mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id={`spark-${label}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const v = payload[0].value as number;
                  return (
                    <div className="rounded-md border bg-popover px-2 py-1 text-xs shadow-sm">
                      <span className="tabular-nums font-medium">
                        {v.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground ml-1">{unit}</span>
                    </div>
                  );
                }}
                cursor={{ stroke: "var(--chart-1)", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--chart-1)"
                fill={`url(#spark-${label})`}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 2.5, fill: "var(--chart-1)" }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
