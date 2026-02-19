"use client";

import { useEffect, useId, useRef } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { extent } from "d3-array";
import "d3-transition";

import { getDashboardScatterData } from "@/data/dashboard-data";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import {
  cleanupD3Svg,
  createDebouncedResizeObserver,
} from "@/components/charts/shared/chart-utils";
import type { ScatterPoint } from "@/types";

export function NodeScatterPlot() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const filterId = `scatter-glow-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;
    const tooltip = createTooltip();

    function render() {
      if (destroyed || !container) return;
      cleanupD3Svg(container);

      const data: ScatterPoint[] = getDashboardScatterData();
      const colors = getChartColors();

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height || 300;

      const margin = { top: 20, right: 20, bottom: 40, left: 50 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (innerWidth <= 0 || innerHeight <= 0) return;

      const svg = select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      // Glow filter
      const defs = svg.append("defs");
      const filter = defs
        .append("filter")
        .attr("id", filterId)
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");

      filter
        .append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", 4)
        .attr("result", "blur");

      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "blur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Scales
      const latencyExtent = extent(data, (d) => d.latency) as [number, number];
      const throughputExtent = extent(data, (d) => d.throughput) as [
        number,
        number,
      ];

      const xScale = scaleLinear()
        .domain([
          Math.max(0, latencyExtent[0] - 0.5),
          latencyExtent[1] + 0.5,
        ])
        .range([0, innerWidth]);

      const yScale = scaleLinear()
        .domain([
          Math.max(0, throughputExtent[0] - 50),
          throughputExtent[1] + 50,
        ])
        .range([innerHeight, 0]);

      // Grid lines
      const yTicks = yScale.ticks(5);
      g.selectAll(".grid-h")
        .data(yTicks)
        .join("line")
        .attr("class", "grid-h")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", (d) => yScale(d))
        .attr("y2", (d) => yScale(d))
        .attr("stroke", colors.gridLine)
        .attr("stroke-opacity", 0.1);

      const xTicks = xScale.ticks(5);
      g.selectAll(".grid-v")
        .data(xTicks)
        .join("line")
        .attr("class", "grid-v")
        .attr("x1", (d) => xScale(d))
        .attr("x2", (d) => xScale(d))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colors.gridLine)
        .attr("stroke-opacity", 0.1);

      // X Axis
      const xAxis = axisBottom(xScale).ticks(5);
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .call((g) => {
          g.selectAll("text").attr("fill", colors.text).style("font-size", "11px");
          g.selectAll("line").attr("stroke", colors.tickLine);
          g.select(".domain").attr("stroke", colors.axisLine);
        });

      // X axis label
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 35)
        .attr("text-anchor", "middle")
        .attr("fill", colors.textSecondary)
        .style("font-size", "11px")
        .text("Latency (ms)");

      // Y Axis
      const yAxis = axisLeft(yScale).ticks(5);
      g.append("g")
        .call(yAxis)
        .call((g) => {
          g.selectAll("text").attr("fill", colors.text).style("font-size", "11px");
          g.selectAll("line").attr("stroke", colors.tickLine);
          g.select(".domain").attr("stroke", colors.axisLine);
        });

      // Y axis label
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .attr("fill", colors.textSecondary)
        .style("font-size", "11px")
        .text("Throughput (ops/s)");

      // Status color mapping
      function getStatusColor(status: string): string {
        switch (status) {
          case "warning":
            return colors.chart4;
          case "error":
            return colors.chart8 || "#ef4444";
          default:
            return colors.chart1;
        }
      }

      // Circles with glow
      g.selectAll(".scatter-point")
        .data(data)
        .join("circle")
        .attr("class", "scatter-point")
        .attr("cx", (d) => xScale(d.latency))
        .attr("cy", (d) => yScale(d.throughput))
        .attr("r", 6)
        .attr("fill", (d) => getStatusColor(d.status))
        .attr("opacity", 0.8)
        .attr("filter", `url(#${filterId})`)
        .style("cursor", "pointer")
        .on("mouseenter", function (event: MouseEvent, d: ScatterPoint) {
          select(this).attr("r", 8).attr("opacity", 1);
          const statusLabel =
            d.status === "healthy"
              ? "Healthy"
              : d.status === "warning"
                ? "Warning"
                : "Error";
          tooltip.show(
            `<strong>${d.name}</strong><br/>` +
              `Latency: ${d.latency} ms<br/>` +
              `Throughput: ${d.throughput} ops/s<br/>` +
              `Status: ${statusLabel}`,
            event,
          );
        })
        .on("mouseleave", function () {
          select(this).attr("r", 6).attr("opacity", 0.8);
          tooltip.hide();
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
  }, [resolvedTheme, filterId]);

  return (
    <div
      ref={containerRef}
      data-testid="node-scatter-plot"
      className="min-h-[300px] w-full"
    />
  );
}
