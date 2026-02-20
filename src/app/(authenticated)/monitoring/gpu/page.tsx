"use client";

import { useState, useMemo, useCallback } from "react";
import { Settings2, LayoutGrid, List } from "lucide-react";

import { PageShell } from "@/components/ds/PageShell";
import { SystemResourcePanel } from "@/components/ds/SystemResourcePanel";
import { getSystemResourceGauges, getSystemResourceTrends } from "@/data/system-resource-data";
import { GpuSummaryHeader } from "@/components/gpu/GpuSummaryHeader";
import { GpuList } from "@/components/gpu/GpuList";
import { GpuCardGrid } from "@/components/gpu/GpuCardGrid";
import { GpuPipelineTreemap } from "@/components/gpu/GpuPipelineTreemap";
import { GpuPerformanceTrend } from "@/components/gpu/GpuPerformanceTrend";
import { GpuHeatmapRidgelineToggle } from "@/components/gpu/GpuHeatmapRidgelineToggle";
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
  getGpuHealthIssues,
  getGpuProcesses,
  getGpuFunnelData,
  getGpuDetailData,
} from "@/data/gpu-data";
import type { GpuMetricType, GpuTimeSeries } from "@/data/gpu-data";

type HeatmapView = "heatmap" | "ridgeline";
type GpuListView = "list" | "grid";

export default function GpuPage() {
  const [activeMetric, setActiveMetric] = useState<GpuMetricType>("utilization");
  const [heatmapView, setHeatmapView] = useState<HeatmapView>("heatmap");
  const [selectedGpu, setSelectedGpu] = useState<number | null>(null);
  const [showThresholds, setShowThresholds] = useState(false);
  const [gpuListView, setGpuListView] = useState<GpuListView>("list");

  const gpus = useMemo(() => getGpuCards(), []);
  const allTimeSeries = useMemo(() => getGpuTimeSeries(), []);
  const heatmapData = useMemo(() => getGpuHeatmap(), []);
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

  const handleGpuSelect = useCallback((gpuId: number) => {
    setSelectedGpu(gpuId);
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

      {/* GPU Pipeline + Utilization Distribution (side by side) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">GPU Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <GpuPipelineTreemap stages={funnelStages} />
          </CardContent>
        </Card>

        <Card className="border-border/40 lg:col-span-2">
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
              timeSeriesData={allTimeSeries}
              view={heatmapView}
            />
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends (left) + GPU List (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="group border-border/40 lg:col-span-2">
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
              series={allTimeSeries}
              activeMetric={activeMetric}
              className="aspect-[16/7]"
            />
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm">
                GPU List
                <span className="text-xs text-muted-foreground font-normal ml-2">
                  {gpus.length}
                </span>
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant={gpuListView === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setGpuListView("list")}
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={gpuListView === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setGpuListView("grid")}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className={gpuListView === "list" ? "p-0" : ""}>
            {gpuListView === "list" ? (
              <GpuList
                gpus={gpus}
                processes={processes}
                selectedId={selectedGpu}
                onSelect={handleGpuSelect}
              />
            ) : (
              <GpuCardGrid
                gpus={gpus}
                onGpuClick={handleGpuSelect}
              />
            )}
          </CardContent>
        </Card>
      </div>

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
        <SheetContent side="right" className="sm:max-w-[520px] px-6">
          <SheetHeader>
            <SheetTitle>GPU Details</SheetTitle>
            <SheetDescription>
              {selectedGpuData ? `${selectedGpuData.name} - ${selectedGpuData.model}` : "Select a GPU"}
            </SheetDescription>
          </SheetHeader>
          <GpuDetailPanel
            gpu={selectedGpuData}
            allGpus={gpus}
            processes={processes}
            detailData={detailData}
            onGpuChange={handleGpuSelect}
            onClose={handleSheetClose}
          />
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
