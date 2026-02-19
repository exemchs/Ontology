"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import { scaleTime, scaleLinear } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { line, curveMonotoneX } from "d3-shape";
import { extent, max } from "d3-array";
import { timeFormat } from "d3-time-format";

import {
  getDashboardTimeSeries,
  type DashboardTimeSeries,
} from "@/data/dashboard-data";
import { cleanupD3Svg, createDebouncedResizeObserver, formatNumber } from "@/components/charts/shared/chart-utils";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip, type TooltipInstance } from "@/components/charts/shared/chart-tooltip";
import { ChartEmpty } from "@/components/charts/shared/ChartEmpty";

type Interval = "hourly" | "daily";

export function DualLineChart({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<TooltipInstance | null>(null);
  const { resolvedTheme } = useTheme();
  const [interval, setInterval] = useState<Interval>("hourly");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;

    // Create tooltip once per effect
    const tooltip = createTooltip();
    tooltipRef.current = tooltip;

    function render() {
      if (destroyed || !container) return;

      cleanupD3Svg(container);

      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      const colors = getChartColors();
      const seriesData: DashboardTimeSeries[] = getDashboardTimeSeries(interval);

      if (!seriesData.length || !seriesData[0].data.length) return;

      const margin = { top: 20, right: 20, bottom: 40, left: 50 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (innerWidth <= 0 || innerHeight <= 0) return;

      // Resolve series colors
      const resolvedSeriesColors = seriesData.map((s) => {
        const match = s.color.match(/var\((.+)\)/);
        const varName = match ? match[1] : s.color;
        return getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim();
      });

      // Scales
      const allTimes = seriesData.flatMap((s) => s.data.map((d) => d.time));
      const timeExtent = extent(allTimes) as [Date, Date];

      const xScale = scaleTime().domain(timeExtent).range([0, innerWidth]);

      const allValues = seriesData.flatMap((s) => s.data.map((d) => d.value));
      const maxValue = max(allValues) ?? 0;

      const yScale = scaleLinear()
        .domain([0, maxValue * 1.1])
        .range([innerHeight, 0]);

      // Time format based on interval
      const timeFormatStr = interval === "daily" ? "%m/%d %H:%M" : "%H:%M";
      const formatTime = timeFormat(timeFormatStr);

      const svg = select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      // Grid lines (horizontal)
      const yTicks = yScale.ticks(5);
      g.selectAll(".grid-line")
        .data(yTicks)
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", (d) => yScale(d))
        .attr("y2", (d) => yScale(d))
        .attr("stroke", colors.gridLine)
        .attr("stroke-opacity", 0.1);

      // X axis
      const xAxis = axisBottom(xScale)
        .ticks(6)
        .tickFormat((d) => formatTime(d as Date));

      g.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xAxis)
        .call((g) => {
          g.select(".domain").attr("stroke", colors.axisLine);
          g.selectAll(".tick line").attr("stroke", colors.tickLine);
          g.selectAll(".tick text")
            .attr("fill", colors.textSecondary)
            .attr("font-size", "11px");
        });

      // Y axis
      const yAxis = axisLeft(yScale)
        .ticks(5)
        .tickFormat((d) => formatNumber(d.valueOf()));

      g.append("g")
        .call(yAxis)
        .call((g) => {
          g.select(".domain").attr("stroke", colors.axisLine);
          g.selectAll(".tick line").attr("stroke", colors.tickLine);
          g.selectAll(".tick text")
            .attr("fill", colors.textSecondary)
            .attr("font-size", "11px");
        });

      // Line generator
      const lineGenerator = line<{ time: Date; value: number }>()
        .x((d) => xScale(d.time))
        .y((d) => yScale(d.value))
        .curve(curveMonotoneX);

      // Draw lines and dots for each series
      seriesData.forEach((series, i) => {
        const color = resolvedSeriesColors[i];

        // Line
        g.append("path")
          .datum(series.data)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 2)
          .attr("d", lineGenerator);

        // Dots
        g.selectAll(`.dot-${i}`)
          .data(series.data)
          .enter()
          .append("circle")
          .attr("class", `dot-${i}`)
          .attr("cx", (d) => xScale(d.time))
          .attr("cy", (d) => yScale(d.value))
          .attr("r", 3)
          .attr("fill", color)
          .attr("cursor", "pointer")
          .on("mouseenter", function (event: MouseEvent, d) {
            select(this).attr("r", 5);
            tooltip.show(
              `<strong>${series.name}</strong><br/>${formatTime(d.time)}<br/>${formatNumber(d.value)}`,
              event
            );
          })
          .on("mousemove", function (event: MouseEvent, d) {
            tooltip.show(
              `<strong>${series.name}</strong><br/>${formatTime(d.time)}<br/>${formatNumber(d.value)}`,
              event
            );
          })
          .on("mouseleave", function () {
            select(this).attr("r", 3);
            tooltip.hide();
          });
      });

      // Legend (rendered in SVG below chart area)
      const legendG = svg
        .append("g")
        .attr(
          "transform",
          `translate(${margin.left}, ${height - 8})`
        );

      seriesData.forEach((series, i) => {
        const color = resolvedSeriesColors[i];
        const xOffset = i * 180;

        legendG
          .append("circle")
          .attr("cx", xOffset)
          .attr("cy", 0)
          .attr("r", 4)
          .attr("fill", color);

        legendG
          .append("text")
          .attr("x", xOffset + 10)
          .attr("y", 0)
          .attr("dy", "0.35em")
          .attr("fill", colors.textSecondary)
          .attr("font-size", "11px")
          .text(series.name);
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
      tooltipRef.current = null;
      cleanupD3Svg(container);
    };
  }, [interval, resolvedTheme]);

  return (
    <div className={className}>
      {/* Toggle buttons */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setInterval("hourly")}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            interval === "hourly"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Hourly
        </button>
        <button
          onClick={() => setInterval("daily")}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            interval === "daily"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Daily
        </button>
      </div>

      {/* Chart container */}
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", minHeight: "250px" }}
        data-testid="dual-line-chart"
      />
    </div>
  );
}
