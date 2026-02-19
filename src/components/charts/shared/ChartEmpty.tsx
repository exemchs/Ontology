"use client";

import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChartEmpty({
  message = "No data available",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full h-full min-h-[200px] rounded-lg",
        "border border-dashed border-border",
        "flex items-center justify-center",
        className
      )}
      data-testid="chart-empty"
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <BarChart3 className="h-8 w-8 opacity-50" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}
