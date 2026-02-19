"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import { scaleBand, scaleLinear } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/charts/shared/ChartSkeleton";
import { cleanupD3Svg, createDebouncedResizeObserver } from "@/components/charts/shared/chart-utils";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import type { GpuComparisonItem } from "@/data/gpu-data";

// ── Metric config ──────────────────────────────────────────────────────────

type ComparisonMetric = "utilization" | "memoryPercent" | "temperature" | "powerPercent";

const METRICS: ComparisonMetric[] = [
  "utilization",
  "memoryPercent",
  "temperature",
  "powerPercent",
];

const METRIC_DISPLAY: Record<ComparisonMetric, string> = {
  utilization: "Utilization %",
  memoryPercent: "Memory %",
  temperature: "Temp (norm)",
  powerPercent: "Power %",
};

// Temperature normalization ceiling (degrees C)
const TEMP_NORM_MAX = 90;

// Color keys for the 4 metrics (chart-1 through chart-4)
const METRIC_COLOR_KEYS = ["chart1", "chart2", "chart3", "chart4"] as const;

// ── Component ──────────────────────────────────────────────────────────────

interface GpuComparisonBarProps {
  data: GpuComparisonItem[];
}

export function GpuComparisonBar({ data }: GpuComparisonBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ── D3 rendering ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isClient) return;
    const container = containerRef.current;
    if (!container || data.length === 0) return;

    let destroyed = false;
    const tooltip = createTooltip();

    function render() {
      if (destroyed || !container) return;
      cleanupD3Svg(container);

      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      const colors = getChartColors();
      const margin = { top: 30, right: 20, bottom: 50, left: 50 };
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;
      if (innerW <= 0 || innerH <= 0) return;

      const gpuNames = data.map((d) => d.gpuName);

      // ── Scales ──────────────────────────────────────────────────────────

      const x0 = scaleBand()
        .domain(gpuNames)
        .range([0, innerW])
        .paddingInner(0.2);

      const x1 = scaleBand<string>()
        .domain(METRICS)
        .range([0, x0.bandwidth()])
        .padding(0.05);

      const yScale = scaleLinear().domain([0, 100]).range([innerH, 0]);

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

      // X axis: GPU names
      const xAxis = axisBottom(x0);
      g.append("g")
        .attr("transform", `translate(0,${innerH})`)
        .call(xAxis)
        .call((sel) => {
          sel.select(".domain").attr("stroke", colors.axisLine);
          sel.selectAll(".tick line").attr("stroke", colors.tickLine);
          sel.selectAll(".tick text")
            .attr("fill", colors.text)
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

      // Y-axis label
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerH / 2)
        .attr("y", -38)
        .attr("text-anchor", "middle")
        .attr("fill", colors.textSecondary)
        .attr("font-size", "11px")
        .text("%");

      // ── Bars ────────────────────────────────────────────────────────────

      // Resolve metric colors
      const metricColors = METRICS.map((_m, i) => {
        const key = METRIC_COLOR_KEYS[i];
        return colors[key];
      });

      data.forEach((gpu) => {
        const gpuG = g
          .append("g")
          .attr("transform", `translate(${x0(gpu.gpuName) ?? 0}, 0)`);

        METRICS.forEach((metric, mi) => {
          const rawValue = gpu[metric];
          // Normalize temperature to 0-100 scale
          const barValue =
            metric === "temperature"
              ? (rawValue / TEMP_NORM_MAX) * 100
              : rawValue;
          const clampedValue = Math.min(100, Math.max(0, barValue));

          // Format tooltip: show actual value for temperature, percentage for others
          const displayValue =
            metric === "temperature"
              ? `${rawValue}\u00B0C`
              : `${rawValue.toFixed(1)}%`;

          gpuG
            .append("rect")
            .attr("x", x1(metric) ?? 0)
            .attr("y", yScale(clampedValue))
            .attr("width", x1.bandwidth())
            .attr("height", innerH - yScale(clampedValue))
            .attr("fill", metricColors[mi])
            .attr("rx", 2)
            .attr("cursor", "pointer")
            .on("mouseenter", function (event: MouseEvent) {
              select(this).attr("opacity", 0.8);
              tooltip.show(
                `<strong>${gpu.gpuName}</strong><br/>${METRIC_DISPLAY[metric]}: ${displayValue}`,
                event,
              );
            })
            .on("mousemove", function (event: MouseEvent) {
              tooltip.show(
                `<strong>${gpu.gpuName}</strong><br/>${METRIC_DISPLAY[metric]}: ${displayValue}`,
                event,
              );
            })
            .on("mouseleave", function () {
              select(this).attr("opacity", 1);
              tooltip.hide();
            });
        });
      });

      // ── Legend (below chart in bottom margin) ───────────────────────────

      const legendG = svg
        .append("g")
        .attr(
          "transform",
          `translate(${margin.left}, ${height - 10})`,
        );

      const legendSpacing = innerW / METRICS.length;

      METRICS.forEach((metric, i) => {
        const xOffset = i * legendSpacing;

        legendG
          .append("rect")
          .attr("x", xOffset)
          .attr("y", -5)
          .attr("width", 10)
          .attr("height", 10)
          .attr("rx", 2)
          .attr("fill", metricColors[i]);

        legendG
          .append("text")
          .attr("x", xOffset + 14)
          .attr("y", 0)
          .attr("dy", "0.35em")
          .attr("fill", colors.textSecondary)
          .attr("font-size", "10px")
          .text(METRIC_DISPLAY[metric]);
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
  }, [isClient, data, resolvedTheme]);

  // ── SSR fallback ──────────────────────────────────────────────────────

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>GPU Comparison</CardTitle>
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
      <CardHeader>
        <CardTitle>GPU Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="w-full h-[300px]"
          data-testid="gpu-comparison-bar"
        />
      </CardContent>
    </Card>
  );
}
