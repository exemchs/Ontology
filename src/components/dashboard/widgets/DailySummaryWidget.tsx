"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DailySummaryWidgetProps {
  queryCountChange: number;
  errorCount: number;
  errorCountYesterday: number;
}

export default function DailySummaryWidget({
  queryCountChange,
  errorCount,
  errorCountYesterday,
}: DailySummaryWidgetProps) {
  const errorDelta = errorCount - errorCountYesterday;
  const errorImproved = errorDelta <= 0;
  const queryImproved = queryCountChange >= 0;

  // Comparison bar widths (normalized to max of today vs yesterday)
  const errorMax = Math.max(errorCount, errorCountYesterday, 1);
  const todayPct = (errorCount / errorMax) * 100;
  const yesterdayPct = (errorCountYesterday / errorMax) * 100;

  return (
    <Card className="h-full py-3">
      <CardContent className="flex flex-col items-center justify-center gap-2 px-3 h-full">
        <span className="text-xs text-muted-foreground font-medium">
          Today vs Yesterday
        </span>
        <div className="flex items-center gap-6">
          {/* Query count change */}
          <div className="flex flex-col items-center gap-0.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                queryImproved
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {queryImproved ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {queryCountChange >= 0 ? "+" : ""}
              {queryCountChange}%
            </span>
            <span className="text-[10px] text-muted-foreground">Queries</span>
          </div>
          {/* Error count comparison */}
          <div className="flex flex-col items-center gap-1">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                errorImproved
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {errorImproved ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              {errorCount}
            </span>
            {/* Mini comparison bar */}
            <div className="w-16 flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                <div
                  className={`h-1 rounded-full ${
                    errorImproved ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: `${todayPct}%` }}
                />
                <span className="text-[8px] text-muted-foreground">today</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="h-1 rounded-full bg-muted-foreground/30"
                  style={{ width: `${yesterdayPct}%` }}
                />
                <span className="text-[8px] text-muted-foreground">yday</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
