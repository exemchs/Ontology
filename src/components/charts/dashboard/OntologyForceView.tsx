"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";

import type { ForceData, ForceNode, ForceLink } from "@/lib/ontology-relation-data";
import { resolveColor, getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import { cleanupD3Svg } from "@/components/charts/shared/chart-utils";
import { formatNumber } from "@/components/charts/shared/chart-utils";

// D3 simulation augmented node type
interface SimNode extends SimulationNodeDatum, ForceNode {
  x: number;
  y: number;
}

// D3 simulation augmented link type
interface SimLink extends SimulationLinkDatum<SimNode> {
  label: string;
}

interface OntologyForceViewProps {
  data: ForceData;
  width: number;
  height: number;
}

export function OntologyForceView({ data, width, height }: OntologyForceViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || width === 0 || height === 0) return;

    cleanupD3Svg(container);
    const tooltip = createTooltip();
    const colors = getChartColors();

    // Resolve node colors from CSS variables
    const resolvedNodeColors = new Map<string, string>();
    data.nodes.forEach((n) => {
      const match = n.color.match(/var\((.+)\)/);
      resolvedNodeColors.set(n.id, match ? resolveColor(match[1]) : resolveColor(n.color));
    });

    // Create deep copies for simulation (D3 mutates these)
    const simNodes: SimNode[] = data.nodes.map((n) => ({
      ...n,
      x: width / 2,
      y: height / 2,
    }));

    const simLinks: SimLink[] = data.links.map((l) => ({
      source: l.source,
      target: l.target,
      label: l.label,
    }));

    const svg = select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g");

    // Draw links
    const linkLines = g
      .append("g")
      .selectAll("line")
      .data(simLinks)
      .join("line")
      .attr("stroke", colors.gridLine)
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.6);

    // Draw link labels
    const linkLabels = g
      .append("g")
      .selectAll("text")
      .data(simLinks)
      .join("text")
      .attr("fill", colors.textSecondary)
      .style("font-size", "9px")
      .attr("text-anchor", "middle")
      .text((d) => d.label);

    // Node radius based on nodeCount
    function getRadius(nodeCount: number): number {
      return Math.max(8, Math.min(25, Math.log(nodeCount) * 3));
    }

    // Draw nodes
    const nodeCircles = g
      .append("g")
      .selectAll("circle")
      .data(simNodes)
      .join("circle")
      .attr("r", (d) => getRadius(d.nodeCount))
      .attr("fill", (d) => resolvedNodeColors.get(d.id) ?? colors.chart1)
      .attr("stroke", colors.background)
      .attr("stroke-width", 2)
      .attr("cursor", "pointer");

    // Node labels
    const nodeLabels = g
      .append("g")
      .selectAll("text")
      .data(simNodes)
      .join("text")
      .attr("fill", colors.text)
      .style("font-size", "11px")
      .style("font-weight", "500")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => -getRadius(d.nodeCount) - 6)
      .text((d) => d.name);

    // Force simulation
    const simulation = forceSimulation<SimNode>(simNodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(120)
      )
      .force("charge", forceManyBody().strength(-200))
      .force("center", forceCenter(width / 2, height / 2))
      .force("collide", forceCollide<SimNode>().radius((d) => getRadius(d.nodeCount) + 10));

    simulation.on("tick", () => {
      linkLines
        .attr("x1", (d) => (d.source as SimNode).x)
        .attr("y1", (d) => (d.source as SimNode).y)
        .attr("x2", (d) => (d.target as SimNode).x)
        .attr("y2", (d) => (d.target as SimNode).y);

      linkLabels
        .attr("x", (d) => ((d.source as SimNode).x + (d.target as SimNode).x) / 2)
        .attr("y", (d) => ((d.source as SimNode).y + (d.target as SimNode).y) / 2);

      nodeCircles.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      nodeLabels.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });

    // Hover interaction on nodes
    nodeCircles
      .on("mouseenter", function (event: MouseEvent, d: SimNode) {
        // Find connected link indices
        const connectedNodeIds = new Set<string>();
        connectedNodeIds.add(d.id);

        simLinks.forEach((link) => {
          const sourceId = typeof link.source === "object" ? (link.source as SimNode).id : String(link.source);
          const targetId = typeof link.target === "object" ? (link.target as SimNode).id : String(link.target);
          if (sourceId === d.id) connectedNodeIds.add(targetId);
          if (targetId === d.id) connectedNodeIds.add(sourceId);
        });

        // Dim all
        nodeCircles.attr("opacity", (n) => (connectedNodeIds.has(n.id) ? 1 : 0.15));
        nodeLabels.attr("opacity", (n) => (connectedNodeIds.has(n.id) ? 1 : 0.15));
        linkLines.attr("stroke-opacity", (l) => {
          const sourceId = typeof l.source === "object" ? (l.source as SimNode).id : l.source;
          const targetId = typeof l.target === "object" ? (l.target as SimNode).id : l.target;
          return sourceId === d.id || targetId === d.id ? 0.8 : 0.05;
        });
        linkLabels.attr("opacity", (l) => {
          const sourceId = typeof l.source === "object" ? (l.source as SimNode).id : l.source;
          const targetId = typeof l.target === "object" ? (l.target as SimNode).id : l.target;
          return sourceId === d.id || targetId === d.id ? 1 : 0.05;
        });

        tooltip.show(
          `<strong>${d.name}</strong><br/>Nodes: ${formatNumber(d.nodeCount)}`,
          event
        );
      })
      .on("mouseleave", function () {
        // Restore all
        nodeCircles.attr("opacity", 1);
        nodeLabels.attr("opacity", 1);
        linkLines.attr("stroke-opacity", 0.6);
        linkLabels.attr("opacity", 1);
        tooltip.hide();
      });

    return () => {
      simulation.stop();
      tooltip.destroy();
      cleanupD3Svg(container);
    };
  }, [data, width, height, resolvedTheme]);

  return <div ref={containerRef} style={{ width, height }} />;
}
