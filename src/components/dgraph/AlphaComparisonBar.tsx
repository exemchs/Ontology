"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";

import { getDgraphAlphaComparison, type DgraphAlphaMetrics } from "@/data/dgraph-data";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import {
  cleanupD3Svg,
  createDebouncedResizeObserver,
} from "@/components/charts/shared/chart-utils";
import { ChartSkeleton } from "@/components/charts/shared/ChartSkeleton";
import { TruncatedLegend } from "@/components/charts/shared/TruncatedLegend";

const QPS_NORM_MAX = 2000;

const metrics = [
  { key: "cpu" as const, label: "CPU %", format: (v: number) => `${v}%` },
  { key: "memory" as const, label: "Memory %", format: (v: number) => `${v}%` },
  { key: "disk" as const, label: "Disk %", format: (v: number) => `${v}%` },
  { key: "qps" as const, label: "QPS", format: (v: number) => `${v} q/s` },
];

export function AlphaComparisonBar() {
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
    const data = getDgraphAlphaComparison();

    function render() {
      if (destroyedRef.current || !svgEl || !container) return;
      cleanupD3Svg(svgEl as unknown as HTMLElement);

      const colors = getChartColors();
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = Math.max(rect.height, 200);

      const margin = { top: 20, right: 20, bottom: 24, left: 44 };
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;

      if (innerW <= 0 || innerH <= 0) return;

      // Scales
      const x0 = scaleBand<string>()
        .domain(data.map((d) => d.alpha))
        .range([0, innerW])
        .paddingInner(0.2)
        .paddingOuter(0.1);

      const x1 = scaleBand<string>()
        .domain(metrics.map((m) => m.key))
        .range([0, x0.bandwidth()])
        .padding(0.08);

      const yScale = scaleLinear().domain([0, 100]).range([innerH, 0]);

      const metricColors = scaleOrdinal<string>()
        .domain(metrics.map((m) => m.key))
        .range([colors.chart1, colors.chart2, colors.chart4, colors.chart5]);

      const svg = select(svgEl)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Draw grouped bars
      data.forEach((d: DgraphAlphaMetrics) => {
        const alphaG = g
          .append("g")
          .attr("transform", `translate(${x0(d.alpha)},0)`);

        metrics.forEach((m) => {
          const rawVal = d[m.key];
          // Normalize QPS to 0-100 range for visual comparison
          const normalizedVal =
            m.key === "qps"
              ? Math.min(100, (rawVal / QPS_NORM_MAX) * 100)
              : rawVal;

          alphaG
            .append("rect")
            .attr("x", x1(m.key)!)
            .attr("y", yScale(normalizedVal))
            .attr("width", x1.bandwidth())
            .attr("height", innerH - yScale(normalizedVal))
            .attr("fill", metricColors(m.key))
            .attr("rx", 2)
            .style("cursor", "pointer")
            .on("mouseenter", function (event: MouseEvent) {
              select(this).attr("opacity", 0.8);
              tooltip.show(
                `<strong>${d.alpha}</strong><br/>${m.label}: ${m.format(rawVal)}`,
                event
              );
            })
            .on("mouseleave", function () {
              select(this).attr("opacity", 1);
              tooltip.hide();
            });
        });
      });

      // X-axis
      g.append("g")
        .attr("transform", `translate(0,${innerH})`)
        .call(axisBottom(x0).tickSize(0))
        .call((sel) => {
          sel.selectAll("text").attr("fill", colors.text).style("font-size", "11px");
          sel.select(".domain").attr("stroke", colors.axisLine);
        });

      // Y-axis
      g.append("g")
        .call(axisLeft(yScale).ticks(5).tickFormat((d) => `${d}%`))
        .call((sel) => {
          sel.selectAll("text").attr("fill", colors.text).style("font-size", "10px");
          sel.selectAll("line").attr("stroke", colors.tickLine);
          sel.select(".domain").attr("stroke", colors.axisLine);
        });

      // Legend is rendered as a React component (TruncatedLegend) below the SVG
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
  }, [isClient, resolvedTheme]);

  if (!isClient) {
    return (
      <div className="w-full min-h-[200px] max-h-[300px]">
        <ChartSkeleton />
      </div>
    );
  }

  const legendItems = metrics.map((m, i) => ({
    dataKey: m.key,
    color: [`var(--chart-1)`, `var(--chart-2)`, `var(--chart-4)`, `var(--chart-5)`][i],
    label: m.label,
  }));

  return (
    <div ref={containerRef} className="group w-full min-h-[200px] max-h-[300px] flex flex-col">
      <svg ref={svgRef} className="w-full flex-1 min-h-0" />
      <TruncatedLegend items={legendItems} maxVisible={4} autoHide />
    </div>
  );
}
