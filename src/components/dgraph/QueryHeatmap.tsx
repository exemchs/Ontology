"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import { scaleBand, scaleSequential, scaleLinear } from "d3-scale";
import { interpolateBlues } from "d3-scale-chromatic";
import { axisBottom, axisLeft } from "d3-axis";
import { max as d3max } from "d3-array";

import { getDgraphHeatmapData, type DgraphHeatmapCell } from "@/data/dgraph-data";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import {
  cleanupD3Svg,
  createDebouncedResizeObserver,
} from "@/components/charts/shared/chart-utils";
import { ChartSkeleton } from "@/components/charts/shared/ChartSkeleton";

export function QueryHeatmap() {
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
    const data = getDgraphHeatmapData();

    function render() {
      if (destroyedRef.current || !svgEl || !container) return;
      cleanupD3Svg(svgEl as unknown as HTMLElement);

      const colors = getChartColors();
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = Math.max(rect.height, 200);

      const margin = { top: 20, right: 80, bottom: 40, left: 70 };
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;

      if (innerW <= 0 || innerH <= 0) return;

      const hours = Array.from({ length: 24 }, (_, i) => i);
      const queryTypes = ["mutation", "query", "schema", "backup", "health"];
      const maxCount = d3max(data, (d: DgraphHeatmapCell) => d.count) ?? 1;

      // Scales
      const xScale = scaleBand<number>()
        .domain(hours)
        .range([0, innerW])
        .padding(0.03);

      const yScale = scaleBand<string>()
        .domain(queryTypes)
        .range([0, innerH])
        .padding(0.05);

      const colorScale = scaleSequential(interpolateBlues).domain([0, maxCount]);

      const svg = select(svgEl)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Draw cells
      g.selectAll("rect.cell")
        .data(data)
        .join("rect")
        .attr("class", "cell")
        .attr("x", (d: DgraphHeatmapCell) => xScale(d.hour)!)
        .attr("y", (d: DgraphHeatmapCell) => yScale(d.queryType)!)
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", (d: DgraphHeatmapCell) => colorScale(d.count))
        .attr("rx", 2)
        .style("cursor", "pointer")
        .on("mouseenter", function (event: MouseEvent, d: DgraphHeatmapCell) {
          select(this).attr("stroke", colors.text).attr("stroke-width", 1.5);
          tooltip.show(
            `<strong>${d.queryType}</strong><br/>` +
              `Hour: ${String(d.hour).padStart(2, "0")}:00<br/>` +
              `Count: ${d.count}`,
            event
          );
        })
        .on("mouseleave", function () {
          select(this).attr("stroke", "none");
          tooltip.hide();
        });

      // X-axis: show every 3rd hour
      const xAxis = axisBottom(xScale)
        .tickValues([0, 3, 6, 9, 12, 15, 18, 21])
        .tickFormat((d) => `${d}:00`);

      g.append("g")
        .attr("transform", `translate(0,${innerH})`)
        .call(xAxis)
        .call((sel) => {
          sel.selectAll("text").attr("fill", colors.text).style("font-size", "10px");
          sel.selectAll("line").attr("stroke", colors.tickLine);
          sel.select(".domain").attr("stroke", colors.axisLine);
        });

      // Y-axis: query type names
      g.append("g")
        .call(axisLeft(yScale))
        .call((sel) => {
          sel.selectAll("text").attr("fill", colors.text).style("font-size", "11px");
          sel.selectAll("line").attr("stroke", colors.tickLine);
          sel.select(".domain").attr("stroke", colors.axisLine);
        });

      // Color legend (right side)
      const legendWidth = 14;
      const legendHeight = innerH;
      const legendX = innerW + 20;

      const defs = svg.append("defs");
      const gradientId = "dgraph-heatmap-gradient";
      const gradient = defs
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

      const numStops = 10;
      for (let i = 0; i <= numStops; i++) {
        const t = i / numStops;
        gradient
          .append("stop")
          .attr("offset", `${t * 100}%`)
          .attr("stop-color", colorScale(t * maxCount));
      }

      const legendG = g
        .append("g")
        .attr("transform", `translate(${legendX},0)`);

      legendG
        .append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("fill", `url(#${gradientId})`)
        .attr("rx", 2);

      const legendScale = scaleLinear()
        .domain([0, maxCount])
        .range([legendHeight, 0]);

      const legendAxis = axisLeft(legendScale)
        .ticks(5)
        .tickSize(-legendWidth);

      legendG
        .append("g")
        .call(legendAxis)
        .call((sel) => {
          sel.selectAll("text").attr("fill", colors.textSecondary).style("font-size", "9px");
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
  }, [isClient, resolvedTheme]);

  if (!isClient) {
    return (
      <div className="w-full min-h-[200px] max-h-[300px]">
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full min-h-[200px] max-h-[300px]">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
