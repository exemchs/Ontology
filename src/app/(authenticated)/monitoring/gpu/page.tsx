"use client";

import { useState, useMemo, useCallback } from "react";
import { Settings2 } from "lucide-react";

import { PageShell } from "@/components/ds/PageShell";
import { SystemResourcePanel } from "@/components/ds/SystemResourcePanel";
import { getSystemResourceGauges, getSystemResourceTrends } from "@/data/system-resource-data";
import { GpuSummaryHeader } from "@/components/gpu/GpuSummaryHeader";
import { GpuCardGrid } from "@/components/gpu/GpuCardGrid";
import { GpuFunnelChart } from "@/components/gpu/GpuFunnelChart";
import { GpuPerformanceTrend } from "@/components/gpu/GpuPerformanceTrend";
import { GpuHeatmapRidgelineToggle } from "@/components/gpu/GpuHeatmapRidgelineToggle";
import { GpuComparisonBar } from "@/components/gpu/GpuComparisonBar";
import { GpuHealthIssues } from "@/components/gpu/GpuHealthIssues";
import { GpuProcessesTable } from "@/components/gpu/GpuProcessesTable";
import { GpuDetailPanel } from "@/components/gpu/GpuDetailPanel";
import { GpuThresholdForm } from "@/components/gpu/GpuThresholdForm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  getGpuCards,
  getGpuTimeSeries,
  getGpuHeatmap,
  getGpuComparison,
  getGpuHealthIssues,
  getGpuProcesses,
  getGpuFunnelData,
  getGpuDetailData,
} from "@/data/gpu-data";
import type { GpuMetricType } from "@/data/gpu-data";

type HeatmapView = "heatmap" | "ridgeline";

export default function GpuPage() {
  const [activeMetric, setActiveMetric] = useState<GpuMetricType>("utilization");
  const [heatmapView, setHeatmapView] = useState<HeatmapView>("heatmap");
  const [selectedGpu, setSelectedGpu] = useState<number | null>(null);
  const [comparisonGpus, setComparisonGpus] = useState<number[]>([]);
  const [showThresholds, setShowThresholds] = useState(false);

  const gpus = useMemo(() => getGpuCards(), []);
  const timeSeries = useMemo(() => getGpuTimeSeries(), []);
  const heatmapData = useMemo(() => getGpuHeatmap(), []);
  const comparisonData = useMemo(() => getGpuComparison(), []);
  const healthIssues = useMemo(() => getGpuHealthIssues(), []);
  const processes = useMemo(() => getGpuProcesses(), []);
  const systemGauges = useMemo(() => getSystemResourceGauges(), []);
  const systemTrends = useMemo(() => getSystemResourceTrends(), []);
  const funnelStages = useMemo(() => getGpuFunnelData(), []);

  const selectedGpuData = useMemo(
    () => gpus.find((g) => g.id === selectedGpu) ?? null,
    [gpus, selectedGpu]
  );

  const detailData = useMemo(
    () => (selectedGpu ? getGpuDetailData(String(selectedGpu)) : null),
    [selectedGpu]
  );

  // Filter comparison data when GPUs are selected for comparison
  const filteredComparisonData = useMemo(() => {
    if (comparisonGpus.length < 2) return comparisonData;
    const selectedNames = gpus
      .filter((g) => comparisonGpus.includes(g.id))
      .map((g) => g.name);
    return comparisonData.filter((d) => selectedNames.includes(d.gpuName));
  }, [comparisonData, comparisonGpus, gpus]);

  const handleGpuClick = useCallback((gpuId: number) => {
    setSelectedGpu(gpuId);
  }, []);

  const handleGpuSelectToggle = useCallback((gpuId: number, checked: boolean) => {
    setComparisonGpus((prev) =>
      checked ? [...prev, gpuId] : prev.filter((id) => id !== gpuId)
    );
  }, []);

  const handleSheetClose = useCallback(() => {
    setSelectedGpu(null);
  }, []);

  return (
    <PageShell
      title="GPU Monitoring"
      description="Real-time GPU performance and health overview"
    >
      <GpuSummaryHeader gpus={gpus} />
      <SystemResourcePanel gauges={systemGauges} trends={systemTrends} />

      {/* GPU Pipeline Funnel */}
      <GpuFunnelChart stages={funnelStages} />

      {/* GPU Cards with click + comparison selection */}
      <GpuCardGrid
        gpus={gpus}
        onGpuClick={handleGpuClick}
        selectedGpus={comparisonGpus}
        onGpuSelectToggle={handleGpuSelectToggle}
      />

      {/* Comparison selection indicator */}
      {comparisonGpus.length > 0 && comparisonGpus.length < 2 && (
        <p className="text-xs text-muted-foreground text-center">
          Select at least 2 GPUs for comparison overlay
        </p>
      )}

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
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">
              GPU Comparison
              {comparisonGpus.length >= 2 && (
                <span className="text-xs text-muted-foreground font-normal ml-2">
                  ({comparisonGpus.length} selected)
                </span>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <GpuComparisonBar data={filteredComparisonData} className="aspect-[16/9]" />
        </CardContent>
      </Card>

      {/* Health + Processes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <GpuHealthIssues issues={healthIssues} />
        <GpuProcessesTable processes={processes} />
      </div>

      {/* Alert Thresholds (toggle) */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowThresholds((prev) => !prev)}
          className="gap-2"
        >
          <Settings2 className="h-4 w-4" />
          {showThresholds ? "Hide" : "Show"} Alert Thresholds
        </Button>
        {showThresholds && (
          <div className="mt-3">
            <GpuThresholdForm />
          </div>
        )}
      </div>

      {/* GPU Detail Slide Panel */}
      <Sheet
        open={selectedGpu !== null}
        onOpenChange={(open) => {
          if (!open) handleSheetClose();
        }}
      >
        <SheetContent side="right" className="sm:max-w-[450px]">
          <SheetHeader>
            <SheetTitle>GPU Details</SheetTitle>
            <SheetDescription>
              {selectedGpuData ? `${selectedGpuData.name} - ${selectedGpuData.model}` : "Select a GPU"}
            </SheetDescription>
          </SheetHeader>
          <GpuDetailPanel
            gpu={selectedGpuData}
            processes={processes}
            detailData={detailData}
            onClose={handleSheetClose}
          />
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
