"use client";

import { useEffect, useRef, useState } from "react";
import { select } from "d3-selection";
import { hierarchy, treemap, treemapSquarify, type HierarchyRectangularNode } from "d3-hierarchy";
import { scaleOrdinal } from "d3-scale";

import type { OntologyType } from "@/types";
import { cleanupD3Svg, createDebouncedResizeObserver } from "@/components/charts/shared/chart-utils";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import { cn } from "@/lib/utils";

interface TypeDistributionTreemapProps {
  types: OntologyType[];
  className?: string;
}

export function TypeDistributionTreemap({
  types,
  className,
}: TypeDistributionTreemapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const destroyedRef = useRef(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const svgEl = svgRef.current;
    const containerEl = containerRef.current;
    if (!svgEl || !containerEl) return;

    destroyedRef.current = false;
    let cleanupFn: (() => void) | null = null;

    const resizeObserver = createDebouncedResizeObserver((w, h) => {
      if (destroyedRef.current || w === 0 || h === 0) return;
      renderTreemap(w, h);
    }, 100);

    resizeObserver.observe(containerEl);

    function renderTreemap(width: number, height: number) {
      cleanupD3Svg(svgEl as unknown as HTMLElement);

      const colors = getChartColors();
      const tooltip = createTooltip();

      // Build color scale
      const colorValues = [
        colors.chart1,
        colors.chart2,
        colors.chart3,
        colors.chart4,
        colors.chart5,
        colors.chart6,
      ];
      const colorScale = scaleOrdinal<string>()
        .domain(types.map((t) => t.name))
        .range(colorValues);

      // Build hierarchy data
      const rootData = {
        name: "Schema",
        children: types.map((t) => ({
          name: t.name,
          value: t.nodeCount,
          predicateCount: t.predicates.length,
        })),
      };

      type TreeNode = typeof rootData;

      const root = hierarchy<TreeNode>(rootData)
        .sum((d) => (d as { value?: number }).value ?? 0)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

      // Create treemap layout
      const treemapLayout = treemap<TreeNode>()
        .size([width, height])
        .padding(2)
        .round(true)
        .tile(treemapSquarify);

      const treemapRoot = treemapLayout(root);

      // Render SVG
      const svg = select(svgEl as SVGSVGElement)
        .attr("width", width)
        .attr("height", height);

      const leaves = treemapRoot.leaves() as HierarchyRectangularNode<TreeNode>[];

      const cells = svg
        .selectAll<SVGGElement, HierarchyRectangularNode<TreeNode>>("g")
        .data(leaves)
        .join("g")
        .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

      // Colored rectangles
      cells
        .append("rect")
        .attr("width", (d) => Math.max(0, d.x1 - d.x0))
        .attr("height", (d) => Math.max(0, d.y1 - d.y0))
        .attr("fill", (d) => colorScale(d.data.name))
        .attr("fill-opacity", 0.8)
        .attr("rx", 3)
        .attr("stroke", colors.background)
        .attr("stroke-width", 1)
        .style("cursor", "pointer")
        .on("mouseenter", function (event: MouseEvent, d) {
          select(this).attr("fill-opacity", 1);
          const child = d.data as { name: string; value?: number; predicateCount?: number };
          tooltip.show(
            `<strong>${child.name}</strong><br/>Records: ${(child.value ?? 0).toLocaleString()}<br/>Predicates: ${child.predicateCount ?? 0}`,
            event
          );
        })
        .on("mousemove", function (event: MouseEvent, d) {
          const child = d.data as { name: string; value?: number; predicateCount?: number };
          tooltip.show(
            `<strong>${child.name}</strong><br/>Records: ${(child.value ?? 0).toLocaleString()}<br/>Predicates: ${child.predicateCount ?? 0}`,
            event
          );
        })
        .on("mouseleave", function () {
          select(this).attr("fill-opacity", 0.8);
          tooltip.hide();
        });

      // Labels: type name
      cells
        .append("text")
        .attr("x", 6)
        .attr("y", 16)
        .attr("fill", colors.background)
        .attr("font-size", (d) => {
          const cellW = d.x1 - d.x0;
          return cellW > 80 ? "11px" : cellW > 50 ? "9px" : "0px";
        })
        .attr("font-weight", "600")
        .attr("pointer-events", "none")
        .text((d) => d.data.name);

      // Labels: count
      cells
        .append("text")
        .attr("x", 6)
        .attr("y", 30)
        .attr("fill", colors.background)
        .attr("fill-opacity", 0.8)
        .attr("font-size", (d) => {
          const cellW = d.x1 - d.x0;
          const cellH = d.y1 - d.y0;
          return cellW > 60 && cellH > 35 ? "10px" : "0px";
        })
        .attr("pointer-events", "none")
        .text((d) => {
          const child = d.data as { value?: number };
          const v = child.value ?? 0;
          if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
          return String(v);
        });

      cleanupFn = () => {
        tooltip.destroy();
        cleanupD3Svg(svgEl as unknown as HTMLElement);
      };
    }

    return () => {
      destroyedRef.current = true;
      resizeObserver.disconnect();
      cleanupFn?.();
    };
  }, [types, isClient]);

  return (
    <div
      className={cn("relative flex flex-col w-full h-full min-h-[200px]", className)}
      data-testid="type-distribution-treemap"
    >
      {/* Header */}
      <div className="flex items-center px-3 pt-3 pb-1 shrink-0">
        <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          Records by Type
        </span>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="flex-1 min-h-0 px-3 pb-3">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}
