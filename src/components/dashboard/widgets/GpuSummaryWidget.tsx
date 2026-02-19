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
  return (
    <Card className="h-full py-3">
      <CardContent className="flex flex-col items-center justify-center gap-2 px-3 h-full">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Gpu className="h-4 w-4" />
          <span className="text-xs font-medium">GPU Status</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-green-500 tabular-nums">
              {active}
            </span>
            <span className="text-[10px] text-muted-foreground">Active</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-muted-foreground tabular-nums">
              {idle}
            </span>
            <span className="text-[10px] text-muted-foreground">Idle</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-red-500 tabular-nums">
              {error}
            </span>
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
