"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ReactGridLayout, { type Layout } from "react-grid-layout";
import { GridDragHandle } from "@/components/ds/GridDragHandle";
import { LayoutActionBar } from "@/components/ds/LayoutActionBar";
import {
  loadLayout,
  saveLayout,
  resetLayout,
  DEFAULT_DASHBOARD_LAYOUT,
  WIDGET_REGISTRY,
} from "@/lib/dashboard-layout";
import type { WidgetConfig } from "@/lib/dashboard-layout";

// Widget components
import SignalWidget from "./widgets/SignalWidget";
import SparklineWidget from "./widgets/SparklineWidget";
import ThresholdWidget from "./widgets/ThresholdWidget";
import MetricCardWidget from "./widgets/MetricCardWidget";
import TrendChartWidget from "./widgets/TrendChartWidget";
import GpuSummaryWidget from "./widgets/GpuSummaryWidget";
import DailySummaryWidget from "./widgets/DailySummaryWidget";

// Data functions (called at module scope for static generation compatibility)
import {
  getDashboardSignalData,
  getDashboardSparklineData,
  getDashboardThresholdData,
  getDashboardMetricCards,
  getDashboardTrendData,
  getDashboardGpuSummary,
  getDashboardDailySummary,
} from "@/data/dashboard-data";
import { diskTrendConfig, memoryTrendConfig } from "@/lib/chart-configs";

const signalData = getDashboardSignalData();
const sparklineData = getDashboardSparklineData();
const thresholdData = getDashboardThresholdData();
const metricCards = getDashboardMetricCards();
const trendData = getDashboardTrendData();
const gpuSummary = getDashboardGpuSummary();
const dailySummary = getDashboardDailySummary();

// ── Widget Renderer ────────────────────────────────────────────────────────

function renderWidget(config: WidgetConfig) {
  switch (config.type) {
    case "signal": {
      const field = config.props.field as keyof typeof signalData;
      const d = signalData[field];
      return <SignalWidget label={config.title} value={d.value} status={d.status} />;
    }
    case "sparkline": {
      const field = config.props.field as keyof typeof sparklineData;
      const d = sparklineData[field];
      return (
        <SparklineWidget
          label={d.label}
          value={d.value}
          unit={d.unit}
          data={d.data}
        />
      );
    }
    case "threshold":
      return (
        <ThresholdWidget
          label={config.title}
          data={thresholdData.data}
          warningThreshold={thresholdData.warningThreshold}
          criticalThreshold={thresholdData.criticalThreshold}
        />
      );
    case "metric": {
      const field = config.props.field as keyof typeof metricCards;
      const d = metricCards[field];
      return (
        <MetricCardWidget
          label={d.label}
          value={d.value}
          trend={d.trend}
          trendValue={d.trendValue}
        />
      );
    }
    case "trend": {
      const field = config.props.field as keyof typeof trendData;
      const series = trendData[field];
      const chartConfig = field === "disk" ? diskTrendConfig : memoryTrendConfig;
      return <TrendChartWidget label={config.title} series={series} config={chartConfig} />;
    }
    case "gpu-summary":
      return (
        <GpuSummaryWidget
          active={gpuSummary.active}
          idle={gpuSummary.idle}
          error={gpuSummary.error}
        />
      );
    case "daily-summary":
      return (
        <DailySummaryWidget
          queryCountChange={dailySummary.queryCountChange}
          errorCount={dailySummary.errorCount}
          errorCountYesterday={dailySummary.errorCountYesterday}
        />
      );
    default:
      return <div className="p-2 text-xs text-muted-foreground">Unknown widget</div>;
  }
}

// ── Dashboard Grid Component ──────────────────────────────────────────────

export default function DashboardGrid() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);
  const [isDirty, setIsDirty] = useState(false);

  const [layout, setLayout] = useState<Layout[]>(() =>
    DEFAULT_DASHBOARD_LAYOUT
  );

  // Load persisted layout after mount (SSR safety)
  useEffect(() => {
    setMounted(true);
    setLayout(loadLayout(DEFAULT_DASHBOARD_LAYOUT));
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
  }, []);

  const handleUserAction = useCallback(
    (_layout: Layout[], oldItem: Layout, newItem: Layout) => {
      if (oldItem.x !== newItem.x || oldItem.y !== newItem.y ||
          oldItem.w !== newItem.w || oldItem.h !== newItem.h) {
        setIsDirty(true);
      }
    },
    []
  );

  const handleSave = useCallback(() => {
    saveLayout(layout);
    setIsDirty(false);
  }, [layout]);

  const handleReset = useCallback(() => {
    setLayout(resetLayout(DEFAULT_DASHBOARD_LAYOUT));
    setIsDirty(false);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Layout action bar */}
      <LayoutActionBar isDirty={isDirty} onSave={handleSave} onReset={handleReset} />

      {/* Grid (SSR-safe: only render after mount) */}
      {mounted && (
        <ReactGridLayout
          layout={layout}
          cols={4}
          rowHeight={80}
          width={width}
          isDraggable
          isResizable
          margin={[12, 12]}
          onLayoutChange={handleLayoutChange}
          onDragStop={handleUserAction}
          onResizeStop={handleUserAction}
          draggableHandle=".grid-drag-handle"
        >
          {WIDGET_REGISTRY.map((config) => (
            <div key={config.id} className="relative overflow-hidden">
              <GridDragHandle />
              {renderWidget(config)}
            </div>
          ))}
        </ReactGridLayout>
      )}
    </div>
  );
}
