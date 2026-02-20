"use client";

import { useState, useMemo, useCallback } from "react";
import { LayoutGrid, List } from "lucide-react";

import { PageShell } from "@/components/ds/PageShell";
import { SystemResourcePanel } from "@/components/ds/SystemResourcePanel";
import { getSystemResourceGauges, getSystemResourceTrends } from "@/data/system-resource-data";
import { GpuSummaryHeader } from "@/components/gpu/GpuSummaryHeader";
import { GpuList } from "@/components/gpu/GpuList";
import { GpuCardGrid } from "@/components/gpu/GpuCardGrid";
import { GpuDetailInfo } from "@/components/gpu/GpuDetailInfo";
import { GpuPipelineTreemap } from "@/components/gpu/GpuPipelineTreemap";
import { GpuPerformanceTrend } from "@/components/gpu/GpuPerformanceTrend";
import { GpuHeatmapRidgelineToggle } from "@/components/gpu/GpuHeatmapRidgelineToggle";
import { GpuHealthIssues } from "@/components/gpu/GpuHealthIssues";
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
import type { GpuMetricType } from "@/data/gpu-data";

type HeatmapView = "heatmap" | "ridgeline";
type GpuListView = "list" | "grid";

export default function GpuPage() {
  const [activeMetric, setActiveMetric] = useState<GpuMetricType>("utilization");
  const [heatmapView, setHeatmapView] = useState<HeatmapView>("heatmap");
  const [selectedGpu, setSelectedGpu] = useState<number>(1);
  const [gpuListView, setGpuListView] = useState<GpuListView>("list");

  const gpus = useMemo(() => getGpuCards(), []);
  const allTimeSeries = useMemo(() => getGpuTimeSeries(), []);
  const heatmapData = useMemo(() => getGpuHeatmap(), []);
  const healthIssues = useMemo(() => getGpuHealthIssues(), []);
  const processes = useMemo(() => getGpuProcesses(), []);
  const systemGauges = useMemo(() => getSystemResourceGauges(), []);
  const systemTrends = useMemo(() => getSystemResourceTrends(), []);
  const funnelStages = useMemo(() => getGpuFunnelData(), []);

  const activeGpu = useMemo(
    () => gpus.find((g) => g.id === selectedGpu) ?? gpus[0],
    [gpus, selectedGpu]
  );

  const activeDetailData = useMemo(
    () => getGpuDetailData(String(activeGpu?.id ?? 1)),
    [activeGpu]
  );

  const handleGpuSelect = useCallback((gpuId: number) => {
    setSelectedGpu(gpuId);
  }, []);

  return (
    <PageShell
      title="GPU Monitoring"
      description="Real-time GPU performance and health overview"
    >
      <GpuSummaryHeader gpus={gpus} />
      <SystemResourcePanel gauges={systemGauges} trends={systemTrends} />

      {/* Utilization Distribution + GPU Pipeline + Health Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
        <Card className="border-border/40 lg:col-span-3">
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

        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">GPU Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <GpuPipelineTreemap stages={funnelStages} className="h-full" />
          </CardContent>
        </Card>

        <GpuHealthIssues issues={healthIssues} className="lg:col-span-2" />
      </div>

      {/* Performance Trends + GPU List & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
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
                    Util
                  </TabsTrigger>
                  <TabsTrigger value="temperature" className="text-xs px-2">
                    Temp
                  </TabsTrigger>
                  <TabsTrigger value="power" className="text-xs px-2">
                    Power
                  </TabsTrigger>
                  <TabsTrigger value="memory" className="text-xs px-2">
                    Mem
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

        {/* GPU List + Detail (single card) */}
        <Card className="border-border/40 lg:col-span-3">
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
          <CardContent>
            <div className="flex gap-4">
              {/* Left: GPU List */}
              <div className="flex-1 min-w-0">
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
              </div>
              {/* Divider */}
              <div className="w-px self-stretch bg-border/40 shrink-0" />
              {/* Right: Detail Info */}
              <div className="flex-1 min-w-0">
                <GpuDetailInfo
                  gpu={activeGpu}
                  detailData={activeDetailData}
                  embedded
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
