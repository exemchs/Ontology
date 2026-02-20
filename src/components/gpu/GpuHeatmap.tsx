"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import { scaleBand, scaleSequential, scaleLinear } from "d3-scale";
import { interpolateBlues } from "d3-scale-chromatic";
import { axisBottom, axisLeft } from "d3-axis";
import { timeFormat } from "d3-time-format";

import type { GpuHeatmapCell } from "@/data/gpu-data";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import {
  cleanupD3Svg,
  createDebouncedResizeObserver,
} from "@/components/charts/shared/chart-utils";
import { ChartSkeleton } from "@/components/charts/shared/ChartSkeleton";

interface GpuHeatmapProps {
  data: GpuHeatmapCell[];
}

export function GpuHeatmap({ data }: GpuHeatmapProps) {
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
    const fmt = timeFormat("%H:%M");

    function render() {
      if (destroyedRef.current || !svgEl || !container) return;
      cleanupD3Svg(svgEl as unknown as HTMLElement);

      const colors = getChartColors();

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = Math.max(rect.height, 200);

      const margin = { top: 20, right: 80, bottom: 40, left: 60 };
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;

      if (innerW <= 0 || innerH <= 0) return;

      // Extract unique GPU names and time indices
      const gpuNames = Array.from(new Set(data.map((d) => d.gpuName)));
      const timeIndices = Array.from(new Set(data.map((d) => d.timeIndex))).sort(
        (a, b) => a - b
      );

      // Scales
      const xScale = scaleBand<number>()
        .domain(timeIndices)
        .range([0, innerW])
        .padding(0.02);

      const yScale = scaleBand<string>()
        .domain(gpuNames)
        .range([0, innerH])
        .padding(0.05);

      const colorScale = scaleSequential(interpolateBlues).domain([0, 100]);

      const svg = select(svgEl)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Build a time lookup map for formatting tooltips
      const timeLookup = new Map<string, Date>();
      data.forEach((d) => {
        timeLookup.set(`${d.gpuName}-${d.timeIndex}`, d.time);
      });

      // Draw cells
      g.selectAll("rect.cell")
        .data(data)
        .join("rect")
        .attr("class", "cell")
        .attr("x", (d) => xScale(d.timeIndex)!)
        .attr("y", (d) => yScale(d.gpuName)!)
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", (d) => colorScale(d.utilization))
        .attr("rx", 2)
        .style("cursor", "pointer")
        .on("mouseenter", function (event: MouseEvent, d: GpuHeatmapCell) {
          select(this).attr("stroke", colors.text).attr("stroke-width", 1.5);
          tooltip.show(
            `<strong>${d.gpuName}</strong><br/>` +
              `Time: ${fmt(d.time)}<br/>` +
              `Utilization: ${d.utilization}%`,
            event
          );
        })
        .on("mouseleave", function () {
          select(this).attr("stroke", "none");
          tooltip.hide();
        });

      // X-axis: show every 4th tick
      const xAxis = axisBottom(xScale)
        .tickValues(timeIndices.filter((_, i) => i % 4 === 0))
        .tickFormat((d) => {
          const cell = data.find((c) => c.timeIndex === d);
          return cell ? fmt(cell.time) : String(d);
        });

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

      // Y-axis: GPU names
      const yAxis = axisLeft(yScale);
      g.append("g")
        .call(yAxis)
        .call((sel) => {
          sel
            .selectAll("text")
            .attr("fill", colors.text)
            .style("font-size", "11px");
          sel.selectAll("line").attr("stroke", colors.tickLine);
          sel.select(".domain").attr("stroke", colors.axisLine);
        });

      // Color legend (right side)
      const legendWidth = 14;
      const legendHeight = innerH;
      const legendX = innerW + 20;
      const legendY = 0;

      // Define gradient
      const defs = svg.append("defs");
      const gradientId = "heatmap-gradient";
      const gradient = defs
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

      // Sample the YlOrRd color scale for the gradient
      const numStops = 10;
      for (let i = 0; i <= numStops; i++) {
        const t = i / numStops;
        gradient
          .append("stop")
          .attr("offset", `${t * 100}%`)
          .attr("stop-color", colorScale(t * 100));
      }

      const legendG = g
        .append("g")
        .attr("transform", `translate(${legendX},${legendY})`);

      legendG
        .append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("fill", `url(#${gradientId})`)
        .attr("rx", 2);

      // Legend scale + axis
      const legendScale = scaleLinear()
        .domain([0, 100])
        .range([legendHeight, 0]);

      const legendAxis = axisLeft(legendScale)
        .ticks(5)
        .tickSize(-legendWidth)
        .tickFormat((d) => `${d}%`);

      legendG
        .append("g")
        .attr("transform", `translate(0,0)`)
        .call(legendAxis)
        .call((sel) => {
          sel
            .selectAll("text")
            .attr("fill", colors.textSecondary)
            .style("font-size", "9px");
          sel.selectAll("line").attr("stroke", "none");
          sel.select(".domain").attr("stroke", "none");
        });
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
      <div className="w-full h-full min-h-[200px]" data-testid="gpu-heatmap">
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-[200px]" data-testid="gpu-heatmap">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
