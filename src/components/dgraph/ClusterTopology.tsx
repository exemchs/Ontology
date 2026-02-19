"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { select } from "d3-selection";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceRadial,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import { drag as d3Drag, type D3DragEvent } from "d3-drag";
import { zoom as d3Zoom, zoomTransform, type D3ZoomEvent } from "d3-zoom";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { getDgraphNodes, getDgraphLinks, type DgraphNode } from "@/data/dgraph-data";
import { cleanupD3Svg, createDebouncedResizeObserver } from "@/components/charts/shared/chart-utils";
import { getChartColors, resolveColor } from "@/components/charts/shared/chart-theme";

// ── Constants ─────────────────────────────────────────────────────────────

const ZERO_RADIUS = 20;
const ALPHA_RADIUS = 26;

function getNodeRadius(node: DgraphNode): number {
  return node.type === "zero" ? ZERO_RADIUS : ALPHA_RADIUS;
}

function getShortLabel(name: string): string {
  // sks-zero-01 -> Z1, sks-alpha-03 -> A3, sks-compute-02 -> C2
  if (name.includes("zero")) return "Z" + name.slice(-1);
  if (name.includes("compute")) return "C" + name.slice(-1);
  return "A" + name.slice(-1);
}

// ── D3 Datum Types ────────────────────────────────────────────────────────

interface NodeDatum extends SimulationNodeDatum {
  id: number;
  node: DgraphNode;
}

interface LinkDatum extends SimulationLinkDatum<NodeDatum> {
  type: "zero-alpha" | "alpha-alpha" | "zero-zero";
}

interface Particle {
  link: LinkDatum;
  offset: number;
  speed: number;
}

// ── Component ─────────────────────────────────────────────────────────────

interface ClusterTopologyProps {
  onNodeClick?: (node: DgraphNode, screenX: number, screenY: number) => void;
  className?: string;
}

export function ClusterTopology({ onNodeClick, className }: ClusterTopologyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<Simulation<NodeDatum, LinkDatum> | null>(null);
  const particlesEnabledRef = useRef(true);
  const animFrameRef = useRef<number>(0);
  const destroyedRef = useRef(false);

  const [layout, setLayout] = useState<"force" | "radial">("force");
  const [particlesEnabled, setParticlesEnabled] = useState(true);

  // Sync particlesEnabled state to ref so rAF loop reads latest value
  useEffect(() => {
    particlesEnabledRef.current = particlesEnabled;
  }, [particlesEnabled]);

  // Store layout in a ref so the simulation effect can swap forces without re-running
  const layoutRef = useRef(layout);

  // Update forces when layout changes (without re-creating the simulation)
  useEffect(() => {
    layoutRef.current = layout;
    const sim = simulationRef.current;
    if (!sim) return;

    const svgEl = svgRef.current;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (layout === "force") {
      setForceLayout(sim, w, h);
    } else {
      setRadialLayout(sim, w, h);
    }

    sim.alpha(0.3).alphaTarget(0).restart();
  }, [layout]);

  // ── Main D3 effect ────────────────────────────────────────────────────

  useEffect(() => {
    const svgEl = svgRef.current;
    const containerEl = containerRef.current;
    if (!svgEl || !containerEl) return;

    destroyedRef.current = false;

    // Clean any previous render
    cleanupD3Svg(svgEl as unknown as HTMLElement);

    const colors = getChartColors();

    // Status color resolution
    function getStatusColor(status: string): string {
      switch (status) {
        case "healthy":
          return resolveColor("--status-healthy");
        case "warning":
          return resolveColor("--status-warning");
        case "error":
          return resolveColor("--status-critical");
        default:
          return colors.textSecondary;
      }
    }

    // ── Data ──────────────────────────────────────────────────────────────

    const rawNodes = getDgraphNodes();
    const rawLinks = getDgraphLinks();

    const nodeDatums: NodeDatum[] = rawNodes.map((n) => ({
      id: n.id,
      node: n,
    }));

    const linkDatums: LinkDatum[] = rawLinks.map((l) => ({
      source: l.source,
      target: l.target,
      type: l.type,
    }));

    // ── SVG Setup ─────────────────────────────────────────────────────────

    const rect = svgEl.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const svg = select(svgEl);

    // Inject pulse animation CSS
    svg
      .append("defs")
      .append("style")
      .attr("type", "text/css")
      .text(`
        @keyframes pulse-ring {
          0%, 100% { opacity: 1; stroke-width: 3px; }
          50% { opacity: 0.4; stroke-width: 5px; }
        }
        .pulse-ring { animation: pulse-ring 2s ease-in-out infinite; }
      `);

    // Zoom container
    const g = svg.append("g");

    // ── Links Layer ──────────────────────────────────────────────────────

    const linksGroup = g.append("g").attr("class", "links");

    const linkLines = linksGroup
      .selectAll("line")
      .data(linkDatums)
      .join("line")
      .attr("stroke", colors.gridLine)
      .attr("stroke-width", (d) => (d.type === "zero-zero" ? 1.5 : 1))
      .attr("stroke-opacity", (d) => (d.type === "alpha-alpha" ? 0.3 : 0.5))
      .attr("stroke-dasharray", (d) => (d.type === "zero-zero" ? "4,3" : "none"));

    // ── Particles Layer ─────────────────────────────────────────────────

    const particlesGroup = g.append("g").attr("class", "particles");

    const particles: Particle[] = [];
    linkDatums.forEach((link) => {
      const count = link.type === "zero-zero" ? 3 : 2;
      const speed = link.type === "zero-zero" ? 0.005 : link.type === "zero-alpha" ? 0.004 : 0.003;
      for (let i = 0; i < count; i++) {
        particles.push({
          link,
          offset: i / count,
          speed,
        });
      }
    });

    const particleCircles = particlesGroup
      .selectAll("circle")
      .data(particles)
      .join("circle")
      .attr("r", 2)
      .attr("fill", colors.chart1)
      .attr("fill-opacity", 0.7);

    // ── Nodes Layer ────────────────────────────────────────────────────

    const nodesGroup = g.append("g").attr("class", "nodes");

    const nodeGroups = nodesGroup
      .selectAll("g")
      .data(nodeDatums)
      .join("g")
      .attr("cursor", "pointer");

    // Status ring
    nodeGroups
      .append("circle")
      .attr("class", (d) =>
        d.node.status !== "healthy" ? "pulse-ring" : ""
      )
      .attr("r", (d) => getNodeRadius(d.node) + 4)
      .attr("fill", "none")
      .attr("stroke", (d) => getStatusColor(d.node.status))
      .attr("stroke-width", 3);

    // Node circle
    nodeGroups
      .append("circle")
      .attr("r", (d) => getNodeRadius(d.node))
      .attr("fill", (d) => (d.node.type === "zero" ? colors.chart1 : colors.chart2))
      .attr("stroke", colors.background)
      .attr("stroke-width", 1.5);

    // Label
    nodeGroups
      .append("text")
      .text((d) => getShortLabel(d.node.name))
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("pointer-events", "none");

    // ── Force Simulation ───────────────────────────────────────────────

    const simulation = forceSimulation<NodeDatum>(nodeDatums)
      .force(
        "link",
        forceLink<NodeDatum, LinkDatum>(linkDatums)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", forceManyBody().strength(-300))
      .force("center", forceCenter(width / 2, height / 2))
      .force(
        "collide",
        forceCollide<NodeDatum>().radius((d) => getNodeRadius(d.node) + 10)
      );

    simulationRef.current = simulation;

    // Apply initial layout (may have changed from default if user toggled before effect ran)
    if (layoutRef.current === "radial") {
      setRadialLayout(simulation, width, height);
      simulation.alpha(0.3).alphaTarget(0).restart();
    }

    // ── Tick Handler ─────────────────────────────────────────────────

    simulation.on("tick", () => {
      // Clamp nodes within SVG bounds (with padding for node radius)
      const pad = ALPHA_RADIUS + 6;
      nodeDatums.forEach((d) => {
        d.x = Math.max(pad, Math.min(width - pad, d.x ?? width / 2));
        d.y = Math.max(pad, Math.min(height - pad, d.y ?? height / 2));
      });

      linkLines
        .attr("x1", (d) => ((d.source as NodeDatum).x ?? 0))
        .attr("y1", (d) => ((d.source as NodeDatum).y ?? 0))
        .attr("x2", (d) => ((d.target as NodeDatum).x ?? 0))
        .attr("y2", (d) => ((d.target as NodeDatum).y ?? 0));

      nodeGroups.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // ── Particle Animation (rAF) ───────────────────────────────────

    function animateParticles() {
      if (destroyedRef.current) return;

      if (!particlesEnabledRef.current) {
        particlesGroup.style("display", "none");
      } else {
        particlesGroup.style("display", null);

        particles.forEach((p) => {
          p.offset += p.speed;
          if (p.offset > 1) p.offset -= 1;
        });

        particleCircles
          .attr("cx", (d) => {
            const s = d.link.source as NodeDatum;
            const t = d.link.target as NodeDatum;
            return (s.x ?? 0) + ((t.x ?? 0) - (s.x ?? 0)) * d.offset;
          })
          .attr("cy", (d) => {
            const s = d.link.source as NodeDatum;
            const t = d.link.target as NodeDatum;
            return (s.y ?? 0) + ((t.y ?? 0) - (s.y ?? 0)) * d.offset;
          });
      }

      animFrameRef.current = requestAnimationFrame(animateParticles);
    }

    animFrameRef.current = requestAnimationFrame(animateParticles);

    // ── Drag Behavior ────────────────────────────────────────────────

    const dragBehavior = d3Drag<SVGGElement, NodeDatum>()
      .on("start", (event: D3DragEvent<SVGGElement, NodeDatum, NodeDatum>, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event: D3DragEvent<SVGGElement, NodeDatum, NodeDatum>, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event: D3DragEvent<SVGGElement, NodeDatum, NodeDatum>, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeGroups.call(dragBehavior as any);

    // ── Zoom Behavior ────────────────────────────────────────────────

    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr("transform", event.transform.toString());
      })
      .on("start", () => {
        // Signal popover close on zoom/pan start
        onNodeClick?.(null as unknown as DgraphNode, 0, 0);
      });

    svg.call(zoomBehavior);

    // Prevent zoom on double-click (would reset transform)
    svg.on("dblclick.zoom", null);

    // ── Node Click Handler ───────────────────────────────────────────

    nodeGroups.on("click", (event: MouseEvent, d: NodeDatum) => {
      event.stopPropagation();
      if (!svgEl || !onNodeClick) return;

      const svgRect = svgEl.getBoundingClientRect();
      const transform = zoomTransform(svgEl);
      const screenX = svgRect.left + transform.applyX(d.x ?? 0);
      const screenY = svgRect.top + transform.applyY(d.y ?? 0);

      onNodeClick(d.node, screenX, screenY);
    });

    // Background click to dismiss popover
    svg.on("click", () => {
      onNodeClick?.(null as unknown as DgraphNode, 0, 0);
    });

    // ── Resize Handling ─────────────────────────────────────────────

    const resizeObserver = createDebouncedResizeObserver((w, h) => {
      if (destroyedRef.current || !simulationRef.current) return;
      const sim = simulationRef.current;

      if (layoutRef.current === "force") {
        sim.force("center", forceCenter(w / 2, h / 2));
      } else {
        sim.force("center", null);
        sim.force(
          "radial",
          forceRadial<NodeDatum>(
            (d) => getRadialRadius(d.node.name),
            w / 2,
            h / 2
          ).strength(0.8)
        );
      }

      sim.alpha(0.1).restart();
    });

    resizeObserver.observe(containerEl);

    // ── Cleanup ─────────────────────────────────────────────────────

    return () => {
      destroyedRef.current = true;
      cancelAnimationFrame(animFrameRef.current);
      simulation.stop();
      simulationRef.current = null;
      cleanupD3Svg(svgEl as unknown as HTMLElement);
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full h-full min-h-[400px]", className)}>
      {/* Layout toggle */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <Tabs value={layout} onValueChange={(v) => setLayout(v as "force" | "radial")}>
          <TabsList className="h-7">
            <TabsTrigger value="force" className="text-xs px-2">Force</TabsTrigger>
            <TabsTrigger value="radial" className="text-xs px-2">Radial</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* Particle toggle */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <Label htmlFor="particles" className="text-xs text-muted-foreground">Particles</Label>
        <Switch id="particles" checked={particlesEnabled} onCheckedChange={setParticlesEnabled} />
      </div>
      {/* SVG canvas */}
      <svg ref={svgRef} className="w-full h-full" data-testid="cluster-topology" />
    </div>
  );
}

// ── Layout Helpers ─────────────────────────────────────────────────────────

function getRadialRadius(name: string): number {
  if (name.includes("zero")) return 0;
  if (name.includes("alpha")) return 120;
  return 200; // compute nodes
}

function setForceLayout(sim: Simulation<NodeDatum, LinkDatum>, w: number, h: number) {
  sim.force("center", forceCenter(w / 2, h / 2));
  sim.force("radial", null);
  sim.force("charge", forceManyBody().strength(-300));
  sim.force(
    "link",
    forceLink<NodeDatum, LinkDatum>(sim.force<any>("link")?.links() ?? [])
      .id((d) => d.id)
      .distance(100)
  );
}

function setRadialLayout(sim: Simulation<NodeDatum, LinkDatum>, w: number, h: number) {
  sim.force("center", null);
  sim.force(
    "radial",
    forceRadial<NodeDatum>(
      (d) => getRadialRadius(d.node.name),
      w / 2,
      h / 2
    ).strength(0.8)
  );
  sim.force("charge", forceManyBody().strength(-50));
  sim.force(
    "link",
    forceLink<NodeDatum, LinkDatum>(sim.force<any>("link")?.links() ?? [])
      .id((d) => d.id)
      .distance(60)
      .strength(0.1)
  );
}
