"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import { hierarchy, treemap, treemapSquarify, type HierarchyRectangularNode } from "d3-hierarchy";

import { resolveColor, getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import { cleanupD3Svg } from "@/components/charts/shared/chart-utils";
import type { GpuFunnelStage } from "@/data/gpu-data";

// ── Build treemap data from funnel stages ───────────────────────────────────

interface TreeNode {
  name: string;
  value?: number;
  color?: string;
  children?: TreeNode[];
}

function buildTreemapChildren(stages: GpuFunnelStage[]): TreeNode[] {
  const nodes: TreeNode[] = [];
  const labels = ["Idle", "Standby", "Underutilized"];

  for (let i = 0; i < stages.length - 1; i++) {
    const dropoff = stages[i].value - stages[i + 1].value;
    if (dropoff > 0) {
      nodes.push({
        name: labels[i] ?? "Other",
        value: dropoff,
        color: "var(--muted-foreground)",
      });
    }
  }

  const last = stages[stages.length - 1];
  nodes.push({
    name: last.label,
    value: last.value,
    color: "var(--chart-1)",
  });

  return nodes;
}

// ── Component ───────────────────────────────────────────────────────────────

interface GpuPipelineTreemapProps {
  stages: GpuFunnelStage[];
  className?: string;
}

const MIN_HEIGHT = 120;

export function GpuPipelineTreemap({ stages, className }: GpuPipelineTreemapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        setWidth(Math.round(w));
        setHeight(Math.round(h));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const chartHeight = Math.max(height, MIN_HEIGHT);
    if (!container || width < 100 || chartHeight < MIN_HEIGHT) return;

    cleanupD3Svg(container);
    const tooltip = createTooltip();
    const colors = getChartColors();

    const children = buildTreemapChildren(stages);
    const total = stages[0]?.value ?? 1;

    // Resolve colors
    const resolvedColors = new Map<string, string>();
    children.forEach((leaf) => {
      const match = (leaf.color ?? "").match(/var\((.+)\)/);
      resolvedColors.set(
        leaf.name,
        match ? resolveColor(match[1]) : colors.chart1
      );
    });

    // Hierarchy
    const rootData: TreeNode = { name: "root", children };
    const root = hierarchy(rootData)
      .sum((d) => d.value ?? 0);

    treemap<TreeNode>()
      .size([width, chartHeight])
      .tile(treemapSquarify.ratio(1))
      .paddingInner(3)
      .round(true)(root);

    const svg = select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", chartHeight);

    const leaves = root.leaves() as HierarchyRectangularNode<TreeNode>[];

    // Clip paths per tile
    const defs = svg.append("defs");
    leaves.forEach((d, i) => {
      defs.append("clipPath")
        .attr("id", `tile-clip-${i}`)
        .append("rect")
        .attr("width", d.x1 - d.x0)
        .attr("height", d.y1 - d.y0)
        .attr("rx", 4);
    });

    const nodes = svg
      .selectAll("g")
      .data(leaves)
      .join("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
      .attr("clip-path", (_, i) => `url(#tile-clip-${i})`);

    // Rectangles
    nodes
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("rx", 4)
      .attr("fill", (d) => {
        const name = d.data.name;
        const color = resolvedColors.get(name) ?? colors.chart1;
        return color;
      })
      .attr("fill-opacity", (d) => {
        const name = d.data.name;
        // Effective = full opacity, drop-offs = progressively lighter
        if (name === "Effective" || name === stages[stages.length - 1]?.label) return 1;
        if (name === "Underutilized") return 0.3;
        if (name === "Standby") return 0.2;
        return 0.12; // Idle
      })
      .style("cursor", "pointer")
      .on("mouseenter", function (event: MouseEvent, d) {
        select(this).attr("stroke", colors.text).attr("stroke-width", 1.5);
        const val = d.data.value ?? 0;
        const pct = Math.round((val / total) * 100);
        tooltip.show(
          `<strong>${d.data.name}</strong><br/>${val} GPU${val > 1 ? "s" : ""} (${pct}%)`,
          event
        );
      })
      .on("mousemove", function (event: MouseEvent, d) {
        const val = d.data.value ?? 0;
        const pct = Math.round((val / total) * 100);
        tooltip.show(
          `<strong>${d.data.name}</strong><br/>${val} GPU${val > 1 ? "s" : ""} (${pct}%)`,
          event
        );
      })
      .on("mouseleave", function () {
        select(this).attr("stroke", "none");
        tooltip.hide();
      });

    // Labels inside rectangles
    nodes
      .append("text")
      .attr("x", (d) => (d.x1 - d.x0) / 2)
      .attr("y", (d) => (d.y1 - d.y0) / 2 - 6)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", (d) => {
        const name = d.data.name;
        if (name === "Effective" || name === stages[stages.length - 1]?.label) return "#fff";
        return colors.text;
      })
      .style("font-size", "11px")
      .style("font-weight", "600")
      .style("pointer-events", "none")
      .text((d) => {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        if (w < 45 || h < 36) return "";
        return d.data.name;
      });

    // Value label
    nodes
      .append("text")
      .attr("x", (d) => (d.x1 - d.x0) / 2)
      .attr("y", (d) => (d.y1 - d.y0) / 2 + 8)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", (d) => {
        const name = d.data.name;
        if (name === "Effective" || name === stages[stages.length - 1]?.label) return "rgba(255,255,255,0.8)";
        return colors.textSecondary;
      })
      .style("font-size", "10px")
      .style("pointer-events", "none")
      .text((d) => {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        if (w < 45 || h < 36) return "";
        const val = d.data.value ?? 0;
        const pct = Math.round((val / total) * 100);
        return `${val} GPUs · ${pct}%`;
      });

    return () => {
      tooltip.destroy();
      cleanupD3Svg(container);
    };
  }, [stages, width, height, resolvedTheme]);

  return (
    <div ref={containerRef} className={className} style={{ width: "100%", minHeight: MIN_HEIGHT }} />
  );
}
