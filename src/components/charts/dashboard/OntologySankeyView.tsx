"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import {
  sankey,
  sankeyLinkHorizontal,
  sankeyCenter,
  type SankeyNode,
  type SankeyLink,
} from "d3-sankey";

import type { SankeyData, SankeyNodeData, SankeyLinkData } from "@/lib/ontology-relation-data";
import { resolveColor, getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import { cleanupD3Svg } from "@/components/charts/shared/chart-utils";

interface OntologySankeyViewProps {
  data: SankeyData;
  width: number;
  height: number;
  direction: "all" | "inbound" | "outbound";
}

type SNode = SankeyNode<SankeyNodeData, SankeyLinkData>;
type SLink = SankeyLink<SankeyNodeData, SankeyLinkData>;

export function OntologySankeyView({
  data,
  width,
  height,
  direction,
}: OntologySankeyViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || width === 0 || height === 0) return;

    cleanupD3Svg(container);
    const tooltip = createTooltip();
    const colors = getChartColors();

    // Resolve node colors from CSS variables
    const resolvedNodeColors = data.nodes.map((n) => {
      const match = n.color.match(/var\((.+)\)/);
      return match ? resolveColor(match[1]) : resolveColor(n.color);
    });

    // Filter out self-referencing links
    const filteredLinks = data.links.filter((l) => l.source !== l.target);

    // Guard: if no links, show empty state
    if (filteredLinks.length === 0) {
      const svg = select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", colors.textSecondary)
        .style("font-size", "13px")
        .text(`No ${direction} relations to display`);

      return () => {
        tooltip.destroy();
        cleanupD3Svg(container);
      };
    }

    // Deep copy data for sankey (it mutates)
    const sankeyNodes = data.nodes.map((n) => ({ ...n }));
    const sankeyLinks = filteredLinks.map((l) => ({ ...l }));

    // Sankey layout
    const sankeyLayout = sankey<SankeyNodeData, SankeyLinkData>()
      .nodeWidth(15)
      .nodePadding(10)
      .nodeAlign(sankeyCenter)
      .extent([
        [1, 5],
        [width - 1, height - 5],
      ]);

    const sankeyGraph = sankeyLayout({
      nodes: sankeyNodes,
      links: sankeyLinks,
    });

    const svg = select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g");

    // Draw links
    const linkPaths = g
      .append("g")
      .attr("fill", "none")
      .selectAll("path")
      .data(sankeyGraph.links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d) => {
        const sourceNode = d.source as SNode;
        const sourceIdx = sankeyGraph.nodes.indexOf(sourceNode);
        return resolvedNodeColors[sourceIdx] ?? colors.chart1;
      })
      .attr("stroke-opacity", 0.3)
      .attr("stroke-width", (d) => Math.max(1, d.width ?? 1));

    // Draw nodes
    g.append("g")
      .selectAll("rect")
      .data(sankeyGraph.nodes)
      .join("rect")
      .attr("x", (d) => d.x0 ?? 0)
      .attr("y", (d) => d.y0 ?? 0)
      .attr("width", (d) => (d.x1 ?? 0) - (d.x0 ?? 0))
      .attr("height", (d) => Math.max(1, (d.y1 ?? 0) - (d.y0 ?? 0)))
      .attr("fill", (d) => {
        const idx = sankeyGraph.nodes.indexOf(d);
        return resolvedNodeColors[idx] ?? colors.chart1;
      })
      .attr("stroke", colors.background)
      .attr("stroke-width", 1);

    // Node labels
    g.append("g")
      .selectAll("text")
      .data(sankeyGraph.nodes)
      .join("text")
      .attr("x", (d) => {
        const x0 = d.x0 ?? 0;
        const x1 = d.x1 ?? 0;
        return x0 < width / 2 ? x1 + 6 : x0 - 6;
      })
      .attr("y", (d) => ((d.y0 ?? 0) + (d.y1 ?? 0)) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d) => ((d.x0 ?? 0) < width / 2 ? "start" : "end"))
      .attr("fill", colors.text)
      .style("font-size", "11px")
      .text((d) => d.name);

    // Hover interaction on links
    linkPaths
      .on("mouseenter", function (event: MouseEvent, d: SLink) {
        // Dim all links
        linkPaths.attr("stroke-opacity", 0.1);
        // Highlight hovered
        select(this)
          .attr("stroke-opacity", 0.6)
          .attr("stroke-width", Math.max(1, (d.width ?? 1) * 1.2));

        const sourceName = (d.source as SNode).name;
        const targetName = (d.target as SNode).name;
        const label = (d as unknown as SankeyLinkData).label ?? "";
        const value = d.value ?? 0;

        tooltip.show(
          `<strong>${sourceName}</strong> &rarr; <strong>${targetName}</strong><br/>` +
            `${label}<br/>Value: ${value}`,
          event
        );
      })
      .on("mouseleave", function () {
        // Restore all links
        linkPaths.attr("stroke-opacity", 0.3);
        linkPaths.attr("stroke-width", (d) => Math.max(1, d.width ?? 1));
        tooltip.hide();
      });

    return () => {
      tooltip.destroy();
      cleanupD3Svg(container);
    };
  }, [data, width, height, direction, resolvedTheme]);

  return <div ref={containerRef} style={{ width, height }} />;
}
