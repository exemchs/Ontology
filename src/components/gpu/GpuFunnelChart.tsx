"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { GpuFunnelStage } from "@/data/gpu-data";

// ── Types ────────────────────────────────────────────────────────────────────

interface GpuFunnelChartProps {
  stages: GpuFunnelStage[];
}

// ── Chart colors mapped to CSS variables ─────────────────────────────────────

const stageColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

// ── Component ────────────────────────────────────────────────────────────────

export function GpuFunnelChart({ stages }: GpuFunnelChartProps) {
  const maxValue = Math.max(...stages.map((s) => s.value), 1);

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">GPU Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-1">
          {stages.map((stage, i) => {
            const widthPercent = (stage.value / maxValue) * 100;
            const color = stageColors[i % stageColors.length];

            return (
              <div
                key={stage.label}
                className="relative flex items-center justify-center py-2.5 text-white text-sm font-medium transition-all"
                style={{
                  width: `${widthPercent}%`,
                  minWidth: "120px",
                  backgroundColor: color,
                  clipPath:
                    "polygon(5% 0, 95% 0, 100% 100%, 0% 100%)",
                }}
              >
                <span className="relative z-10 text-xs font-semibold drop-shadow-sm">
                  {stage.label}: {stage.value}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Total &gt; Allocated &gt; Active &gt; Effective
        </p>
      </CardContent>
    </Card>
  );
}
