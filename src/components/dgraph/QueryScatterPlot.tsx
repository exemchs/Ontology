"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { extent } from "d3-array";
import { brush as d3Brush, type D3BrushEvent } from "d3-brush";
import "d3-transition";

import {
  getDgraphQueries,
  type DgraphQueryPoint,
} from "@/data/dgraph-data";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import {
  cleanupD3Svg,
  createDebouncedResizeObserver,
  formatNumber,
} from "@/components/charts/shared/chart-utils";
import { cn } from "@/lib/utils";

interface QueryScatterPlotProps {
  className?: string;
}

export function QueryScatterPlot({ className }: QueryScatterPlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const destroyedRef = useRef(false);
  const { resolvedTheme } = useTheme();
  const [brushSummary, setBrushSummary] = useState<{
    count: number;
    total: number;
    avgLatency: number;
    avgThroughput: number;
    graphql: number;
    dql: number;
  } | null>(null);

  useEffect(() => {
    const svgEl = svgRef.current;
    const container = containerRef.current;
    if (!svgEl || !container) return;

    destroyedRef.current = false;
    const tooltip = createTooltip();

    function render() {
      if (destroyedRef.current || !svgEl || !container) return;
      cleanupD3Svg(svgEl as unknown as HTMLElement);

      const data: DgraphQueryPoint[] = getDgraphQueries();
      const colors = getChartColors();

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = Math.max(rect.height, 200);

      const margin = { top: 20, right: 20, bottom: 30, left: 50 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (innerWidth <= 0 || innerHeight <= 0) return;

      const svg = select(svgEl)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Scales
      const latencyExtent = extent(data, (d) => d.latency) as [number, number];
      const throughputExtent = extent(data, (d) => d.throughput) as [number, number];

      const xScale = scaleLinear()
        .domain(latencyExtent)
        .nice()
        .range([0, innerWidth]);

      const yScale = scaleLinear()
        .domain(throughputExtent)
        .nice()
        .range([innerHeight, 0]);

      // Color mapping
      const graphqlColor = colors.chart1;
      const dqlColor = colors.chart2;

      function dotColor(type: "graphql" | "dql"): string {
        return type === "graphql" ? graphqlColor : dqlColor;
      }

      // X Axis
      const xAxis = axisBottom(xScale).ticks(6);
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .call((sel) => {
          sel.selectAll("text").attr("fill", colors.text).style("font-size", "11px");
          sel.selectAll("line").attr("stroke", colors.tickLine);
          sel.select(".domain").attr("stroke", colors.axisLine);
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
      const yAxis = axisLeft(yScale).ticks(6).tickFormat((d) => formatNumber(d as number));
      g.append("g")
        .call(yAxis)
        .call((sel) => {
          sel.selectAll("text").attr("fill", colors.text).style("font-size", "11px");
          sel.selectAll("line").attr("stroke", colors.tickLine);
          sel.select(".domain").attr("stroke", colors.axisLine);
        });

      // Y axis label
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .attr("fill", colors.textSecondary)
        .style("font-size", "11px")
        .text("Throughput (q/s)");

      // Brush (behind dots so dots remain hoverable)
      const brushG = g.append("g").attr("class", "brush");

      const brushBehavior = d3Brush()
        .extent([
          [0, 0],
          [innerWidth, innerHeight],
        ])
        .on("brush", function (event: D3BrushEvent<unknown>) {
          if (!event.selection) return;
          const [[x0, y0], [x1, y1]] = event.selection as [[number, number], [number, number]];

          dots
            .attr("opacity", (d: DgraphQueryPoint) => {
              const cx = xScale(d.latency);
              const cy = yScale(d.throughput);
              return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1 ? 0.7 : 0.2;
            })
            .attr("stroke-opacity", (d: DgraphQueryPoint) => {
              const cx = xScale(d.latency);
              const cy = yScale(d.throughput);
              return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1 ? 1 : 0.2;
            });
        })
        .on("end", function (event: D3BrushEvent<unknown>) {
          if (!event.selection) {
            // Click without drag or clear: reset all dots
            dots.attr("opacity", 0.7).attr("stroke-opacity", 1);
            setBrushSummary(null);
            return;
          }

          const [[x0, y0], [x1, y1]] = event.selection as [[number, number], [number, number]];

          // If selection is very small (<5px in both dimensions), treat as click-to-clear
          if (Math.abs(x1 - x0) < 5 && Math.abs(y1 - y0) < 5) {
            brushG.call(brushBehavior.move, null);
            dots.attr("opacity", 0.7).attr("stroke-opacity", 1);
            setBrushSummary(null);
            return;
          }

          // Compute summary for selected dots
          const selected: DgraphQueryPoint[] = [];
          data.forEach((d) => {
            const cx = xScale(d.latency);
            const cy = yScale(d.throughput);
            if (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1) {
              selected.push(d);
            }
          });
          if (selected.length > 0) {
            const avgLat = selected.reduce((s, d) => s + d.latency, 0) / selected.length;
            const avgThr = selected.reduce((s, d) => s + d.throughput, 0) / selected.length;
            setBrushSummary({
              count: selected.length,
              total: data.length,
              avgLatency: Math.round(avgLat * 10) / 10,
              avgThroughput: Math.round(avgThr),
              graphql: selected.filter((d) => d.type === "graphql").length,
              dql: selected.filter((d) => d.type === "dql").length,
            });
          } else {
            setBrushSummary(null);
          }
        });

      brushG.call(brushBehavior);

      // Style brush selection rectangle
      brushG
        .select(".selection")
        .attr("fill", graphqlColor)
        .attr("fill-opacity", 0.08)
        .attr("stroke", graphqlColor)
        .attr("stroke-opacity", 0.3);

      // Dots (above brush so they remain hoverable)
      const dots = g
        .selectAll<SVGCircleElement, DgraphQueryPoint>(".query-dot")
        .data(data)
        .join("circle")
        .attr("class", "query-dot")
        .attr("cx", (d) => xScale(d.latency))
        .attr("cy", (d) => yScale(d.throughput))
        .attr("r", 5)
        .attr("fill", (d) => dotColor(d.type))
        .attr("opacity", 0.7)
        .attr("stroke", (d) => dotColor(d.type))
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 1)
        .style("pointer-events", "all")
        .style("cursor", "pointer")
        .on("mouseenter", function (event: MouseEvent, d: DgraphQueryPoint) {
          select(this).attr("r", 7).attr("opacity", 1);
          tooltip.show(
            `<strong>${d.id}</strong><br/>` +
              `Latency: ${d.latency} ms<br/>` +
              `Throughput: ${d.throughput} q/s<br/>` +
              `Type: ${d.type.toUpperCase()}`,
            event,
          );
        })
        .on("mouseleave", function () {
          select(this).attr("r", 5).attr("opacity", 0.7);
          tooltip.hide();
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
  }, [resolvedTheme]);

  return (
    <div ref={containerRef} className={cn("w-full min-h-[200px] max-h-[300px] flex flex-col", className)}>
      <div className="flex items-center justify-end gap-4 mb-1 shrink-0">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--chart-1)" }} />
            GraphQL
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--chart-2)" }} />
            DQL
          </span>
        </div>
      </div>
      <svg ref={svgRef} className="w-full flex-1" data-testid="query-scatter-plot" />
      {brushSummary && (
        <div className="shrink-0 mt-1 flex items-center gap-4 rounded-md bg-muted/50 px-3 py-1.5 text-xs">
          <span className="font-medium">{brushSummary.count} / {brushSummary.total} selected</span>
          <span className="text-muted-foreground">Avg Latency: <span className="font-mono">{brushSummary.avgLatency}ms</span></span>
          <span className="text-muted-foreground">Avg Throughput: <span className="font-mono">{brushSummary.avgThroughput} q/s</span></span>
          <span className="text-muted-foreground">GraphQL: {brushSummary.graphql} | DQL: {brushSummary.dql}</span>
        </div>
      )}
    </div>
  );
}
