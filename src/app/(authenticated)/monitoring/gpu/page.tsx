"use client";

import { useState, useMemo } from "react";

import { PageShell } from "@/components/ds/PageShell";
import { GpuSummaryHeader } from "@/components/gpu/GpuSummaryHeader";
import { GpuCardGrid } from "@/components/gpu/GpuCardGrid";
import { GpuPerformanceTrend } from "@/components/gpu/GpuPerformanceTrend";
import { GpuHeatmapRidgelineToggle } from "@/components/gpu/GpuHeatmapRidgelineToggle";
import { GpuComparisonBar } from "@/components/gpu/GpuComparisonBar";
import { GpuHealthIssues } from "@/components/gpu/GpuHealthIssues";
import { GpuProcessesTable } from "@/components/gpu/GpuProcessesTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getGpuCards,
  getGpuTimeSeries,
  getGpuHeatmap,
  getGpuComparison,
  getGpuHealthIssues,
  getGpuProcesses,
} from "@/data/gpu-data";
import type { GpuMetricType } from "@/data/gpu-data";

type HeatmapView = "heatmap" | "ridgeline";

export default function GpuPage() {
  const [activeMetric, setActiveMetric] = useState<GpuMetricType>("utilization");
  const [heatmapView, setHeatmapView] = useState<HeatmapView>("heatmap");

  const gpus = useMemo(() => getGpuCards(), []);
  const timeSeries = useMemo(() => getGpuTimeSeries(), []);
  const heatmapData = useMemo(() => getGpuHeatmap(), []);
  const comparisonData = useMemo(() => getGpuComparison(), []);
  const healthIssues = useMemo(() => getGpuHealthIssues(), []);
  const processes = useMemo(() => getGpuProcesses(), []);

  return (
    <PageShell
      title="GPU Monitoring"
      description="Real-time GPU performance and health overview"
    >
      <GpuSummaryHeader gpus={gpus} />
      <GpuCardGrid gpus={gpus} />

      {/* Performance Trends */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">Performance Trends</CardTitle>
            <Tabs
              value={activeMetric}
              onValueChange={(v) => setActiveMetric(v as GpuMetricType)}
            >
              <TabsList className="h-7">
                <TabsTrigger value="utilization" className="text-xs px-2">
                  Utilization
                </TabsTrigger>
                <TabsTrigger value="temperature" className="text-xs px-2">
                  Temperature
                </TabsTrigger>
                <TabsTrigger value="power" className="text-xs px-2">
                  Power
                </TabsTrigger>
                <TabsTrigger value="memory" className="text-xs px-2">
                  Memory
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <GpuPerformanceTrend
            series={timeSeries}
            activeMetric={activeMetric}
            className="aspect-[16/7]"
          />
        </CardContent>
      </Card>

      {/* Utilization Heatmap / Ridgeline */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">Utilization Distribution</CardTitle>
            <Tabs
              value={heatmapView}
              onValueChange={(v) => setHeatmapView(v as HeatmapView)}
            >
              <TabsList className="h-7">
                <TabsTrigger value="heatmap" className="text-xs px-2">
                  Heatmap
                </TabsTrigger>
                <TabsTrigger value="ridgeline" className="text-xs px-2">
                  Ridgeline
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <GpuHeatmapRidgelineToggle
            heatmapData={heatmapData}
            timeSeriesData={timeSeries}
            view={heatmapView}
          />
        </CardContent>
      </Card>

      {/* GPU Comparison */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">GPU Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <GpuComparisonBar data={comparisonData} className="aspect-[16/9]" />
        </CardContent>
      </Card>

      {/* Health + Processes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <GpuHealthIssues issues={healthIssues} />
        <GpuProcessesTable processes={processes} />
      </div>
    </PageShell>
  );
}
