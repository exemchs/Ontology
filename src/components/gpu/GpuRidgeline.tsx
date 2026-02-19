"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import { scaleBand, scaleLinear } from "d3-scale";
import { axisBottom } from "d3-axis";
import { area, curveBasis } from "d3-shape";
import { mean } from "d3-array";

import type { GpuTimeSeries } from "@/data/gpu-data";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import {
  cleanupD3Svg,
  createDebouncedResizeObserver,
} from "@/components/charts/shared/chart-utils";
import { ChartSkeleton } from "@/components/charts/shared/ChartSkeleton";

interface GpuRidgelineProps {
  data: GpuTimeSeries[];
}

// ── KDE Utility Functions ──────────────────────────────────────────────────

function kernelDensityEstimator(
  kernel: (v: number) => number,
  X: number[]
) {
  return function (V: number[]) {
    return X.map(
      (x) => [x, mean(V, (v) => kernel(x - v)) ?? 0] as [number, number]
    );
  };
}

function kernelEpanechnikov(k: number) {
  return function (v: number) {
    v = v / k;
    return Math.abs(v) <= 1 ? (0.75 * (1 - v * v)) / k : 0;
  };
}

// ── Component ──────────────────────────────────────────────────────────────

export function GpuRidgeline({ data }: GpuRidgelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const destroyedRef = useRef(false);
  const [isClient, setIsClient] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const svgEl = svgRef.current;
    const container = containerRef.current;
    if (!svgEl || !container) return;

    destroyedRef.current = false;
    const tooltip = createTooltip();

    function render() {
      if (destroyedRef.current || !svgEl || !container) return;
      cleanupD3Svg(svgEl as unknown as HTMLElement);

      const colors = getChartColors();

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = 250;

      const margin = { top: 20, right: 20, bottom: 40, left: 60 };
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;

      if (innerW <= 0 || innerH <= 0) return;

      // Extract utilization data per GPU
      const gpuNames = ["GPU-0", "GPU-1", "GPU-2", "GPU-3"];
      const utilizationByGpu = new Map<string, number[]>();

      for (const gpuName of gpuNames) {
        const series = data.filter(
          (s) => s.gpuName === gpuName && s.metric === "utilization"
        );
        const values = series.flatMap((s) => s.data.map((d) => d.value));
        utilizationByGpu.set(gpuName, values);
      }

      // Scales
      const xScale = scaleLinear().domain([0, 100]).range([0, innerW]);

      const yScale = scaleBand<string>()
        .domain(gpuNames)
        .range([0, innerH])
        .paddingInner(0.4);

      // KDE computation
      const ticks = xScale.ticks(50);
      const kde = kernelDensityEstimator(kernelEpanechnikov(7), ticks);

      const densities = new Map<string, [number, number][]>();
      let maxDensity = 0;

      for (const gpuName of gpuNames) {
        const values = utilizationByGpu.get(gpuName) ?? [];
        const density = kde(values);
        densities.set(gpuName, density);
        for (const [, d] of density) {
          if (d > maxDensity) maxDensity = d;
        }
      }

      // Density scale: negative range draws upward from baseline
      const densityScale = scaleLinear()
        .domain([0, maxDensity])
        .range([0, -yScale.bandwidth() * 1.5]);

      // Area generator
      const areaGen = area<[number, number]>()
        .x((d) => xScale(d[0]))
        .y0(0)
        .y1((d) => densityScale(d[1]))
        .curve(curveBasis);

      const svg = select(svgEl)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Chart color array for indexing
      const chartColors = [
        colors.chart1,
        colors.chart2,
        colors.chart3,
        colors.chart4,
      ];

      // Draw ridgeline paths
      gpuNames.forEach((gpuName, i) => {
        const density = densities.get(gpuName) ?? [];
        const yOffset =
          (yScale(gpuName) ?? 0) + yScale.bandwidth();

        // Find peak utilization for tooltip
        const values = utilizationByGpu.get(gpuName) ?? [];
        const peakUtil = values.length > 0 ? Math.max(...values) : 0;

        g.append("path")
          .datum(density)
          .attr("transform", `translate(0,${yOffset})`)
          .attr("fill", chartColors[i])
          .attr("fill-opacity", 0.6)
          .attr("stroke", chartColors[i])
          .attr("stroke-width", 1.5)
          .attr("d", areaGen)
          .style("cursor", "pointer")
          .on("mouseenter", function (event: MouseEvent) {
            select(this).attr("fill-opacity", 0.8);
            tooltip.show(
              `<strong>${gpuName}</strong><br/>` +
                `Peak: ${peakUtil.toFixed(1)}%`,
              event
            );
          })
          .on("mousemove", function (event: MouseEvent) {
            tooltip.show(
              `<strong>${gpuName}</strong><br/>` +
                `Peak: ${peakUtil.toFixed(1)}%`,
              event
            );
          })
          .on("mouseleave", function () {
            select(this).attr("fill-opacity", 0.6);
            tooltip.hide();
          });
      });

      // GPU labels on the left
      gpuNames.forEach((gpuName) => {
        const yPos =
          (yScale(gpuName) ?? 0) + yScale.bandwidth() / 2;

        g.append("text")
          .attr("x", -10)
          .attr("y", yPos)
          .attr("text-anchor", "end")
          .attr("dominant-baseline", "middle")
          .attr("fill", colors.text)
          .style("font-size", "11px")
          .text(gpuName);
      });

      // X-axis
      const xAxis = axisBottom(xScale)
        .tickValues([0, 25, 50, 75, 100])
        .tickFormat((d) => `${d}%`);

      g.append("g")
        .attr("transform", `translate(0,${innerH})`)
        .call(xAxis)
        .call((sel) => {
          sel
            .selectAll("text")
            .attr("fill", colors.text)
            .style("font-size", "10px");
          sel.selectAll("line").attr("stroke", colors.tickLine);
          sel.select(".domain").attr("stroke", colors.axisLine);
        });

      // X-axis label
      g.append("text")
        .attr("x", innerW / 2)
        .attr("y", innerH + 32)
        .attr("text-anchor", "middle")
        .attr("fill", colors.textSecondary)
        .style("font-size", "11px")
        .text("Utilization %");
    }

    render();

    const observer = createDebouncedResizeObserver(() => {
      if (!destroyedRef.current) render();
    });
    observer.observe(container);

    return () => {
      destroyedRef.current = true;
      observer.disconnect();
      tooltip.destroy();
      cleanupD3Svg(svgEl as unknown as HTMLElement);
    };
  }, [isClient, resolvedTheme, data]);

  if (!isClient) {
    return (
      <div className="w-full h-[250px]" data-testid="gpu-ridgeline">
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[250px]"
      data-testid="gpu-ridgeline"
    >
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
