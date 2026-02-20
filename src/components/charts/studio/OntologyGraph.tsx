"use client";

import { useEffect, useRef, useState, useId, useCallback } from "react";
import { select, type Selection } from "d3-selection";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import { hierarchy, tree } from "d3-hierarchy";
import { drag as d3Drag, type D3DragEvent } from "d3-drag";
import { zoom as d3Zoom, type ZoomBehavior, type D3ZoomEvent, zoomIdentity } from "d3-zoom";
import "d3-transition"; // Side-effect import to extend Selection with .transition()

import type { OntologyType } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cleanupD3Svg, createDebouncedResizeObserver } from "@/components/charts/shared/chart-utils";
import { getChartColors, resolveColor } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import { D3ZoomControls } from "@/components/charts/shared/D3ZoomControls";
import { D3Minimap, type MinimapNode, type MinimapTransform } from "@/components/charts/shared/D3Minimap";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────

type GraphMode = "force" | "radial" | "hierarchy";

interface GraphNode extends SimulationNodeDatum {
  id: string;
  name: string;
  nodeCount: number;
  x: number;
  y: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  name: string;
  direction: "outbound" | "inbound";
}

interface OntologyGraphProps {
  types: OntologyType[];
  selectedType: OntologyType | null;
  onSelectType?: (type: OntologyType) => void;
  edgeFilter: "all" | "outbound" | "inbound";
  className?: string;
}

// ── Graph Data Builder ────────────────────────────────────────────────────

function buildGraphData(
  types: OntologyType[],
  edgeFilter: "all" | "outbound" | "inbound",
  selectedType: OntologyType | null
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = types.map((t) => ({
    id: t.name,
    name: t.name,
    nodeCount: t.nodeCount,
    x: 0,
    y: 0,
  }));

  const nodeNames = new Set(types.map((t) => t.name));
  const links: GraphLink[] = [];

  if (edgeFilter === "all") {
    // Include all relations from all types
    types.forEach((t) => {
      t.relations.forEach((rel) => {
        if (nodeNames.has(rel.target)) {
          links.push({
            source: t.name,
            target: rel.target,
            name: rel.name,
            direction: rel.direction,
          });
        }
      });
    });
  } else if (edgeFilter === "outbound") {
    if (selectedType) {
      // Only relations where source = selectedType
      selectedType.relations.forEach((rel) => {
        if (nodeNames.has(rel.target)) {
          links.push({
            source: selectedType.name,
            target: rel.target,
            name: rel.name,
            direction: rel.direction,
          });
        }
      });
    } else {
      // No selection: show all
      types.forEach((t) => {
        t.relations.forEach((rel) => {
          if (nodeNames.has(rel.target)) {
            links.push({
              source: t.name,
              target: rel.target,
              name: rel.name,
              direction: rel.direction,
            });
          }
        });
      });
    }
  } else {
    // inbound
    if (selectedType) {
      // Scan all types for relations targeting selectedType
      types.forEach((t) => {
        t.relations.forEach((rel) => {
          if (rel.target === selectedType.name && nodeNames.has(t.name)) {
            links.push({
              source: t.name,
              target: rel.target,
              name: rel.name,
              direction: "inbound",
            });
          }
        });
      });
    } else {
      // No selection: show all
      types.forEach((t) => {
        t.relations.forEach((rel) => {
          if (nodeNames.has(rel.target)) {
            links.push({
              source: t.name,
              target: rel.target,
              name: rel.name,
              direction: rel.direction,
            });
          }
        });
      });
    }
  }

  return { nodes, links };
}

// ── Node Radius ───────────────────────────────────────────────────────────

function getNodeRadius(nodeCount: number): number {
  return Math.max(15, Math.min(40, Math.sqrt(nodeCount) * 0.15 + 15));
}

// ── Chart Color Palette ──────────────────────────────────────────────────

const NODE_COLOR_VARS = [
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--chart-6",
];

// ── Arc Path Generator ───────────────────────────────────────────────────

function arcPath(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  linkIndex: number
): string {
  const dx = tx - sx;
  const dy = ty - sy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  // Vary curvature for bidirectional edges by alternating sweep
  const dr = dist * (1.2 + linkIndex * 0.3);
  const sweep = linkIndex % 2;
  return `M${sx},${sy} A${dr},${dr} 0 0,${sweep} ${tx},${ty}`;
}

// ── Component ─────────────────────────────────────────────────────────────

export function OntologyGraph({
  types,
  selectedType,
  onSelectType,
  edgeFilter,
  className,
}: OntologyGraphProps) {
  const uniqueId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<Simulation<GraphNode, GraphLink> | null>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgSelRef = useRef<Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
  const graphNodesRef = useRef<GraphNode[]>([]);
  const destroyedRef = useRef(false);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  const [mode, setMode] = useState<GraphMode>("force");
  const [minimapNodes, setMinimapNodes] = useState<MinimapNode[]>([]);
  const [minimapTransform, setMinimapTransform] = useState<MinimapTransform>({ x: 0, y: 0, k: 1 });

  // Store mode in ref for access inside D3 callbacks without re-running main effect
  const modeRef = useRef(mode);

  // ── Mode switch effect ────────────────────────────────────────────────

  useEffect(() => {
    modeRef.current = mode;
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const { width, height } = dimensionsRef.current;
    if (width === 0 || height === 0) return;

    const sim = simulationRef.current;
    const svg = select(svgEl);
    const g = svg.select<SVGGElement>("g.zoom-group");
    if (g.empty()) return;

    const graphData = buildGraphData(types, edgeFilter, selectedType);
    const nodeMap = new Map<string, GraphNode>();
    g.selectAll<SVGGElement, GraphNode>("g.node-group").each(function (d) {
      nodeMap.set(d.id, d);
    });

    if (mode === "force") {
      // Restart force simulation
      if (sim) {
        // Clear any fixed positions from tree/radial
        sim.nodes().forEach((n) => {
          n.fx = null;
          n.fy = null;
        });
        sim
          .force("center", forceCenter(width / 2, height / 2))
          .force("charge", forceManyBody().strength(-500))
          .force(
            "link",
            forceLink<GraphNode, GraphLink>(graphData.links)
              .id((d) => d.id)
              .distance(120)
              .strength(0.5)
          )
          .force("collide", forceCollide<GraphNode>().radius((d) => getNodeRadius(d.nodeCount) + 10))
          .alpha(0.5)
          .alphaDecay(0.02)
          .restart();
      }
    } else if (mode === "radial") {
      // Stop simulation
      sim?.stop();

      // Build radial layout using d3.tree in polar coordinates
      const rootData = {
        name: "root",
        children: types.map((t) => ({ name: t.name })),
      };
      const root = hierarchy(rootData);
      const radius = Math.min(width, height) / 2 - 80;
      const treeLayout = tree<typeof rootData>().size([2 * Math.PI, radius]);
      treeLayout(root);

      const cx = width / 2;
      const cy = height / 2;

      // Map positions for each leaf node
      const positions = new Map<string, { x: number; y: number }>();
      root.leaves().forEach((leaf) => {
        const angle = (leaf.x ?? 0) - Math.PI / 2;
        const r = leaf.y ?? 0;
        positions.set(leaf.data.name, {
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
        });
      });

      // Animate nodes to radial positions
      g.selectAll<SVGGElement, GraphNode>("g.node-group")
        .transition()
        .duration(500)
        .attr("transform", (d) => {
          const pos = positions.get(d.name);
          if (pos) {
            d.x = pos.x;
            d.y = pos.y;
            d.fx = pos.x;
            d.fy = pos.y;
          }
          return `translate(${d.x},${d.y})`;
        });

      // Animate edges
      updateEdgePositions(g, 500);
    } else {
      // Hierarchy / Tree mode
      sim?.stop();

      const rootData = {
        name: "root",
        children: types.map((t) => ({ name: t.name })),
      };
      const root = hierarchy(rootData);
      const treeLayout = tree<typeof rootData>().size([width - 120, height - 120]);
      treeLayout(root);

      const positions = new Map<string, { x: number; y: number }>();
      root.leaves().forEach((leaf) => {
        positions.set(leaf.data.name, {
          x: (leaf.x ?? 0) + 60,
          y: (leaf.y ?? 0) + 60,
        });
      });

      // Animate nodes to tree positions
      g.selectAll<SVGGElement, GraphNode>("g.node-group")
        .transition()
        .duration(500)
        .attr("transform", (d) => {
          const pos = positions.get(d.name);
          if (pos) {
            d.x = pos.x;
            d.y = pos.y;
            d.fx = pos.x;
            d.fy = pos.y;
          }
          return `translate(${d.x},${d.y})`;
        });

      // Animate edges
      updateEdgePositions(g, 500);
    }
  }, [mode, types, edgeFilter, selectedType]);

  // ── Main D3 effect ────────────────────────────────────────────────────

  useEffect(() => {
    const svgEl = svgRef.current;
    const containerEl = containerRef.current;
    if (!svgEl || !containerEl) return;

    destroyedRef.current = false;

    // Wait for valid dimensions from ResizeObserver before initializing
    const resizeObserver = createDebouncedResizeObserver((w, h) => {
      if (destroyedRef.current) return;
      dimensionsRef.current = { width: w, height: h };

      // Only reinitialize if this is the first valid dimension or a significant change
      if (w > 0 && h > 0) {
        initializeGraph(w, h);
      }
    }, 100);

    resizeObserver.observe(containerEl);

    function initializeGraph(width: number, height: number) {
      // Clean previous render
      cleanupD3Svg(svgEl as unknown as HTMLElement);
      if (simulationRef.current) {
        simulationRef.current.stop();
        simulationRef.current = null;
      }

      const colors = getChartColors();
      const tooltip = createTooltip();

      // Resolve node colors
      const nodeColorMap = new Map<string, string>();
      types.forEach((t, i) => {
        const cssVar = NODE_COLOR_VARS[i % NODE_COLOR_VARS.length];
        nodeColorMap.set(t.name, resolveColor(cssVar));
      });

      // Build graph data
      const graphData = buildGraphData(types, edgeFilter, selectedType);

      // Initialize node positions around center
      graphData.nodes.forEach((n) => {
        n.x = width / 2 + (Math.random() - 0.5) * 100;
        n.y = height / 2 + (Math.random() - 0.5) * 100;
      });
      graphNodesRef.current = graphData.nodes;

      // ── SVG Setup ────────────────────────────────────────────────────

      const svg = select(svgEl as SVGSVGElement)
        .attr("width", width)
        .attr("height", height);
      svgSelRef.current = svg;

      // Defs with arrow marker
      const defs = svg.append("defs");
      defs
        .append("marker")
        .attr("id", `arrow-${uniqueId}`)
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 20)
        .attr("refY", 5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 Z")
        .attr("fill", colors.textSecondary);

      // Zoom group
      const g = svg.append("g").attr("class", "zoom-group");

      // ── Edge Layer ───────────────────────────────────────────────────

      const edgesGroup = g.append("g").attr("class", "edges");

      // Count links between same source-target pairs to offset arcs
      const linkIndexMap = new Map<string, number>();
      graphData.links.forEach((link) => {
        const sourceId = typeof link.source === "object" ? (link.source as GraphNode).id : String(link.source);
        const targetId = typeof link.target === "object" ? (link.target as GraphNode).id : String(link.target);
        const key = [sourceId, targetId].sort().join("-");
        const idx = linkIndexMap.get(key) ?? 0;
        linkIndexMap.set(key, idx + 1);
        (link as GraphLink & { _arcIndex: number })._arcIndex = idx;
      });

      const edgePaths = edgesGroup
        .selectAll("path")
        .data(graphData.links)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", colors.textSecondary)
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.5)
        .attr("marker-end", `url(#arrow-${uniqueId})`)
        .attr("class", "edge-path")
        .on("mouseenter", function (event: MouseEvent, d) {
          select(this)
            .attr("stroke", colors.chart1)
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 2.5);
          tooltip.show(`<strong>${d.name}</strong>`, event);
        })
        .on("mousemove", function (event: MouseEvent, d) {
          tooltip.show(`<strong>${d.name}</strong>`, event);
        })
        .on("mouseleave", function () {
          select(this)
            .attr("stroke", colors.textSecondary)
            .attr("stroke-opacity", 0.5)
            .attr("stroke-width", 1.5);
          tooltip.hide();
        });

      // ── Edge Labels ─────────────────────────────────────────────────

      const edgeLabelsGroup = g.append("g").attr("class", "edge-labels");

      const edgeLabels = edgeLabelsGroup
        .selectAll("text")
        .data(graphData.links)
        .join("text")
        .attr("class", "edge-label")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", colors.textSecondary)
        .attr("font-size", "9px")
        .attr("font-weight", "500")
        .attr("pointer-events", "none")
        .text((d) => d.name);

      // ── Node Layer ───────────────────────────────────────────────────

      const nodesGroup = g.append("g").attr("class", "nodes");

      const nodeGroups = nodesGroup
        .selectAll("g")
        .data(graphData.nodes)
        .join("g")
        .attr("class", "node-group")
        .attr("cursor", "pointer")
        .attr("data-testid", (d) => `graph-node-${d.name}`)
        .attr("transform", (d) => `translate(${d.x},${d.y})`);

      // Selected node glow ring
      nodeGroups
        .append("circle")
        .attr("class", "selection-ring")
        .attr("r", (d) => getNodeRadius(d.nodeCount) + 5)
        .attr("fill", "none")
        .attr("stroke", (d) =>
          selectedType?.name === d.name ? colors.chart1 : "transparent"
        )
        .attr("stroke-width", 3)
        .attr("stroke-opacity", 0.6);

      // Node circle
      nodeGroups
        .append("circle")
        .attr("class", "node-circle")
        .attr("r", (d) => getNodeRadius(d.nodeCount))
        .attr("fill", (d) => nodeColorMap.get(d.name) ?? colors.chart1)
        .attr("stroke", colors.background)
        .attr("stroke-width", 2);

      // Node label (below circle)
      nodeGroups
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", (d) => getNodeRadius(d.nodeCount) + 16)
        .attr("fill", colors.text)
        .attr("font-size", "11px")
        .attr("font-weight", "500")
        .attr("pointer-events", "none")
        .text((d) => d.name);

      // Click handler
      nodeGroups.on("click", (_event: MouseEvent, d: GraphNode) => {
        const matchedType = types.find((t) => t.name === d.name);
        if (matchedType && onSelectType) {
          onSelectType(matchedType);
        }
      });

      // Hover interaction
      nodeGroups
        .on("mouseenter", function (event: MouseEvent, d: GraphNode) {
          tooltip.show(
            `<strong>${d.name}</strong><br/>Nodes: ${d.nodeCount.toLocaleString()}`,
            event
          );
        })
        .on("mousemove", function (event: MouseEvent, d: GraphNode) {
          tooltip.show(
            `<strong>${d.name}</strong><br/>Nodes: ${d.nodeCount.toLocaleString()}`,
            event
          );
        })
        .on("mouseleave", function () {
          tooltip.hide();
        });

      // ── Force Simulation ─────────────────────────────────────────────

      const simulation = forceSimulation<GraphNode>(graphData.nodes)
        .force(
          "link",
          forceLink<GraphNode, GraphLink>(graphData.links)
            .id((d) => d.id)
            .distance(120)
            .strength(0.5)
        )
        .force("charge", forceManyBody().strength(-500))
        .force("center", forceCenter(width / 2, height / 2))
        .force(
          "collide",
          forceCollide<GraphNode>().radius((d) => getNodeRadius(d.nodeCount) + 10)
        )
        .alphaDecay(0.02);

      simulationRef.current = simulation;

      // Tick handler
      simulation.on("tick", () => {
        nodeGroups.attr("transform", (d) => `translate(${d.x},${d.y})`);

        edgePaths.attr("d", (d) => {
          const s = d.source as GraphNode;
          const t = d.target as GraphNode;
          const idx = (d as GraphLink & { _arcIndex: number })._arcIndex ?? 0;
          return arcPath(s.x, s.y, t.x, t.y, idx);
        });

        // Update edge label positions at arc midpoint
        edgeLabels
          .attr("x", (d) => {
            const s = d.source as GraphNode;
            const t = d.target as GraphNode;
            return (s.x + t.x) / 2;
          })
          .attr("y", (d) => {
            const s = d.source as GraphNode;
            const t = d.target as GraphNode;
            const idx = (d as GraphLink & { _arcIndex: number })._arcIndex ?? 0;
            const mx = (s.x + t.x) / 2;
            const my = (s.y + t.y) / 2;
            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            // Offset perpendicular to edge, alternate direction by arc index
            const offset = (idx % 2 === 0 ? -1 : 1) * Math.min(20, dist * 0.1);
            return my + (-dx / dist) * offset;
          });

        // Update minimap with current node positions during simulation
        setMinimapNodes(
          graphData.nodes.map((n) => ({ x: n.x, y: n.y, name: n.name }))
        );
      });

      // ── Drag Behavior (Force mode only) ──────────────────────────────

      const dragBehavior = d3Drag<SVGGElement, GraphNode>()
        .on("start", (event: D3DragEvent<SVGGElement, GraphNode, GraphNode>, d) => {
          if (modeRef.current !== "force") return;
          if (!event.active && simulationRef.current) {
            simulationRef.current.alphaTarget(0.3).restart();
          }
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event: D3DragEvent<SVGGElement, GraphNode, GraphNode>, d) => {
          if (modeRef.current !== "force") return;
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event: D3DragEvent<SVGGElement, GraphNode, GraphNode>, d) => {
          if (modeRef.current !== "force") return;
          if (!event.active && simulationRef.current) {
            simulationRef.current.alphaTarget(0);
          }
          d.fx = null;
          d.fy = null;
        });

      nodeGroups.call(dragBehavior as any);

      // ── Zoom Behavior ────────────────────────────────────────────────

      const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
          g.attr("transform", event.transform.toString());
          const t = event.transform;
          setMinimapTransform({ x: t.x, y: t.y, k: t.k });
          setMinimapNodes(
            graphData.nodes.map((n) => ({ x: n.x, y: n.y, name: n.name }))
          );
        });

      svg.call(zoomBehavior);
      svg.on("dblclick.zoom", null); // Disable double-click zoom reset

      // Preserve existing zoom if ref has one (re-render from resize)
      if (zoomRef.current) {
        try {
          // Reapply stored zoom transform
          const currentTransform = zoomRef.current;
          svg.call(zoomBehavior.transform, zoomIdentity);
        } catch {
          // Ignore if transform can't be reapplied
        }
      }
      zoomRef.current = zoomBehavior;

      // If current mode isn't force, apply the appropriate layout immediately
      if (modeRef.current === "radial" || modeRef.current === "hierarchy") {
        simulation.stop();
        applyStaticLayout(modeRef.current, g, types, graphData, width, height);
      }

      // ── Cleanup function stored for next call ──────────────────────

      cleanupFnRef.current = () => {
        simulation.stop();
        simulationRef.current = null;
        tooltip.destroy();
        cleanupD3Svg(svgEl as unknown as HTMLElement);
      };
    }

    return () => {
      destroyedRef.current = true;
      if (simulationRef.current) {
        simulationRef.current.stop();
        simulationRef.current = null;
      }
      resizeObserver.disconnect();
      cleanupFnRef.current?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [types, edgeFilter, selectedType]);

  const cleanupFnRef = useRef<(() => void) | null>(null);

  // ── Zoom control callbacks ──────────────────────────────────────────────

  const handleZoomIn = useCallback(() => {
    if (!svgSelRef.current || !zoomRef.current) return;
    svgSelRef.current.transition().duration(300).call(
      zoomRef.current.scaleBy as any, 1.5
    );
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgSelRef.current || !zoomRef.current) return;
    svgSelRef.current.transition().duration(300).call(
      zoomRef.current.scaleBy as any, 1 / 1.5
    );
  }, []);

  const handleFitToView = useCallback(() => {
    const svgEl = svgRef.current;
    if (!svgSelRef.current || !zoomRef.current || !svgEl) return;
    const nodes = graphNodesRef.current;
    if (nodes.length === 0) return;

    const rect = svgEl.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const pad = 60;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach((n) => {
      const r = getNodeRadius(n.nodeCount);
      minX = Math.min(minX, n.x - r);
      maxX = Math.max(maxX, n.x + r);
      minY = Math.min(minY, n.y - r);
      maxY = Math.max(maxY, n.y + r);
    });

    const bw = maxX - minX;
    const bh = maxY - minY;
    if (bw === 0 || bh === 0) return;

    const scale = Math.min((w - pad * 2) / bw, (h - pad * 2) / bh, 2);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const transform = zoomIdentity
      .translate(w / 2, h / 2)
      .scale(scale)
      .translate(-cx, -cy);

    svgSelRef.current.transition().duration(500).call(
      zoomRef.current.transform as any, transform
    );
  }, []);

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={cn("group relative w-full h-full min-h-[300px]", className)}
      data-testid="ontology-graph"
    >
      {/* Mode toggle */}
      <div className="absolute top-3 left-3 z-10">
        <Tabs value={mode} onValueChange={(v) => setMode(v as GraphMode)}>
          <TabsList className="h-7 bg-background/80 backdrop-blur-sm">
            <TabsTrigger value="force" className="text-xs px-2">Force</TabsTrigger>
            <TabsTrigger value="radial" className="text-xs px-2">Radial</TabsTrigger>
            <TabsTrigger value="hierarchy" className="text-xs px-2">Hierarchy</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* SVG canvas */}
      <svg ref={svgRef} className="absolute inset-0 w-full h-full" />

      {/* Zoom controls + Minimap overlay (fade-in on hover) */}
      <div className="absolute bottom-3 right-3 z-10 flex items-end gap-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300">
        <D3Minimap
          nodes={minimapNodes}
          viewportTransform={minimapTransform}
          graphWidth={dimensionsRef.current.width}
          graphHeight={dimensionsRef.current.height}
        />
        <D3ZoomControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitToView={handleFitToView}
        />
      </div>
    </div>
  );
}

// ── Helper: Update edge positions (for static layouts) ─────────────────

function edgeLabelPosition(d: GraphLink): { x: number; y: number } {
  const s = d.source as GraphNode;
  const t = d.target as GraphNode;
  const idx = (d as GraphLink & { _arcIndex: number })._arcIndex ?? 0;
  const mx = (s.x + t.x) / 2;
  const my = (s.y + t.y) / 2;
  const dx = t.x - s.x;
  const dy = t.y - s.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const offset = (idx % 2 === 0 ? -1 : 1) * Math.min(20, dist * 0.1);
  return { x: mx + (dy / dist) * offset, y: my + (-dx / dist) * offset };
}

function updateEdgePositions(
  g: Selection<SVGGElement, unknown, null, undefined>,
  duration: number
) {
  if (duration > 0) {
    g.selectAll<SVGPathElement, GraphLink>("path.edge-path")
      .transition()
      .duration(duration)
      .attr("d", (d) => {
        const s = d.source as GraphNode;
        const t = d.target as GraphNode;
        const idx = (d as GraphLink & { _arcIndex: number })._arcIndex ?? 0;
        return arcPath(s.x, s.y, t.x, t.y, idx);
      });
    g.selectAll<SVGTextElement, GraphLink>("text.edge-label")
      .transition()
      .duration(duration)
      .attr("x", (d) => edgeLabelPosition(d).x)
      .attr("y", (d) => edgeLabelPosition(d).y);
  } else {
    g.selectAll<SVGPathElement, GraphLink>("path.edge-path").attr("d", (d) => {
      const s = d.source as GraphNode;
      const t = d.target as GraphNode;
      const idx = (d as GraphLink & { _arcIndex: number })._arcIndex ?? 0;
      return arcPath(s.x, s.y, t.x, t.y, idx);
    });
    g.selectAll<SVGTextElement, GraphLink>("text.edge-label")
      .attr("x", (d) => edgeLabelPosition(d).x)
      .attr("y", (d) => edgeLabelPosition(d).y);
  }
}

// ── Helper: Apply static layout immediately (for re-init in non-force mode)

function applyStaticLayout(
  layoutMode: "radial" | "hierarchy",
  g: Selection<SVGGElement, unknown, null, undefined>,
  types: OntologyType[],
  graphData: { nodes: GraphNode[]; links: GraphLink[] },
  width: number,
  height: number
) {
  const rootData = {
    name: "root",
    children: types.map((t) => ({ name: t.name })),
  };
  const root = hierarchy(rootData);

  if (layoutMode === "radial") {
    const radius = Math.min(width, height) / 2 - 80;
    const treeLayout = tree<typeof rootData>().size([2 * Math.PI, radius]);
    treeLayout(root);

    const cx = width / 2;
    const cy = height / 2;

    root.leaves().forEach((leaf) => {
      const angle = (leaf.x ?? 0) - Math.PI / 2;
      const r = leaf.y ?? 0;
      const node = graphData.nodes.find((n) => n.name === leaf.data.name);
      if (node) {
        node.x = cx + r * Math.cos(angle);
        node.y = cy + r * Math.sin(angle);
        node.fx = node.x;
        node.fy = node.y;
      }
    });
  } else {
    const treeLayout = tree<typeof rootData>().size([width - 120, height - 120]);
    treeLayout(root);

    root.leaves().forEach((leaf) => {
      const node = graphData.nodes.find((n) => n.name === leaf.data.name);
      if (node) {
        node.x = (leaf.x ?? 0) + 60;
        node.y = (leaf.y ?? 0) + 60;
        node.fx = node.x;
        node.fy = node.y;
      }
    });
  }

  g.selectAll<SVGGElement, GraphNode>("g.node-group").attr(
    "transform",
    (d) => `translate(${d.x},${d.y})`
  );

  updateEdgePositions(g, 0);
}
