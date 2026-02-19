"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

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
  return (
    <Card className="h-full py-3">
      <CardContent className="flex flex-col gap-1 px-3 h-full">
        <span className="text-xs text-muted-foreground truncate">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
        <div className="flex-1 min-h-0 mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--chart-1)"
                fill={`url(#spark-${label})`}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
