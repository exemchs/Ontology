"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import { scaleTime, scaleLinear } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { line, curveMonotoneX } from "d3-shape";
import { extent } from "d3-array";
import { timeFormat } from "d3-time-format";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChartSkeleton } from "@/components/charts/shared/ChartSkeleton";
import { cleanupD3Svg, createDebouncedResizeObserver } from "@/components/charts/shared/chart-utils";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import type { GpuTimeSeries, GpuMetricType } from "@/data/gpu-data";

// ── Metric display config ──────────────────────────────────────────────────

const METRIC_LABELS: Record<GpuMetricType, string> = {
  utilization: "Utilization",
  temperature: "Temperature",
  power: "Power",
  memory: "Memory",
};

const METRIC_UNITS: Record<GpuMetricType, string> = {
  utilization: "%",
  temperature: "\u00B0C",
  power: "W",
  memory: "GB",
};

// Chart color keys indexed 1-4 for GPU-0 through GPU-3
const GPU_COLOR_KEYS = ["chart1", "chart2", "chart3", "chart4"] as const;

// ── Component ──────────────────────────────────────────────────────────────

interface GpuPerformanceTrendProps {
  series: GpuTimeSeries[];
}

export function GpuPerformanceTrend({ series }: GpuPerformanceTrendProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [activeMetric, setActiveMetric] = useState<GpuMetricType>("utilization");
  const [visibleGpus, setVisibleGpus] = useState<Set<string>>(() => {
    const names = new Set<string>();
    series.forEach((s) => names.add(s.gpuName));
    return names;
  });
  const [isClient, setIsClient] = useState(false);

  // SSR guard
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Stable GPU name list (order matches seed data)
  const gpuNames = Array.from(new Set(series.map((s) => s.gpuName)));

  // ── D3 rendering ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isClient) return;
    const container = containerRef.current;
    if (!container || series.length === 0) return;

    let destroyed = false;
    const tooltip = createTooltip();
    const formatTime = timeFormat("%H:%M");

    function render() {
      if (destroyed || !container) return;
      cleanupD3Svg(container);

      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      const colors = getChartColors();
      const margin = { top: 40, right: 20, bottom: 40, left: 50 };
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;
      if (innerW <= 0 || innerH <= 0) return;

      // Filter series by active metric
      const metricSeries = series.filter((s) => s.metric === activeMetric);
      if (metricSeries.length === 0) return;

      // ── Scales ──────────────────────────────────────────────────────────

      // X: time extent across ALL series of this metric
      const allTimes = metricSeries.flatMap((s) => s.data.map((d) => d.time));
      const timeExtent = extent(allTimes) as [Date, Date];
      const xScale = scaleTime().domain(timeExtent).range([0, innerW]);

      // Y: FIXED domain from ALL series (not just visible) to prevent scale jump
      const allValues = metricSeries.flatMap((s) => s.data.map((d) => d.value));
      const yExtent = extent(allValues) as [number, number];
      const yPadding = (yExtent[1] - yExtent[0]) * 0.1 || 5;
      const yScale = scaleLinear()
        .domain([Math.max(0, yExtent[0] - yPadding), yExtent[1] + yPadding])
        .nice()
        .range([innerH, 0]);

      // ── SVG setup ───────────────────────────────────────────────────────

      const svg = select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // ── Grid lines ──────────────────────────────────────────────────────

      const yTicks = yScale.ticks(5);
      g.selectAll(".grid-line")
        .data(yTicks)
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", innerW)
        .attr("y1", (d) => yScale(d))
        .attr("y2", (d) => yScale(d))
        .attr("stroke", colors.gridLine)
        .attr("stroke-opacity", 0.1);

      // ── Axes ────────────────────────────────────────────────────────────

      // X axis
      const xAxis = axisBottom(xScale)
        .ticks(6)
        .tickFormat((d) => formatTime(d as Date));

      g.append("g")
        .attr("transform", `translate(0,${innerH})`)
        .call(xAxis)
        .call((sel) => {
          sel.select(".domain").attr("stroke", colors.axisLine);
          sel.selectAll(".tick line").attr("stroke", colors.tickLine);
          sel.selectAll(".tick text")
            .attr("fill", colors.textSecondary)
            .attr("font-size", "11px");
        });

      // Y axis
      const yAxis = axisLeft(yScale).ticks(5);
      g.append("g")
        .call(yAxis)
        .call((sel) => {
          sel.select(".domain").attr("stroke", colors.axisLine);
          sel.selectAll(".tick line").attr("stroke", colors.tickLine);
          sel.selectAll(".tick text")
            .attr("fill", colors.textSecondary)
            .attr("font-size", "11px");
        });

      // Y-axis unit label
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerH / 2)
        .attr("y", -38)
        .attr("text-anchor", "middle")
        .attr("fill", colors.textSecondary)
        .attr("font-size", "11px")
        .text(METRIC_UNITS[activeMetric]);

      // ── Line generator ──────────────────────────────────────────────────

      const lineGenerator = line<{ time: Date; value: number }>()
        .x((d) => xScale(d.time))
        .y((d) => yScale(d.value))
        .curve(curveMonotoneX);

      // ── Draw lines (only visible GPUs) ──────────────────────────────────

      metricSeries.forEach((s) => {
        const gpuIndex = gpuNames.indexOf(s.gpuName);
        const colorKey = GPU_COLOR_KEYS[gpuIndex] ?? "chart1";
        const color = colors[colorKey];
        const isVisible = visibleGpus.has(s.gpuName);

        if (!isVisible) return;

        // Line path
        g.append("path")
          .datum(s.data)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 2)
          .attr("d", lineGenerator);

        // Hover circles
        g.selectAll(`.dot-${gpuIndex}`)
          .data(s.data)
          .enter()
          .append("circle")
          .attr("class", `dot-${gpuIndex}`)
          .attr("cx", (d) => xScale(d.time))
          .attr("cy", (d) => yScale(d.value))
          .attr("r", 3)
          .attr("fill", color)
          .attr("opacity", 0)
          .attr("cursor", "pointer")
          .on("mouseenter", function (event: MouseEvent, d) {
            select(this).attr("opacity", 1).attr("r", 5);
            tooltip.show(
              `<strong>${s.gpuName}</strong><br/>${formatTime(d.time)}<br/>${d.value.toFixed(1)} ${METRIC_UNITS[activeMetric]}`,
              event,
            );
          })
          .on("mousemove", function (event: MouseEvent, d) {
            tooltip.show(
              `<strong>${s.gpuName}</strong><br/>${formatTime(d.time)}<br/>${d.value.toFixed(1)} ${METRIC_UNITS[activeMetric]}`,
              event,
            );
          })
          .on("mouseleave", function () {
            select(this).attr("opacity", 0).attr("r", 3);
            tooltip.hide();
          });
      });

      // ── Legend (SVG, top-left of chart area) ──────────────────────────────

      const legendG = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top - 12})`);

      gpuNames.forEach((name, i) => {
        const colorKey = GPU_COLOR_KEYS[i] ?? "chart1";
        const color = colors[colorKey];
        const isVisible = visibleGpus.has(name);
        const xOffset = i * 90;

        const itemG = legendG
          .append("g")
          .attr("transform", `translate(${xOffset}, 0)`)
          .attr("cursor", "pointer")
          .attr("opacity", isVisible ? 1 : 0.3)
          .on("click", () => {
            setVisibleGpus((prev) => {
              const next = new Set(prev);
              if (next.has(name)) {
                // Don't allow hiding all GPUs
                if (next.size > 1) next.delete(name);
              } else {
                next.add(name);
              }
              return next;
            });
          });

        // Short colored line
        itemG
          .append("line")
          .attr("x1", 0)
          .attr("x2", 16)
          .attr("y1", 0)
          .attr("y2", 0)
          .attr("stroke", color)
          .attr("stroke-width", 2);

        // GPU name text
        itemG
          .append("text")
          .attr("x", 20)
          .attr("y", 0)
          .attr("dy", "0.35em")
          .attr("fill", colors.text)
          .attr("font-size", "11px")
          .text(name);
      });
    }

    render();

    const observer = createDebouncedResizeObserver(() => {
      if (!destroyed) render();
    });
    observer.observe(container);

    return () => {
      destroyed = true;
      observer.disconnect();
      tooltip.destroy();
      cleanupD3Svg(container);
    };
  }, [isClient, series, activeMetric, visibleGpus, resolvedTheme, gpuNames]);

  // ── SSR fallback ──────────────────────────────────────────────────────

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Performance Trends</CardTitle>
        <Tabs
          value={activeMetric}
          onValueChange={(v) => setActiveMetric(v as GpuMetricType)}
        >
          <TabsList>
            {(Object.keys(METRIC_LABELS) as GpuMetricType[]).map((metric) => (
              <TabsTrigger key={metric} value={metric}>
                {METRIC_LABELS[metric]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {/* Shared chart area for all metric tabs */}
        <Tabs value={activeMetric}>
          <TabsContent value={activeMetric}>
            <div
              ref={containerRef}
              className="w-full h-[350px]"
              data-testid="gpu-performance-trend"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
