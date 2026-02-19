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

  return (
    <Card className="h-full py-3">
      <CardContent className="flex flex-col items-center justify-center gap-2 px-3 h-full">
        <span className="text-xs text-muted-foreground font-medium">
          Today vs Yesterday
        </span>
        <div className="flex items-center gap-6">
          {/* Query count change */}
          <div className="flex flex-col items-center gap-0.5">
            <div
              className={`flex items-center gap-1 ${
                queryImproved ? "text-green-500" : "text-red-500"
              }`}
            >
              {queryImproved ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              <span className="text-sm font-bold tabular-nums">
                {queryCountChange >= 0 ? "+" : ""}
                {queryCountChange}%
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">Queries</span>
          </div>
          {/* Error count comparison */}
          <div className="flex flex-col items-center gap-0.5">
            <div
              className={`flex items-center gap-1 ${
                errorImproved ? "text-green-500" : "text-red-500"
              }`}
            >
              {errorImproved ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5" />
              )}
              <span className="text-sm font-bold tabular-nums">
                {errorCount}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              Errors ({errorCountYesterday} yday)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
