"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

// ---------- Graph data (from studio-data.ts ontology types + relations) ----------

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  radius: number;
  color: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

const nodeCounts: Record<string, number> = {
  Equipment: 832,
  Process: 24500,
  Wafer: 156000,
  Recipe: 310,
  Defect: 48800,
  MaintenanceRecord: 3820,
};

const nodeColors: Record<string, string> = {
  Equipment: "var(--color-blue-04)",
  Process: "var(--color-cyan-04)",
  Wafer: "var(--color-sky-04)",
  Recipe: "var(--color-teal-04)",
  Defect: "var(--color-indigo-04)",
  MaintenanceRecord: "var(--color-blue-03)",
};

function buildNodes(): GraphNode[] {
  const counts = Object.values(nodeCounts);
  const min = Math.min(...counts);
  const max = Math.max(...counts);

  return Object.entries(nodeCounts).map(([id, count]) => {
    // Normalize radius to 15-35px range
    const t = max === min ? 0.5 : (count - min) / (max - min);
    const radius = 15 + t * 20;
    return { id, radius, color: nodeColors[id] ?? "var(--color-blue-04)" };
  });
}

function buildLinks(): GraphLink[] {
  return [
    { source: "Equipment", target: "Process" },
    { source: "Process", target: "Wafer" },
    { source: "Process", target: "Recipe" },
    { source: "Wafer", target: "Defect" },
    { source: "Defect", target: "Equipment" },
    { source: "MaintenanceRecord", target: "Equipment" },
  ];
}

// ---------- Component ----------

export function LoginGraph() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const container = svg.parentElement;
    if (!container) return;

    let destroyed = false;

    const nodes = buildNodes();
    const links = buildLinks();

    // Sizing
    const resize = () => {
      if (destroyed || !container) return;
      const { width, height } = container.getBoundingClientRect();
      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(height));
      simulation.force(
        "center",
        d3.forceCenter(width / 2, height / 2)
      );
      simulation.alpha(0.3).restart();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // D3 selection
    const sel = d3.select(svg);
    sel.selectAll("*").remove();

    // Glow filter
    const defs = sel.append("defs");
    const filter = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "blur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    // Groups
    const linkGroup = sel.append("g");
    const nodeGroup = sel.append("g");
    const labelGroup = sel.append("g");

    // Links
    const linkSel = linkGroup
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "var(--color-gray-06)")
      .attr("stroke-width", 1.2)
      .attr("stroke-opacity", 0.35);

    // Nodes
    const nodeSel = nodeGroup
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => d.color)
      .attr("fill-opacity", 0.7)
      .attr("filter", "url(#glow)");

    // Labels
    const labelSel = labelGroup
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text((d) => d.id)
      .attr("font-size", "10px")
      .attr("fill", "white")
      .attr("fill-opacity", 0.65)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.radius + 14);

    // Simulation
    const { width, height } = container.getBoundingClientRect();

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(120)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide<GraphNode>().radius((d) => d.radius + 8)
      )
      .alphaTarget(0.02)
      .on("tick", () => {
        if (destroyed) return;

        linkSel
          .attr("x1", (d) => (d.source as GraphNode).x ?? 0)
          .attr("y1", (d) => (d.source as GraphNode).y ?? 0)
          .attr("x2", (d) => (d.target as GraphNode).x ?? 0)
          .attr("y2", (d) => (d.target as GraphNode).y ?? 0);

        nodeSel.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0);

        labelSel.attr("x", (d) => d.x ?? 0).attr("y", (d) => d.y ?? 0);
      });

    return () => {
      destroyed = true;
      simulation.stop();
      ro.disconnect();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
