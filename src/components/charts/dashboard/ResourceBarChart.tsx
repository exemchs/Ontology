"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import { scaleBand, scaleLinear } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { stack } from "d3-shape";
import "d3-transition";

import { getDashboardResourceBars } from "@/data/dashboard-data";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import {
  cleanupD3Svg,
  createDebouncedResizeObserver,
} from "@/components/charts/shared/chart-utils";
import type { ResourceBarData } from "@/types";

type BarLayout = "stacked" | "grouped";

export function ResourceBarChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [layout, setLayout] = useState<BarLayout>("stacked");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;
    const tooltip = createTooltip();

    function render() {
      if (destroyed || !container) return;
      cleanupD3Svg(container);

      const data: ResourceBarData[] = getDashboardResourceBars();
      const colors = getChartColors();
      const keys: (keyof Pick<ResourceBarData, "cpu" | "memory" | "disk">)[] =
        ["cpu", "memory", "disk"];
      const keyLabels: Record<string, string> = {
        cpu: "CPU",
        memory: "Memory",
        disk: "Disk",
      };
      const keyColors: Record<string, string> = {
        cpu: colors.chart1,
        memory: colors.chart2,
        disk: colors.chart3,
      };

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height || 350;

      const margin = { top: 20, right: 20, bottom: 60, left: 50 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (innerWidth <= 0 || innerHeight <= 0) return;

      const svg = select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // X scale (band for node names)
      const xScale = scaleBand()
        .domain(data.map((d) => d.name))
        .range([0, innerWidth])
        .padding(0.2);

      // Y scale
      const yMax =
        layout === "stacked"
          ? Math.max(
              ...data.map((d) => d.cpu + d.memory + d.disk),
            )
          : Math.max(
              ...data.flatMap((d) => [d.cpu, d.memory, d.disk]),
            );
      const yScale = scaleLinear()
        .domain([0, Math.ceil(yMax / 10) * 10])
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

      // X Axis
      const xAxis = axisBottom(xScale);
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .call((sel) => {
          sel
            .selectAll("text")
            .attr("fill", colors.text)
            .style("font-size", "10px")
            .attr("text-anchor", "end")
            .attr("dx", "-0.5em")
            .attr("dy", "0.15em")
            .attr("transform", "rotate(-45)");
          sel.selectAll("line").attr("stroke", colors.tickLine);
          sel.select(".domain").attr("stroke", colors.axisLine);
        });

      // Y Axis
      const yAxis = axisLeft(yScale).ticks(5);
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

      // Y axis label
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .attr("fill", colors.textSecondary)
        .style("font-size", "11px")
        .text("%");

      // Legend
      const legend = g
        .append("g")
        .attr("transform", `translate(${innerWidth - 200}, -10)`);

      keys.forEach((key, i) => {
        const lg = legend
          .append("g")
          .attr("transform", `translate(${i * 70}, 0)`);
        lg.append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .attr("rx", 2)
          .attr("fill", keyColors[key]);
        lg.append("text")
          .attr("x", 14)
          .attr("y", 9)
          .attr("fill", colors.text)
          .style("font-size", "11px")
          .text(keyLabels[key]);
      });

      if (layout === "stacked") {
        // Stacked bars
        const stackGen = stack<ResourceBarData>().keys(keys);
        const series = stackGen(data);

        series.forEach((s) => {
          g.append("g")
            .attr("class", "stack-group")
            .attr("fill", keyColors[s.key])
            .selectAll("rect")
            .data(s)
            .join("rect")
            .attr("x", (d) => xScale(d.data.name) ?? 0)
            .attr("y", (d) => yScale(d[1]))
            .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
            .attr("width", xScale.bandwidth())
            .attr("rx", 1)
            .style("cursor", "pointer")
            .on("mouseenter", function (event: MouseEvent, d) {
              select(this).attr("opacity", 0.8);
              const value = d[1] - d[0];
              tooltip.show(
                `<strong>${d.data.name}</strong><br/>` +
                  `${keyLabels[s.key]}: ${value.toFixed(1)}%`,
                event,
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
          .domain(keys)
          .range([0, xScale.bandwidth()])
          .padding(0.05);

        data.forEach((d) => {
          const nodeG = g
            .append("g")
            .attr("transform", `translate(${xScale(d.name) ?? 0}, 0)`);

          keys.forEach((key) => {
            const value = d[key];
            nodeG
              .append("rect")
              .attr("x", innerScale(key) ?? 0)
              .attr("y", yScale(value))
              .attr("width", innerScale.bandwidth())
              .attr("height", innerHeight - yScale(value))
              .attr("fill", keyColors[key])
              .attr("rx", 1)
              .style("cursor", "pointer")
              .on("mouseenter", function (event: MouseEvent) {
                select(this).attr("opacity", 0.8);
                tooltip.show(
                  `<strong>${d.name}</strong><br/>` +
                    `${keyLabels[key]}: ${value.toFixed(1)}%`,
                  event,
                );
              })
              .on("mouseleave", function () {
                select(this).attr("opacity", 1);
                tooltip.hide();
              });
          });
        });
      }
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
  }, [resolvedTheme, layout]);

  return (
    <div data-testid="resource-bar-chart">
      {/* Toggle buttons */}
      <div className="mb-2 flex gap-1">
        <button
          onClick={() => setLayout("stacked")}
          className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
            layout === "stacked"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Stacked
        </button>
        <button
          onClick={() => setLayout("grouped")}
          className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
            layout === "grouped"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Grouped
        </button>
      </div>
      <div ref={containerRef} className="min-h-[300px] w-full" />
    </div>
  );
}
