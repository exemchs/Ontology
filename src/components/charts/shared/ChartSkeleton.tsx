"use client";

import { cn } from "@/lib/utils";

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full h-full min-h-[200px] rounded-lg",
        "bg-muted animate-pulse",
        "flex items-center justify-center",
        className
      )}
      data-testid="chart-skeleton"
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <div className="h-8 w-8 rounded-full bg-muted-foreground/20 animate-pulse" />
        <span className="text-xs">Loading chart...</span>
      </div>
    </div>
  );
}
