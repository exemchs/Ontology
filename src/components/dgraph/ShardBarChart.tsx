"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { max } from "d3-array";
import "d3-transition";

import {
  getDgraphShards,
  type DgraphShard,
} from "@/data/dgraph-data";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import {
  cleanupD3Svg,
  createDebouncedResizeObserver,
  formatNumber,
} from "@/components/charts/shared/chart-utils";
import { cn } from "@/lib/utils";

interface ShardBarChartProps {
  className?: string;
}

export function ShardBarChart({ className }: ShardBarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const destroyedRef = useRef(false);
  const { resolvedTheme } = useTheme();

  // Compute stable data outside useEffect for legend rendering
  const shardData = useMemo(() => getDgraphShards(), []);

  const uniqueShardNames = useMemo(() => {
    const names = new Set<string>();
    shardData.forEach((group) => {
      group.shards.forEach((s) => names.add(s.name));
    });
    return Array.from(names);
  }, [shardData]);

  // Build color scale at component level for both chart and legend
  const colorScale = useMemo(() => {
    // We need resolved chart colors for the ordinal scale
    // But since CSS vars may not be available at SSR, we map to CSS var references
    // The D3 chart will use resolved colors; the legend uses CSS vars directly
    return (name: string): string => {
      const idx = uniqueShardNames.indexOf(name);
      // Return CSS var references for legend usage
      return `var(--chart-${(idx % 8) + 1})`;
    };
  }, [uniqueShardNames]);

  useEffect(() => {
    const svgEl = svgRef.current;
    const container = containerRef.current;
    if (!svgEl || !container) return;

    destroyedRef.current = false;
    const tooltip = createTooltip();

    function render() {
      if (destroyedRef.current || !svgEl || !container) return;
      cleanupD3Svg(svgEl as unknown as HTMLElement);

      const data: DgraphShard[] = shardData;
      const colors = getChartColors();

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = 280;

      const margin = { top: 20, right: 20, bottom: 40, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (innerWidth <= 0 || innerHeight <= 0) return;

      const svg = select(svgEl)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Collect all unique shard names for inner scale + color scale
      const allShardNames = uniqueShardNames;

      // Color scale with resolved chart colors
      const chartColorArray = [
        colors.chart1, colors.chart2, colors.chart3, colors.chart4,
        colors.chart5, colors.chart6, colors.chart7, colors.chart8,
      ];
      const d3ColorScale = scaleOrdinal<string>()
        .domain(allShardNames)
        .range(chartColorArray);

      // X outer scale: group names
      const x0 = scaleBand()
        .domain(data.map((d) => d.group))
        .range([0, innerWidth])
        .paddingInner(0.2);

      // X inner scale: shard names within each group
      const x1 = scaleBand()
        .domain(allShardNames)
        .range([0, x0.bandwidth()])
        .padding(0.05);

      // Y scale
      const yMax = max(data, (d) => max(d.shards, (s) => s.size)) ?? 0;
      const yScale = scaleLinear()
        .domain([0, yMax])
        .nice()
        .range([innerHeight, 0]);

      // X Axis
      const xAxis = axisBottom(x0);
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .call((sel) => {
          sel.selectAll("text").attr("fill", colors.text).style("font-size", "11px");
          sel.selectAll("line").attr("stroke", colors.tickLine);
          sel.select(".domain").attr("stroke", colors.axisLine);
        });

      // Y Axis
      const yAxis = axisLeft(yScale)
        .ticks(6)
        .tickFormat((d) => formatNumber(d as number));
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
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .attr("fill", colors.textSecondary)
        .style("font-size", "11px")
        .text("Size");

      // Draw grouped bars
      data.forEach((groupData) => {
        const groupG = g
          .append("g")
          .attr("transform", `translate(${x0(groupData.group) ?? 0}, 0)`);

        groupData.shards.forEach((shard) => {
          groupG
            .append("rect")
            .attr("x", x1(shard.name) ?? 0)
            .attr("y", yScale(shard.size))
            .attr("width", x1.bandwidth())
            .attr("height", innerHeight - yScale(shard.size))
            .attr("fill", d3ColorScale(shard.name))
            .attr("rx", 1)
            .style("cursor", "pointer")
            .on("mouseenter", function (event: MouseEvent) {
              select(this).attr("opacity", 0.75);
              tooltip.show(
                `<strong>${shard.name}</strong><br/>` +
                  `Group: ${groupData.group}<br/>` +
                  `Size: ${formatNumber(shard.size)}`,
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
  }, [resolvedTheme, shardData, uniqueShardNames]);

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <svg ref={svgRef} className="w-full" style={{ height: 280 }} data-testid="shard-bar-chart" />
      <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
        {uniqueShardNames.map((name) => (
          <span key={name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: colorScale(name) }}
            />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
