"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import { scalePoint } from "d3-scale";
import "d3-transition";

import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import {
  cleanupD3Svg,
  createDebouncedResizeObserver,
} from "@/components/charts/shared/chart-utils";

// ── Types ───────────────────────────────────────────────────────────────────

interface ArcDiagramViewProps {
  data: Record<string, unknown>[];
}

interface ArcNode {
  id: string;
  group: "equipment" | "bay";
}

interface ArcLink {
  source: string;
  target: string;
}

// ── Component ───────────────────────────────────────────────────────────────

export function ArcDiagramView({ data }: ArcDiagramViewProps) {
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

      const margin = { top: 20, right: 30, bottom: 80, left: 30 };
      const innerWidth = width - margin.left - margin.right;
      const yBase = height - margin.bottom;

      // ── Data transformation: equipment-bay connections ──
      const equipmentIds = new Set<string>();
      const bayIds = new Set<string>();
      const links: ArcLink[] = [];

      data.forEach((row) => {
        const eqId = String(row.equipment_id ?? row.name ?? "");
        const loc = String(row.location ?? "");

        if (eqId) equipmentIds.add(eqId);
        if (loc) bayIds.add(loc);

        if (eqId && loc) {
          links.push({ source: eqId, target: loc });
        }
      });

      const nodes: ArcNode[] = [
        ...Array.from(equipmentIds).map((id) => ({
          id,
          group: "equipment" as const,
        })),
        ...Array.from(bayIds).map((id) => ({
          id,
          group: "bay" as const,
        })),
      ];

      if (nodes.length === 0) return;

      const nodeIds = nodes.map((n) => n.id);

      // ── Scale ──
      const xScale = scalePoint<string>()
        .domain(nodeIds)
        .range([0, innerWidth])
        .padding(0.5);

      // ── SVG ──
      const svg = select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},0)`);

      // ── Arc paths ──
      g.selectAll<SVGPathElement, ArcLink>(".arc")
        .data(links)
        .join("path")
        .attr("class", "arc")
        .attr("d", (d) => {
          const x1 = xScale(d.source) ?? 0;
          const x2 = xScale(d.target) ?? 0;
          const arcHeight = Math.abs(x2 - x1) * 0.5;
          return `M ${x1},${yBase} A ${Math.abs(x2 - x1) / 2},${arcHeight} 0 0,${x1 < x2 ? 1 : 0} ${x2},${yBase}`;
        })
        .attr("fill", "none")
        .attr("stroke", colors.chart2)
        .attr("stroke-opacity", 0.5)
        .attr("stroke-width", 1.5);

      // ── Node circles ──
      const nodeGroup = g
        .selectAll<SVGGElement, ArcNode>(".node-g")
        .data(nodes)
        .join("g")
        .attr("class", "node-g")
        .attr("transform", (d) => `translate(${xScale(d.id) ?? 0},${yBase})`);

      nodeGroup
        .append("circle")
        .attr("r", 5)
        .attr("fill", (d) =>
          d.group === "equipment" ? colors.chart1 : colors.chart3
        )
        .attr("stroke", colors.background)
        .attr("stroke-width", 1.5)
        .style("cursor", "pointer");

      // ── Labels (45-degree rotation to avoid overlap) ──
      nodeGroup
        .append("text")
        .attr("transform", "rotate(45)")
        .attr("x", 8)
        .attr("y", 4)
        .attr("fill", colors.text)
        .style("font-size", "9px")
        .text((d) => d.id);

      // ── Hover interactions ──
      nodeGroup
        .on("mouseenter", function (event: MouseEvent, d: ArcNode) {
          // Highlight connected arcs
          g.selectAll<SVGPathElement, ArcLink>(".arc")
            .attr("stroke-opacity", (link) =>
              link.source === d.id || link.target === d.id ? 1 : 0.15
            )
            .attr("stroke-width", (link) =>
              link.source === d.id || link.target === d.id ? 2.5 : 1.5
            );

          tooltip.show(
            `<strong>${d.id}</strong><br/>Type: ${d.group}`,
            event
          );
        })
        .on("mouseleave", function () {
          g.selectAll<SVGPathElement, ArcLink>(".arc")
            .attr("stroke-opacity", 0.5)
            .attr("stroke-width", 1.5);
          tooltip.hide();
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
      data-testid="arc-diagram-view"
      className="min-h-[350px] w-full"
    />
  );
}
