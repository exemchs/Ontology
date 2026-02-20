"use client";

import Link from "next/link";
import { Gpu, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface GpuSummaryWidgetProps {
  active: number;
  idle: number;
  error: number;
}

export default function GpuSummaryWidget({
  active,
  idle,
  error,
}: GpuSummaryWidgetProps) {
  const total = active + idle + error;
  const activePct = total > 0 ? (active / total) * 100 : 0;
  const idlePct = total > 0 ? (idle / total) * 100 : 0;
  const errorPct = total > 0 ? (error / total) * 100 : 0;

  return (
    <Card className="h-full py-3">
      <CardContent className="flex flex-col items-center justify-center gap-2 px-3 h-full">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Gpu className="h-4 w-4" />
          <span className="text-xs font-medium">GPU Status</span>
        </div>

        {/* Stacked ratio bar */}
        <div className="w-full h-2 rounded-full overflow-hidden flex bg-muted">
          {activePct > 0 && (
            <div
              className="h-full bg-[var(--status-healthy)] transition-all"
              style={{ width: `${activePct}%` }}
            />
          )}
          {idlePct > 0 && (
            <div
              className="h-full bg-muted-foreground/30 transition-all"
              style={{ width: `${idlePct}%` }}
            />
          )}
          {errorPct > 0 && (
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${errorPct}%` }}
            />
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--status-healthy)]" />
              <span className="text-lg font-bold tabular-nums">{active}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Active</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
              <span className="text-lg font-bold text-muted-foreground tabular-nums">
                {idle}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">Idle</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-lg font-bold text-red-500 tabular-nums">
                {error}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">Error</span>
          </div>
        </div>
        <Link
          href="/monitoring/gpu"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          GPU Monitoring <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
