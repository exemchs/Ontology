"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import {
  sankey,
  sankeyLinkHorizontal,
  sankeyJustify,
} from "d3-sankey";
import type { SankeyNode, SankeyLink } from "d3-sankey";

import { resolveColor, getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import { cleanupD3Svg, createDebouncedResizeObserver } from "@/components/charts/shared/chart-utils";
import type { GpuFunnelStage } from "@/data/gpu-data";

// ── Sankey node/link types ──────────────────────────────────────────────────

interface PipelineNode {
  name: string;
  color: string;
  isDropoff?: boolean;
}

interface PipelineLink {
  source: number;
  target: number;
  value: number;
}

type SNode = SankeyNode<PipelineNode, PipelineLink>;
type SLink = SankeyLink<PipelineNode, PipelineLink>;

// ── Build sankey graph from funnel stages ───────────────────────────────────

function buildSankeyData(stages: GpuFunnelStage[]) {
  const nodes: PipelineNode[] = [];
  const links: PipelineLink[] = [];

  // Main stage nodes
  stages.forEach((s) => {
    nodes.push({ name: s.label, color: s.color });
  });

  // Drop-off nodes + links between stages
  for (let i = 0; i < stages.length - 1; i++) {
    const current = stages[i];
    const next = stages[i + 1];
    const dropoff = current.value - next.value;

    // Main flow link
    links.push({ source: i, target: i + 1, value: next.value });

    // Drop-off link (if any)
    if (dropoff > 0) {
      const dropLabels = ["Idle", "Standby", "Underutilized"];
      const dropoffIdx = nodes.length;
      nodes.push({
        name: dropLabels[i] ?? "Other",
        color: "var(--muted-foreground)",
        isDropoff: true,
      });
      links.push({ source: i, target: dropoffIdx, value: dropoff });
    }
  }

  return { nodes, links };
}

// ── Component ───────────────────────────────────────────────────────────────

interface GpuPipelineSankeyProps {
  stages: GpuFunnelStage[];
  className?: string;
}

const CHART_HEIGHT = 200;

export function GpuPipelineSankey({ stages, className }: GpuPipelineSankeyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const { resolvedTheme } = useTheme();

  // Responsive width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = createDebouncedResizeObserver((w) => setWidth(w), 100);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // D3 rendering
  useEffect(() => {
    const container = containerRef.current;
    if (!container || width < 100) return;

    cleanupD3Svg(container);
    const tooltip = createTooltip();
    const colors = getChartColors();
    const height = CHART_HEIGHT;

    const { nodes: rawNodes, links: rawLinks } = buildSankeyData(stages);

    // Resolve colors
    const resolvedColors = rawNodes.map((n) => {
      const match = n.color.match(/var\((.+)\)/);
      return match ? resolveColor(match[1]) : resolveColor(n.color);
    });

    // Deep copy for d3-sankey (it mutates)
    const sankeyNodes = rawNodes.map((n) => ({ ...n }));
    const sankeyLinks = rawLinks.map((l) => ({ ...l }));

    const margin = { left: 8, right: 120 };

    const sankeyLayout = sankey<PipelineNode, PipelineLink>()
      .nodeWidth(14)
      .nodePadding(18)
      .nodeAlign(sankeyJustify)
      .extent([
        [margin.left, 4],
        [width - margin.right, height - 4],
      ]);

    const graph = sankeyLayout({
      nodes: sankeyNodes,
      links: sankeyLinks,
    });

    const svg = select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g");

    // Links
    const linkPaths = g
      .append("g")
      .attr("fill", "none")
      .selectAll("path")
      .data(graph.links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d) => {
        const srcIdx = graph.nodes.indexOf(d.source as SNode);
        return resolvedColors[srcIdx] ?? colors.chart1;
      })
      .attr("stroke-opacity", (d) => {
        const tgt = d.target as SNode;
        return tgt.isDropoff ? 0.15 : 0.35;
      })
      .attr("stroke-width", (d) => Math.max(1, d.width ?? 1));

    // Nodes
    g.append("g")
      .selectAll("rect")
      .data(graph.nodes)
      .join("rect")
      .attr("x", (d) => d.x0 ?? 0)
      .attr("y", (d) => d.y0 ?? 0)
      .attr("width", (d) => (d.x1 ?? 0) - (d.x0 ?? 0))
      .attr("height", (d) => Math.max(1, (d.y1 ?? 0) - (d.y0 ?? 0)))
      .attr("fill", (d) => {
        const idx = graph.nodes.indexOf(d);
        return resolvedColors[idx] ?? colors.chart1;
      })
      .attr("fill-opacity", (d) => (d.isDropoff ? 0.4 : 1))
      .attr("rx", 2);

    // Labels — place to the right of each node
    g.append("g")
      .selectAll("text")
      .data(graph.nodes)
      .join("text")
      .attr("x", (d) => (d.x1 ?? 0) + 6)
      .attr("y", (d) => ((d.y0 ?? 0) + (d.y1 ?? 0)) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .attr("fill", (d) => (d.isDropoff ? colors.textSecondary : colors.text))
      .style("font-size", "11px")
      .style("font-weight", (d) => (d.isDropoff ? "normal" : "500"))
      .text((d) => {
        const val = d.value ?? 0;
        return `${d.name} (${val})`;
      });

    // Hover on links
    linkPaths
      .on("mouseenter", function (event: MouseEvent, d: SLink) {
        linkPaths.attr("stroke-opacity", 0.08);
        select(this).attr("stroke-opacity", 0.6);

        const src = (d.source as SNode).name;
        const tgt = (d.target as SNode).name;
        tooltip.show(
          `<strong>${src}</strong> → <strong>${tgt}</strong><br/>GPUs: ${d.value}`,
          event
        );
      })
      .on("mousemove", function (event: MouseEvent, d: SLink) {
        const src = (d.source as SNode).name;
        const tgt = (d.target as SNode).name;
        tooltip.show(
          `<strong>${src}</strong> → <strong>${tgt}</strong><br/>GPUs: ${d.value}`,
          event
        );
      })
      .on("mouseleave", function () {
        linkPaths.attr("stroke-opacity", (d) => {
          const tgt = d.target as SNode;
          return tgt.isDropoff ? 0.15 : 0.35;
        });
        tooltip.hide();
      });

    return () => {
      tooltip.destroy();
      cleanupD3Svg(container);
    };
  }, [stages, width, resolvedTheme]);

  return (
    <div ref={containerRef} className={className} style={{ width: "100%", height: CHART_HEIGHT }} />
  );
}
