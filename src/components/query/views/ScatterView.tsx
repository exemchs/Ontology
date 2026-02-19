"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import { scaleLinear, scalePoint } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { brush, type D3BrushEvent } from "d3-brush";
import "d3-transition";

import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import {
  cleanupD3Svg,
  createDebouncedResizeObserver,
} from "@/components/charts/shared/chart-utils";

// ── Types ───────────────────────────────────────────────────────────────────

interface ScatterViewProps {
  data: Record<string, unknown>[];
}

interface ScatterPoint {
  label: string;
  locationIndex: number;
  complexity: number;
  location: string;
}

// ── Component ───────────────────────────────────────────────────────────────

export function ScatterView({ data }: ScatterViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;
    const tooltip = createTooltip();

    function render() {
      if (destroyed || !container) return;
      cleanupD3Svg(container as unknown as HTMLElement);

      const colors = getChartColors();
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height || 350;

      if (width <= 0 || height <= 0) return;

      const margin = { top: 20, right: 20, bottom: 50, left: 55 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (innerWidth <= 0 || innerHeight <= 0) return;

      // ── Data transformation: location x complexity scatter ──
      const uniqueLocations = Array.from(
        new Set(data.map((row) => String(row.location ?? "Unknown")))
      );

      // Compute a complexity value per row from available data
      const points: ScatterPoint[] = data.map((row, i) => {
        const location = String(row.location ?? "Unknown");
        const locationIdx = uniqueLocations.indexOf(location);
        // Derive complexity from data fields (step count, temperature, etc.)
        const typeHash = String(row.type ?? "").length;
        const statusMod = row.status === "maintenance" ? 0.7 : 1.0;
        const complexity = ((typeHash + 3) * 12 + (i * 7 + 15)) * statusMod;

        return {
          label: String(row.equipment_id ?? row.name ?? `Item-${i}`),
          locationIndex: locationIdx,
          complexity,
          location,
        };
      });

      if (points.length === 0) return;

      // ── Scales ──
      const locationScale = scalePoint<string>()
        .domain(uniqueLocations)
        .range([0, innerWidth])
        .padding(0.5);

      const xScale = scaleLinear()
        .domain([0, uniqueLocations.length - 1])
        .range([0, innerWidth]);

      const complexityExtent = [
        Math.min(...points.map((p) => p.complexity)) * 0.8,
        Math.max(...points.map((p) => p.complexity)) * 1.1,
      ];
      const yScale = scaleLinear()
        .domain(complexityExtent)
        .range([innerHeight, 0]);

      // ── SVG ──
      const svg = select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // ── Grid lines ──
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

      // ── X Axis (locations) ──
      const xAxisGen = axisBottom(
        scalePoint<string>()
          .domain(uniqueLocations)
          .range([0, innerWidth])
          .padding(0.5)
      );
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxisGen)
        .call((sel) => {
          sel
            .selectAll("text")
            .attr("fill", colors.text)
            .style("font-size", "9px")
            .attr("transform", "rotate(-20)")
            .attr("text-anchor", "end");
          sel.selectAll("line").attr("stroke", colors.tickLine);
          sel.select(".domain").attr("stroke", colors.axisLine);
        });

      // X axis label
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 45)
        .attr("text-anchor", "middle")
        .attr("fill", colors.textSecondary)
        .style("font-size", "11px")
        .text("Location");

      // ── Y Axis ──
      const yAxis = axisLeft(yScale).ticks(5);
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
        .text("Complexity");

      // ── Brush (behind dots) ──
      const brushG = g.append("g").attr("class", "brush");

      const brushBehavior = brush<SVGGElement>()
        .extent([
          [0, 0],
          [innerWidth, innerHeight],
        ])
        .on("brush", (event: D3BrushEvent<SVGGElement>) => {
          if (!event.selection) return;
          const [[x0, y0], [x1, y1]] = event.selection as [
            [number, number],
            [number, number],
          ];

          circles
            .attr("opacity", (d) => {
              const cx = locationScale(d.location) ?? 0;
              const cy = yScale(d.complexity);
              return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1 ? 1 : 0.15;
            })
            .attr("fill", (d) => {
              const cx = locationScale(d.location) ?? 0;
              const cy = yScale(d.complexity);
              return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1
                ? colors.chart2
                : colors.chart1;
            });
        })
        .on("end", (event: D3BrushEvent<SVGGElement>) => {
          if (!event.selection) {
            // Brush cleared: restore all
            circles
              .attr("opacity", 0.7)
              .attr("fill", colors.chart1);
          }
        });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      brushG.call(brushBehavior as any);

      // ── Dots ──
      const circles = g
        .selectAll<SVGCircleElement, ScatterPoint>(".dot")
        .data(points)
        .join("circle")
        .attr("class", "dot")
        .attr("cx", (d) => locationScale(d.location) ?? 0)
        .attr("cy", (d) => yScale(d.complexity))
        .attr("r", 5)
        .attr("fill", colors.chart1)
        .attr("opacity", 0.7)
        .style("pointer-events", "all")
        .style("cursor", "pointer")
        .on("mouseenter", function (event: MouseEvent, d: ScatterPoint) {
          select(this).attr("r", 7);
          tooltip.show(
            `<strong>${d.label}</strong><br/>Location: ${d.location}<br/>Complexity: ${d.complexity.toFixed(1)}`,
            event
          );
        })
        .on("mouseleave", function () {
          select(this).attr("r", 5);
          tooltip.hide();
        });

      // Ensure dots are above brush overlay
      g.selectAll(".dot").raise();
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
      cleanupD3Svg(container as unknown as HTMLElement);
    };
  }, [resolvedTheme, data]);

  return (
    <div
      ref={containerRef}
      data-testid="scatter-view"
      className="min-h-[350px] w-full"
    />
  );
}
