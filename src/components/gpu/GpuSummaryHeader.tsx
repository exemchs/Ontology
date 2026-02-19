"use client";

import { Badge } from "@/components/ui/badge";
import type { Gpu } from "@/types";

interface GpuSummaryHeaderProps {
  gpus: Gpu[];
}

export function GpuSummaryHeader({ gpus }: GpuSummaryHeaderProps) {
  const avgUtilization =
    gpus.length > 0
      ? Math.round(
          gpus.reduce((sum, g) => sum + g.utilization, 0) / gpus.length
        )
      : 0;

  const utilizationColor =
    avgUtilization >= 80
      ? "bg-red-500/15 text-red-700 border-red-300 dark:text-red-400 dark:border-red-800"
      : avgUtilization >= 60
        ? "bg-amber-500/15 text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-800"
        : "bg-green-500/15 text-green-700 border-green-300 dark:text-green-400 dark:border-green-800";

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold tracking-tight">GPU Monitoring</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {gpus.length} GPUs
        </span>
        <Badge variant="outline" className={utilizationColor}>
          Avg {avgUtilization}%
        </Badge>
      </div>
    </div>
  );
}
