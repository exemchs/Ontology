"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: number;
  unit: string;
  change: number;
  changeLabel: string;
}

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function MetricCard({
  label,
  value,
  unit,
  change,
  changeLabel,
}: MetricCardProps) {
  const TrendIcon =
    change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const trendColor =
    change > 0
      ? "text-green-500"
      : change < 0
        ? "text-red-500"
        : "text-muted-foreground";
  const changeText =
    change > 0
      ? `+${change.toFixed(1)}%`
      : change < 0
        ? `${change.toFixed(1)}%`
        : "0%";

  return (
    <Card data-testid={`metric-card-${toKebabCase(label)}`}>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-bold">
            {value.toLocaleString()}
          </span>
          {unit && (
            <span className="text-sm text-muted-foreground">{unit}</span>
          )}
        </div>
        <div className={`mt-2 flex items-center gap-1.5 text-sm ${trendColor}`}>
          <TrendIcon className="h-4 w-4" />
          <span className="font-medium">{changeText}</span>
          <span className="text-muted-foreground">{changeLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}
