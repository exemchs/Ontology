"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardWidgetProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
}

const trendConfig = {
  up: { icon: TrendingUp, color: "text-green-500" },
  down: { icon: TrendingDown, color: "text-red-500" },
  flat: { icon: Minus, color: "text-muted-foreground" },
};

export default function MetricCardWidget({
  label,
  value,
  trend,
  trendValue,
}: MetricCardWidgetProps) {
  const TrendIcon = trend ? trendConfig[trend].icon : null;
  const trendColor = trend ? trendConfig[trend].color : "";

  return (
    <Card className="h-full py-3">
      <CardContent className="flex flex-col items-center justify-center gap-1 px-3 h-full">
        <span className="text-2xl font-bold tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        <span className="text-xs text-muted-foreground truncate w-full text-center">
          {label}
        </span>
        {trend && TrendIcon && (
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            {trendValue && (
              <span className="text-[10px] font-medium">{trendValue}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
