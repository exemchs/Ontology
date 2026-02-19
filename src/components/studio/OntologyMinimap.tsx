"use client";

import { useEffect, useRef } from "react";
import { select } from "d3-selection";

export interface MinimapNode {
  x: number;
  y: number;
  name: string;
}

export interface MinimapTransform {
  x: number;
  y: number;
  k: number;
}

interface OntologyMinimapProps {
  nodes: MinimapNode[];
  viewportTransform: MinimapTransform;
  graphWidth: number;
  graphHeight: number;
}

const MINIMAP_W = 120;
const MINIMAP_H = 80;

export function OntologyMinimap({
  nodes,
  viewportTransform,
  graphWidth,
  graphHeight,
}: OntologyMinimapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || graphWidth === 0 || graphHeight === 0) return;

    const s = select(svg);

    // Compute scale to fit all nodes into minimap
    if (nodes.length === 0) {
      s.selectAll("*").remove();
      return;
    }

    const minX = Math.min(...nodes.map((n) => n.x));
    const maxX = Math.max(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxY = Math.max(...nodes.map((n) => n.y));

    const nodeRangeX = maxX - minX || 1;
    const nodeRangeY = maxY - minY || 1;
    const padding = 10;

    const scaleX = (MINIMAP_W - padding * 2) / nodeRangeX;
    const scaleY = (MINIMAP_H - padding * 2) / nodeRangeY;
    const scale = Math.min(scaleX, scaleY);

    // Clear previous
    s.selectAll("*").remove();

    // Background
    s.append("rect")
      .attr("width", MINIMAP_W)
      .attr("height", MINIMAP_H)
      .attr("fill", "var(--card)")
      .attr("fill-opacity", 0.8)
      .attr("stroke", "var(--border)")
      .attr("stroke-width", 1)
      .attr("rx", 4);

    // Node dots
    const nodesGroup = s.append("g");
    nodes.forEach((node) => {
      const cx = (node.x - minX) * scale + padding;
      const cy = (node.y - minY) * scale + padding;
      nodesGroup
        .append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", 2)
        .attr("fill", "var(--muted-foreground)")
        .attr("fill-opacity", 0.7);
    });

    // Viewport rectangle
    const { x: tx, y: ty, k } = viewportTransform;
    const vx = (-tx / k - minX) * scale + padding;
    const vy = (-ty / k - minY) * scale + padding;
    const vw = (graphWidth / k) * scale;
    const vh = (graphHeight / k) * scale;

    s.append("rect")
      .attr("x", vx)
      .attr("y", vy)
      .attr("width", Math.max(4, vw))
      .attr("height", Math.max(4, vh))
      .attr("fill", "none")
      .attr("stroke", "var(--primary)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3 2")
      .attr("stroke-opacity", 0.8);
  }, [nodes, viewportTransform, graphWidth, graphHeight]);

  return (
    <svg
      ref={svgRef}
      width={MINIMAP_W}
      height={MINIMAP_H}
      className="pointer-events-none"
      data-testid="ontology-minimap"
    />
  );
}
