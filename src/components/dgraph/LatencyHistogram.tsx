"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import { bin as d3bin, max as d3max, median as d3median, quantile } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";

import { getDgraphLatencyData } from "@/data/dgraph-data";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import {
  cleanupD3Svg,
  createDebouncedResizeObserver,
} from "@/components/charts/shared/chart-utils";
import { ChartSkeleton } from "@/components/charts/shared/ChartSkeleton";

export function LatencyHistogram() {
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
    const data = getDgraphLatencyData();

    function render() {
      if (destroyedRef.current || !svgEl || !container) return;
      cleanupD3Svg(svgEl as unknown as HTMLElement);

      const colors = getChartColors();
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = Math.max(rect.height, 200);

      const margin = { top: 20, right: 20, bottom: 40, left: 50 };
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;

      if (innerW <= 0 || innerH <= 0) return;

      // Create bins
      const histogram = d3bin<number, number>()
        .domain([0, 500])
        .thresholds(15);

      const bins = histogram(data);

      // Scales
      const xScale = scaleLinear()
        .domain([0, 500])
        .range([0, innerW]);

      const yScale = scaleLinear()
        .domain([0, d3max(bins, (d) => d.length) ?? 0])
        .nice()
        .range([innerH, 0]);

      const svg = select(svgEl)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Bars
      g.selectAll("rect.bar")
        .data(bins)
        .join("rect")
        .attr("class", "bar")
        .attr("x", (d) => xScale(d.x0 ?? 0) + 1)
        .attr("y", (d) => yScale(d.length))
        .attr("width", (d) => Math.max(0, xScale(d.x1 ?? 0) - xScale(d.x0 ?? 0) - 2))
        .attr("height", (d) => innerH - yScale(d.length))
        .attr("fill", colors.chart1)
        .attr("rx", 2)
        .style("cursor", "pointer")
        .on("mouseenter", function (event: MouseEvent, d) {
          select(this).attr("opacity", 0.8);
          tooltip.show(
            `<strong>${d.x0?.toFixed(0)}-${d.x1?.toFixed(0)} ms</strong><br/>Count: ${d.length}`,
            event
          );
        })
        .on("mouseleave", function () {
          select(this).attr("opacity", 1);
          tooltip.hide();
        });

      // Compute median and p95
      const sorted = [...data].sort((a, b) => a - b);
      const medianVal = d3median(sorted) ?? 0;
      const p95Val = quantile(sorted, 0.95) ?? 0;

      // Median line
      g.append("line")
        .attr("x1", xScale(medianVal))
        .attr("x2", xScale(medianVal))
        .attr("y1", 0)
        .attr("y2", innerH)
        .attr("stroke", colors.chart4)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "6,3");

      g.append("text")
        .attr("x", xScale(medianVal) + 4)
        .attr("y", 12)
        .attr("fill", colors.chart4)
        .style("font-size", "10px")
        .text(`Median: ${medianVal.toFixed(0)}ms`);

      // P95 line
      g.append("line")
        .attr("x1", xScale(p95Val))
        .attr("x2", xScale(p95Val))
        .attr("y1", 0)
        .attr("y2", innerH)
        .attr("stroke", colors.chart8)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "6,3");

      g.append("text")
        .attr("x", xScale(p95Val) + 4)
        .attr("y", 24)
        .attr("fill", colors.chart8)
        .style("font-size", "10px")
        .text(`P95: ${p95Val.toFixed(0)}ms`);

      // X-axis
      g.append("g")
        .attr("transform", `translate(0,${innerH})`)
        .call(axisBottom(xScale).ticks(8).tickFormat((d) => `${d}ms`))
        .call((sel) => {
          sel.selectAll("text").attr("fill", colors.text).style("font-size", "10px");
          sel.selectAll("line").attr("stroke", colors.tickLine);
          sel.select(".domain").attr("stroke", colors.axisLine);
        });

      // Y-axis
      g.append("g")
        .call(axisLeft(yScale).ticks(5))
        .call((sel) => {
          sel.selectAll("text").attr("fill", colors.text).style("font-size", "10px");
          sel.selectAll("line").attr("stroke", colors.tickLine);
          sel.select(".domain").attr("stroke", colors.axisLine);
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
  }, [isClient, resolvedTheme]);

  if (!isClient) {
    return (
      <div className="w-full h-full min-h-[200px]">
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-[200px]">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
