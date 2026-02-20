// src/components/ds/SystemResourcePanel.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { ChevronRight, Cpu, MemoryStick, HardDrive } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatusDot } from "@/components/ds/StatusDot";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ResourceStat } from "@/components/ds/ResourceStat";
import { ResourceTrendChart } from "@/components/charts/shared/ResourceTrendChart";
import { TruncatedLegend, legendItemsFromConfig } from "@/components/charts/shared/TruncatedLegend";
import { serverConfig } from "@/lib/chart-configs";
import type { SystemResourceGauge, SystemResourceTrends } from "@/data/system-resource-data";

interface SystemResourcePanelProps {
  gauges: SystemResourceGauge[];
  trends: SystemResourceTrends;
  storageKey?: string;
}

export function SystemResourcePanel({
  gauges,
  trends,
  storageKey = "system-resource-panel",
}: SystemResourcePanelProps) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored === "closed") setOpen(false);
  }, [storageKey]);

  function handleToggle(next: boolean) {
    setOpen(next);
    localStorage.setItem(storageKey, next ? "open" : "closed");
  }

  const gaugeIcons: Record<string, LucideIcon> = {
    CPU: Cpu,
    Memory: MemoryStick,
    Disk: HardDrive,
  };

  const legendItems = useMemo(
    () => legendItemsFromConfig(serverConfig, trends.cpu.map((s) => s.serverName)),
    [trends.cpu]
  );

  function getStatus(pct: number): "healthy" | "warning" | "critical" {
    if (pct > 85) return "critical";
    if (pct > 70) return "warning";
    return "healthy";
  }

  return (
    <Collapsible open={open} onOpenChange={handleToggle}>
      <div className="group rounded-lg border border-border/40 bg-card">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <ChevronRight
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                open && "rotate-90"
              )}
            />
            <span className="font-medium">System Resources</span>
            {!open && (
              <div className="flex items-center gap-4">
                {gauges.map((g) => {
                  const pct = Math.round(g.percent);
                  return (
                    <span key={g.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {g.label}
                      <StatusDot status={getStatus(pct)} />
                      <span className="tabular-nums font-medium">{pct}%</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <div className="flex items-stretch gap-4">
              {/* Left: compact resource stats */}
              <div className="flex flex-col justify-center shrink-0" style={{ width: 160 }}>
                {gauges.map((gauge) => (
                  <ResourceStat key={gauge.label} data={gauge} icon={gaugeIcons[gauge.label] ?? Cpu} />
                ))}
              </div>

              {/* Vertical divider */}
              <div className="w-px self-stretch bg-border/40" />

              {/* Right: trend charts */}
              <div className="grid grid-cols-3 gap-2 flex-1 min-w-0">
                <ResourceTrendChart
                  title="CPU"
                  series={trends.cpu}
                  unit="Cores"
                  syncId="system-resource"
                  className="w-full h-[160px]"
                />
                <ResourceTrendChart
                  title="Memory"
                  series={trends.memory}
                  unit="GB"
                  syncId="system-resource"
                  className="w-full h-[160px]"
                />
                <ResourceTrendChart
                  title="Disk"
                  series={trends.disk}
                  unit="GB"
                  syncId="system-resource"
                  className="w-full h-[160px]"
                />
              </div>
            </div>
            <TruncatedLegend items={legendItems} maxVisible={5} autoHide />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
