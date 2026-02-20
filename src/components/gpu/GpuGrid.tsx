"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ReactGridLayout, { type Layout } from "react-grid-layout";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  loadGpuLayout,
  saveGpuLayout,
  resetGpuLayout,
  DEFAULT_GPU_LAYOUT,
  GPU_WIDGET_REGISTRY,
} from "@/lib/gpu-layout";
import type { GpuWidgetConfig } from "@/lib/gpu-layout";

// Widget components
import { GpuHeatmapRidgelineToggle } from "@/components/gpu/GpuHeatmapRidgelineToggle";
import { GpuPipelineTreemap } from "@/components/gpu/GpuPipelineTreemap";
import { GpuHealthIssues } from "@/components/gpu/GpuHealthIssues";
import { GpuPerformanceTrend } from "@/components/gpu/GpuPerformanceTrend";
import { GpuListDetailWidget } from "@/components/gpu/GpuListDetailWidget";

// Data
import {
  getGpuCards,
  getGpuTimeSeries,
  getGpuHeatmap,
  getGpuHealthIssues,
  getGpuProcesses,
  getGpuFunnelData,
  getGpuDetailData,
} from "@/data/gpu-data";
import type { Gpu } from "@/types";

const gpus = getGpuCards();
const allTimeSeries = getGpuTimeSeries();
const heatmapData = getGpuHeatmap();
const healthIssues = getGpuHealthIssues();
const processes = getGpuProcesses();
const funnelStages = getGpuFunnelData();

// ── Widget Renderer ────────────────────────────────────────────────────────

function RenderWidget({
  config,
  selectedGpu,
  onGpuSelect,
}: {
  config: GpuWidgetConfig;
  selectedGpu: number;
  onGpuSelect: (id: number) => void;
}) {
  const activeGpu = useMemo(
    () => gpus.find((g: Gpu) => g.id === selectedGpu) ?? gpus[0],
    [selectedGpu]
  );

  const activeDetailData = useMemo(
    () => getGpuDetailData(String(activeGpu?.id ?? 1)),
    [activeGpu]
  );

  switch (config.type) {
    case "heatmap":
      return (
        <GpuHeatmapRidgelineToggle
          heatmapData={heatmapData}
          timeSeriesData={allTimeSeries}
          widget
        />
      );
    case "pipeline":
      return (
        <Card className="border-border/40 h-full flex flex-col">
          <CardHeader className="pb-2 shrink-0">
            <CardTitle className="text-sm">GPU Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <GpuPipelineTreemap stages={funnelStages} className="h-full" />
          </CardContent>
        </Card>
      );
    case "health-issues":
      return <GpuHealthIssues issues={healthIssues} />;
    case "performance-trend":
      return (
        <GpuPerformanceTrend
          series={allTimeSeries}
          widget
        />
      );
    case "gpu-list-detail":
      return (
        <GpuListDetailWidget
          gpus={gpus}
          processes={processes}
          selectedGpu={selectedGpu}
          onGpuSelect={onGpuSelect}
          activeGpu={activeGpu}
          activeDetailData={activeDetailData}
        />
      );
    default:
      return <div className="p-2 text-xs text-muted-foreground">Unknown widget</div>;
  }
}

// ── GPU Grid Component ──────────────────────────────────────────────────

export default function GpuGrid() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);
  const [selectedGpu, setSelectedGpu] = useState<number>(1);

  const [layout, setLayout] = useState<Layout[]>(() => DEFAULT_GPU_LAYOUT);

  // Load persisted layout after mount (SSR safety)
  useEffect(() => {
    setMounted(true);
    setLayout(loadGpuLayout(DEFAULT_GPU_LAYOUT));
    if (containerRef.current) {
      setWidth(containerRef.current.offsetWidth);
    }
  }, []);

  // ResizeObserver for width tracking
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayout(newLayout);
    saveGpuLayout(newLayout);
  }, []);

  const handleReset = useCallback(() => {
    setLayout(resetGpuLayout(DEFAULT_GPU_LAYOUT));
  }, []);

  const handleGpuSelect = useCallback((gpuId: number) => {
    setSelectedGpu(gpuId);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Reset button */}
      <div className="absolute top-0 right-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Reset Layout
        </Button>
      </div>

      {/* Grid (SSR-safe: only render after mount) */}
      {mounted && (
        <ReactGridLayout
          className="mt-8"
          layout={layout}
          cols={6}
          rowHeight={80}
          width={width}
          isDraggable
          isResizable
          margin={[12, 12]}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".react-grid-item"
        >
          {GPU_WIDGET_REGISTRY.map((config) => (
            <div key={config.id} className="overflow-hidden">
              <RenderWidget
                config={config}
                selectedGpu={selectedGpu}
                onGpuSelect={handleGpuSelect}
              />
            </div>
          ))}
        </ReactGridLayout>
      )}
    </div>
  );
}
