"use client";

import { StatusDot } from "@/components/ds/StatusDot";
import type { Gpu } from "@/types";

interface GpuSummaryHeaderProps {
  gpus: Gpu[];
}

export function GpuSummaryHeader({ gpus }: GpuSummaryHeaderProps) {
  const avgUtilization =
    gpus.length > 0
      ? Math.round(gpus.reduce((sum, g) => sum + g.utilization, 0) / gpus.length)
      : 0;

  const status: "healthy" | "warning" | "critical" =
    avgUtilization >= 80 ? "critical" : avgUtilization >= 60 ? "warning" : "healthy";

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">{gpus.length} GPUs</span>
      <StatusDot status={status} label={`Avg ${avgUtilization}%`} />
    </div>
  );
}
