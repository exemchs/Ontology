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
  up: {
    icon: TrendingUp,
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
    cardBg: "bg-green-500/5",
  },
  down: {
    icon: TrendingDown,
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    cardBg: "bg-red-500/5",
  },
  flat: {
    icon: Minus,
    text: "text-muted-foreground",
    bg: "bg-muted",
    cardBg: "",
  },
};

export default function MetricCardWidget({
  label,
  value,
  trend,
  trendValue,
}: MetricCardWidgetProps) {
  const cfg = trend ? trendConfig[trend] : null;
  const TrendIcon = cfg?.icon ?? null;

  return (
    <Card className={`h-full py-3 ${cfg?.cardBg ?? ""}`}>
      <CardContent className="flex flex-col items-center justify-center gap-1 px-3 h-full">
        <span className="text-xs text-muted-foreground truncate w-full text-center">
          {label}
        </span>
        <span className="text-2xl font-bold tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {trend && cfg && TrendIcon && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.text} ${cfg.bg}`}
          >
            <TrendIcon className="h-3 w-3" />
            {trendValue}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
