"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX,
  forceY,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import { drag } from "d3-drag";
import "d3-transition";

import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import {
  cleanupD3Svg,
  createDebouncedResizeObserver,
} from "@/components/charts/shared/chart-utils";

// ── Types ───────────────────────────────────────────────────────────────────

interface ForceNode extends SimulationNodeDatum {
  id: string;
  label: string;
  group: "equipment" | "location";
}

interface ForceLink extends SimulationLinkDatum<ForceNode> {
  source: string | ForceNode;
  target: string | ForceNode;
}

interface ForceGraphViewProps {
  data: Record<string, unknown>[];
}

// ── Component ───────────────────────────────────────────────────────────────

export function ForceGraphView({ data }: ForceGraphViewProps) {
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

      // ── Data transformation: extract equipment + location nodes ──
      const equipmentSet = new Map<string, string>(); // id -> type
      const locationSet = new Set<string>();
      const links: ForceLink[] = [];

      data.forEach((row) => {
        const eqId = String(row.equipment_id ?? row.name ?? "");
        const eqType = String(row.type ?? "Equipment");
        const loc = String(row.location ?? "");

        if (eqId) equipmentSet.set(eqId, eqType);
        if (loc) locationSet.add(loc);

        if (eqId && loc) {
          links.push({ source: eqId, target: loc });
        }
      });

      const nodes: ForceNode[] = [
        ...Array.from(equipmentSet.keys()).map((id) => ({
          id,
          label: id,
          group: "equipment" as const,
        })),
        ...Array.from(locationSet).map((loc) => ({
          id: loc,
          label: loc,
          group: "location" as const,
        })),
      ];

      if (nodes.length === 0) return;

      // ── SVG setup ──
      const svg = select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      const g = svg.append("g");

      // ── Force simulation ──
      const simulation = forceSimulation<ForceNode>(nodes)
        .force(
          "link",
          forceLink<ForceNode, ForceLink>(links)
            .id((d) => d.id)
            .distance(120)
        )
        .force("charge", forceManyBody().strength(-200))
        .force(
          "x",
          forceX<ForceNode>((d) =>
            d.group === "equipment" ? width * 0.3 : width * 0.7
          ).strength(0.15)
        )
        .force("y", forceY<ForceNode>(height / 2).strength(0.1))
        .alphaDecay(0.02);

      // ── Links ──
      const linkElements = g
        .selectAll<SVGLineElement, ForceLink>(".link")
        .data(links)
        .join("line")
        .attr("class", "link")
        .attr("stroke", colors.textSecondary)
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5);

      // ── Nodes ──
      const nodeElements = g
        .selectAll<SVGCircleElement, ForceNode>(".node")
        .data(nodes)
        .join("circle")
        .attr("class", "node")
        .attr("r", 8)
        .attr("fill", (d) =>
          d.group === "equipment" ? colors.chart1 : colors.chart2
        )
        .attr("stroke", colors.background)
        .attr("stroke-width", 2)
        .style("cursor", "grab");

      // ── Labels ──
      const labelElements = g
        .selectAll<SVGTextElement, ForceNode>(".label")
        .data(nodes)
        .join("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("dy", -14)
        .attr("fill", colors.text)
        .style("font-size", "10px")
        .style("pointer-events", "none")
        .text((d) => d.label);

      // ── Drag behavior ──
      const dragBehavior = drag<SVGCircleElement, ForceNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
          select(event.sourceEvent.target).style("cursor", "grabbing");
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
          select(event.sourceEvent.target).style("cursor", "grab");
        });

      nodeElements.call(dragBehavior);

      // ── Tooltip ──
      nodeElements
        .on("mouseenter", (event: MouseEvent, d: ForceNode) => {
          tooltip.show(
            `<strong>${d.label}</strong><br/>Type: ${d.group}`,
            event
          );
        })
        .on("mouseleave", () => {
          tooltip.hide();
        });

      // ── Tick ──
      simulation.on("tick", () => {
        linkElements
          .attr("x1", (d) => (d.source as ForceNode).x ?? 0)
          .attr("y1", (d) => (d.source as ForceNode).y ?? 0)
          .attr("x2", (d) => (d.target as ForceNode).x ?? 0)
          .attr("y2", (d) => (d.target as ForceNode).y ?? 0);

        nodeElements.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0);

        labelElements.attr("x", (d) => d.x ?? 0).attr("y", (d) => d.y ?? 0);
      });

      // Store simulation ref for cleanup
      container.dataset.simActive = "true";

      return () => {
        simulation.stop();
      };
    }

    const stopSim = render();

    const observer = createDebouncedResizeObserver(() => {
      if (!destroyed) {
        stopSim?.();
        render();
      }
    });
    observer.observe(container);

    return () => {
      destroyed = true;
      stopSim?.();
      observer.disconnect();
      tooltip.destroy();
      cleanupD3Svg(container as unknown as HTMLElement);
    };
  }, [resolvedTheme, data]);

  return (
    <div
      ref={containerRef}
      data-testid="force-graph-view"
      className="min-h-[350px] w-full"
    />
  );
}
