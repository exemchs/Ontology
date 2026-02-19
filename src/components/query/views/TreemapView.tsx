"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import { hierarchy, treemap, type HierarchyRectangularNode } from "d3-hierarchy";
import { scaleOrdinal } from "d3-scale";
import "d3-transition";

import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import {
  cleanupD3Svg,
  createDebouncedResizeObserver,
} from "@/components/charts/shared/chart-utils";

// ── Types ───────────────────────────────────────────────────────────────────

interface TreemapViewProps {
  data: Record<string, unknown>[];
}

interface TreeNode {
  name: string;
  value?: number;
  children?: TreeNode[];
}

// ── Component ───────────────────────────────────────────────────────────────

export function TreemapView({ data }: TreemapViewProps) {
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

      // ── Data transformation: group by equipment type ──
      const typeGroups = new Map<string, { name: string; count: number }[]>();

      data.forEach((row) => {
        const type = String(row.type ?? "Unknown");
        const name = String(
          row.equipment_id ?? row.name ?? `Item-${typeGroups.size}`
        );

        if (!typeGroups.has(type)) {
          typeGroups.set(type, []);
        }
        typeGroups.get(type)!.push({ name, count: 1 });
      });

      if (typeGroups.size === 0) return;

      // Build hierarchy data
      const hierarchyData: TreeNode = {
        name: "Equipment",
        children: Array.from(typeGroups.entries()).map(([type, items]) => ({
          name: type,
          children: items.map((item) => ({
            name: item.name,
            value: 1,
          })),
        })),
      };

      // ── Color scale ──
      const types = Array.from(typeGroups.keys());
      const colorScale = scaleOrdinal<string>()
        .domain(types)
        .range([colors.chart1, colors.chart2, colors.chart3, colors.chart4, colors.chart5, colors.chart6]);

      // ── Treemap layout ──
      const root = hierarchy(hierarchyData)
        .sum((d) => d.value ?? 0)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

      const treemapRoot = treemap<TreeNode>().size([width, height]).padding(2).round(true)(root) as HierarchyRectangularNode<TreeNode>;

      // ── SVG ──
      const svg = select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      const leaves = treemapRoot.leaves() as HierarchyRectangularNode<TreeNode>[];

      // ── Rectangles ──
      svg
        .selectAll<SVGRectElement, typeof leaves[0]>(".leaf")
        .data(leaves)
        .join("rect")
        .attr("class", "leaf")
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("width", (d) => Math.max(0, d.x1 - d.x0))
        .attr("height", (d) => Math.max(0, d.y1 - d.y0))
        .attr("fill", (d) => {
          // Use parent (type group) name for color
          const parentName = d.parent?.data.name ?? "Unknown";
          return colorScale(parentName);
        })
        .attr("rx", 2)
        .attr("opacity", 0.85)
        .style("cursor", "pointer")
        .on("mouseenter", function (event: MouseEvent, d) {
          select(this).attr("opacity", 1).attr("stroke", colors.text).attr("stroke-width", 1.5);
          const parentType = d.parent?.data.name ?? "Unknown";
          tooltip.show(
            `<strong>${d.data.name}</strong><br/>Type: ${parentType}<br/>Count: ${d.value}`,
            event
          );
        })
        .on("mouseleave", function () {
          select(this).attr("opacity", 0.85).attr("stroke", "none");
          tooltip.hide();
        });

      // ── Labels (only if rectangle is large enough) ──
      svg
        .selectAll<SVGTextElement, typeof leaves[0]>(".leaf-label")
        .data(leaves)
        .join("text")
        .attr("class", "leaf-label")
        .attr("x", (d) => d.x0 + 4)
        .attr("y", (d) => d.y0 + 14)
        .attr("fill", colors.background)
        .style("font-size", "10px")
        .style("font-weight", "600")
        .style("pointer-events", "none")
        .text((d) => {
          const w = d.x1 - d.x0;
          const h = d.y1 - d.y0;
          return w > 50 && h > 20 ? d.data.name : "";
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
      cleanupD3Svg(container as unknown as HTMLElement);
    };
  }, [resolvedTheme, data]);

  return (
    <div
      ref={containerRef}
      data-testid="treemap-view"
      className="min-h-[350px] w-full"
    />
  );
}
