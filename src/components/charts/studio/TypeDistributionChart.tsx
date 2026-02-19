"use client";

import { useEffect, useRef, useState } from "react";
import { select } from "d3-selection";
import { scaleBand, scaleLinear } from "d3-scale";
import { stack } from "d3-shape";
import { axisBottom, axisLeft } from "d3-axis";
import { max } from "d3-array";
import "d3-transition"; // Side-effect import for .transition()

import {
  getTypeDistribution,
  type TypeDistributionItem,
} from "@/data/studio-data";
import {
  cleanupD3Svg,
  createDebouncedResizeObserver,
  formatNumber,
} from "@/components/charts/shared/chart-utils";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────

type BarMode = "stacked" | "grouped";

interface TypeDistributionChartProps {
  className?: string;
}

// ── Margins ───────────────────────────────────────────────────────────────

const MARGIN = { top: 20, right: 20, bottom: 50, left: 60 };
const SERIES_KEYS = ["records", "queries"] as const;

// ── Component ─────────────────────────────────────────────────────────────

export function TypeDistributionChart({
  className,
}: TypeDistributionChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [barMode, setBarMode] = useState<BarMode>("stacked");
  const dataRef = useRef<TypeDistributionItem[]>([]);
  const destroyedRef = useRef(false);

  // Load data once on mount
  useEffect(() => {
    dataRef.current = getTypeDistribution();
  }, []);

  // ── Main D3 effect ────────────────────────────────────────────────────

  useEffect(() => {
    const svgEl = svgRef.current;
    const containerEl = containerRef.current;
    if (!svgEl || !containerEl) return;

    destroyedRef.current = false;

    const tooltip = createTooltip();
    let resizeCleanup: (() => void) | null = null;

    const resizeObserver = createDebouncedResizeObserver((w, h) => {
      if (destroyedRef.current) return;
      if (w > 0 && h > 0) {
        renderChart(w, h);
      }
    }, 100);

    resizeObserver.observe(containerEl);

    function renderChart(width: number, height: number) {
      const data = dataRef.current;
      if (data.length === 0) return;

      // Clean previous render
      cleanupD3Svg(svgEl as unknown as HTMLElement);

      const colors = getChartColors();
      const seriesColors = [colors.chart1, colors.chart2];

      const innerWidth = width - MARGIN.left - MARGIN.right;
      const innerHeight = height - MARGIN.top - MARGIN.bottom;

      const svg = select(svgEl as SVGSVGElement)
        .attr("width", width)
        .attr("height", height);

      const g = svg
        .append("g")
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

      // ── Scales ──────────────────────────────────────────────────────

      const xScale = scaleBand<string>()
        .domain(data.map((d) => d.name))
        .range([0, innerWidth])
        .padding(0.2);

      const yMax =
        barMode === "stacked"
          ? max(data, (d) => d.records + d.queries) ?? 0
          : max(data, (d) => Math.max(d.records, d.queries)) ?? 0;

      const yScale = scaleLinear()
        .domain([0, yMax * 1.1])
        .nice()
        .range([innerHeight, 0]);

      // ── Axes ────────────────────────────────────────────────────────

      const xAxis = g
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(axisBottom(xScale).tickSizeOuter(0));

      xAxis
        .selectAll("text")
        .attr("fill", colors.text)
        .attr("font-size", "10px")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-35)")
        .attr("dx", "-0.5em")
        .attr("dy", "0.5em");

      xAxis.selectAll("line").attr("stroke", colors.axisLine);
      xAxis.select(".domain").attr("stroke", colors.axisLine);

      const yAxis = g
        .append("g")
        .attr("class", "y-axis")
        .call(
          axisLeft(yScale)
            .ticks(5)
            .tickFormat((d) => formatNumber(d as number))
        );

      yAxis.selectAll("text").attr("fill", colors.text).attr("font-size", "10px");
      yAxis.selectAll("line").attr("stroke", colors.axisLine);
      yAxis.select(".domain").attr("stroke", colors.axisLine);

      // ── Grid Lines ──────────────────────────────────────────────────

      g.append("g")
        .attr("class", "grid")
        .call(
          axisLeft(yScale)
            .ticks(5)
            .tickSize(-innerWidth)
            .tickFormat(() => "")
        )
        .selectAll("line")
        .attr("stroke", colors.gridLine)
        .attr("stroke-opacity", 0.15);

      g.select(".grid .domain").remove();

      // ── Bars ────────────────────────────────────────────────────────

      if (barMode === "stacked") {
        // Stacked bars
        const stackGen = stack<TypeDistributionItem>().keys(
          SERIES_KEYS as unknown as string[]
        );
        const stackedData = stackGen(data);

        stackedData.forEach((series, seriesIndex) => {
          g.selectAll(`.bar-${series.key}`)
            .data(series)
            .join("rect")
            .attr("class", `bar bar-${series.key}`)
            .attr("x", (d) => xScale(d.data.name) ?? 0)
            .attr("y", (d) => yScale(d[1]))
            .attr("width", xScale.bandwidth())
            .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
            .attr("fill", seriesColors[seriesIndex])
            .attr("rx", 2)
            .on("mouseenter", function (event: MouseEvent, d) {
              select(this).attr("opacity", 0.8);
              tooltip.show(
                `<strong>${d.data.name}</strong><br/>Records: ${d.data.records.toLocaleString()}<br/>Queries: ${d.data.queries.toLocaleString()}`,
                event
              );
            })
            .on("mousemove", function (event: MouseEvent, d) {
              tooltip.show(
                `<strong>${d.data.name}</strong><br/>Records: ${d.data.records.toLocaleString()}<br/>Queries: ${d.data.queries.toLocaleString()}`,
                event
              );
            })
            .on("mouseleave", function () {
              select(this).attr("opacity", 1);
              tooltip.hide();
            });
        });
      } else {
        // Grouped bars
        const innerScale = scaleBand<string>()
          .domain([...SERIES_KEYS])
          .range([0, xScale.bandwidth()])
          .padding(0.05);

        data.forEach((d) => {
          SERIES_KEYS.forEach((key, keyIndex) => {
            g.append("rect")
              .attr("class", `bar bar-${key}`)
              .attr("x", (xScale(d.name) ?? 0) + (innerScale(key) ?? 0))
              .attr("y", yScale(d[key]))
              .attr("width", innerScale.bandwidth())
              .attr("height", innerHeight - yScale(d[key]))
              .attr("fill", seriesColors[keyIndex])
              .attr("rx", 2)
              .on("mouseenter", function (event: MouseEvent) {
                select(this).attr("opacity", 0.8);
                tooltip.show(
                  `<strong>${d.name}</strong><br/>Records: ${d.records.toLocaleString()}<br/>Queries: ${d.queries.toLocaleString()}`,
                  event
                );
              })
              .on("mousemove", function (event: MouseEvent) {
                tooltip.show(
                  `<strong>${d.name}</strong><br/>Records: ${d.records.toLocaleString()}<br/>Queries: ${d.queries.toLocaleString()}`,
                  event
                );
              })
              .on("mouseleave", function () {
                select(this).attr("opacity", 1);
                tooltip.hide();
              });
          });
        });
      }

      // ── Legend ───────────────────────────────────────────────────────

      const legendG = svg
        .append("g")
        .attr(
          "transform",
          `translate(${width - MARGIN.right - 140},${MARGIN.top - 5})`
        );

      ["Records", "Queries"].forEach((label, i) => {
        const itemG = legendG
          .append("g")
          .attr("transform", `translate(${i * 80},0)`);

        itemG
          .append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 4)
          .attr("fill", seriesColors[i]);

        itemG
          .append("text")
          .attr("x", 8)
          .attr("y", 4)
          .attr("fill", colors.text)
          .attr("font-size", "11px")
          .text(label);
      });
    }

    resizeCleanup = () => {
      resizeObserver.disconnect();
    };

    return () => {
      destroyedRef.current = true;
      resizeCleanup?.();
      tooltip.destroy();
      cleanupD3Svg(svgEl as unknown as HTMLElement);
    };
  }, [barMode]);

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full min-h-[200px]", className)}
      data-testid="type-distribution-chart"
    >
      {/* Mode toggle bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-md border bg-background/80 backdrop-blur-sm p-1">
        {(["stacked", "grouped"] as BarMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setBarMode(m)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-sm transition-colors",
              barMode === m
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* SVG canvas */}
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
