"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { GaugeData } from "@/types";

interface CollapsibleResourcePanelProps {
  gauges: GaugeData[];
  storageKey?: string;
}

function getBarColor(percentage: number): string {
  if (percentage > 85) return "bg-[var(--status-critical)]";
  if (percentage > 70) return "bg-[var(--status-warning)]";
  return "bg-[var(--status-healthy)]";
}

export function CollapsibleResourcePanel({
  gauges,
  storageKey = "resource-panel-collapsed",
}: CollapsibleResourcePanelProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored === "open") setOpen(true);
  }, [storageKey]);

  function handleToggle(next: boolean) {
    setOpen(next);
    localStorage.setItem(storageKey, next ? "open" : "closed");
  }

  const summary = gauges
    .map((g) => `${g.label} ${Math.round((g.value / g.max) * 100)}%`)
    .join(" · ");

  return (
    <Collapsible open={open} onOpenChange={handleToggle}>
      <div className="rounded-lg border border-border/40 bg-card">
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
              <span className="text-xs text-muted-foreground tabular-nums">
                {summary}
              </span>
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 pb-4">
            {gauges.map((gauge) => {
              const pct = Math.round((gauge.value / gauge.max) * 100);
              return (
                <div key={gauge.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{gauge.label}</span>
                    <span className="font-medium tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        getBarColor(pct)
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
