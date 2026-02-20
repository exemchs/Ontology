"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SystemResourceGauge } from "@/data/system-resource-data";

interface ResourceStatProps {
  data: SystemResourceGauge;
  icon: LucideIcon;
  className?: string;
}

function getStatusColor(pct: number): string {
  if (pct > 85) return "text-[var(--status-critical)]";
  if (pct > 70) return "text-[var(--status-warning)]";
  return "text-[var(--status-healthy)]";
}

export function ResourceStat({ data, icon: Icon, className }: ResourceStatProps) {
  const pct = Math.round(data.percent);

  return (
    <div className={cn("flex items-center gap-3 px-1 py-2.5", className)}>
      {/* Left: icon + label + sub value */}
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-xs font-medium leading-none">{data.label}</p>
          <p className="text-[10px] text-muted-foreground tabular-nums mt-1">
            {data.used} / {data.total} {data.unit}
          </p>
        </div>
      </div>

      {/* Right: % number */}
      <span className={cn("ml-auto text-lg font-bold tabular-nums leading-none", getStatusColor(pct))}>
        {pct}%
      </span>
    </div>
  );
}
