# Phase 4: DGraph Monitoring - Research

**Researched:** 2026-02-19
**Domain:** D3.js v7 Force Simulation, Particle Animation, Brush Interaction, Grouped Bar Chart
**Confidence:** HIGH

## Summary

Phase 4 builds the DGraph Monitoring page: a 12-node cluster topology with Force/Radial toggle, particle animation on links, node status rings, a 2-tier node detail UX (popover card + side panel), a brushable query scatter plot, a grouped shard bar chart, and a recent events list. The core technical risk is the force simulation -- managing its lifecycle within React (useRef for simulation, cleanup on unmount, re-heat on interaction), coordinating drag/zoom, and smoothly toggling between Force and Radial layouts.

The project already has D3 v7.9.0 installed with `@types/d3` v7.4.3, along with established chart utilities (`cleanupD3Svg`, `createDebouncedResizeObserver`, `getChartColors`, `createTooltip`), shared components (`ChartSkeleton`, `ChartEmpty`), and all dgraph data functions (`getDgraphNodes`, `getDgraphLinks`, `getDgraphShards`, `getDgraphQueries`). The data layer is complete: 12 nodes with CPU/Memory/Disk metrics, 18 links typed as `zero-alpha | alpha-alpha | zero-zero`, 3 shard groups with multiple predicate sizes, and 50 query points with latency/throughput/type.

**Primary recommendation:** Build the force simulation as a single React component using `useRef` for the D3 simulation instance. Manage Force/Radial toggle by swapping forces (not destroying/recreating the simulation). Use `requestAnimationFrame` for particle animation independent of the simulation tick. Implement popover as a custom positioned div (not shadcn Popover, since the trigger is an SVG node click with dynamic position), and use the existing `Sheet` component for the expanded side panel.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 2 view modes toggled: Force / Radial
- Default view: Force layout
- Force: node drag, zoom/pan interaction supported
- Radial: center(Zero) -> Alpha -> Compute hierarchical radial layout
- Node detail panel 2-tier UX:
  - Tier 1 (default): click node -> popover card showing name, status, CPU/Memory/Disk, QPS
  - Tier 2 (expanded): icon click in popover card -> right side panel with connections list, detailed metrics, events
  - Side panel closes via close button
- Particle animation: default ON (demo visual impact)
- ON/OFF toggle button provided
- Particles move along connection lines (data flow)

### Claude's Discretion
- Popover card internal design and icon types
- Side panel detailed information composition (which metrics, which charts)
- Node status ring color/pulse animation intensity
- Particle speed, size, color
- Query scatter plot brush selection UI
- Shard bar chart grouping method
- Recent Events list style

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DGRP-01 | D3 cluster topology (Force/Radial layout, node drag, zoom/pan) | Force simulation API with forceLink/forceManyBody/forceCenter for Force mode; forceRadial/forceX/forceY for Radial mode. d3-zoom for pan/zoom. d3-drag with fx/fy pattern for node drag. Toggle by swapping force configurations with alphaTarget reheat. |
| DGRP-02 | Data flow particle animation (moving along connection lines) | requestAnimationFrame loop independent of simulation tick. Use link source/target positions to interpolate particle positions. Multiple particles per link at staggered offsets. |
| DGRP-03 | Node status ring (healthy/warning/error color + pulse animation) | SVG circle stroke with color mapped to NodeStatus. CSS @keyframes or D3 transition loop for pulse animation. Use semantic tokens: --color-text-success (healthy), --color-text-warning (warning), --color-text-critical (error). |
| DGRP-04 | Node detail panel (click -> QPS/CPU/Memory display) | Custom positioned popover div for Tier 1 (not shadcn Popover since trigger is SVG). Existing Sheet component for Tier 2 expanded side panel. |
| DGRP-05 | D3 query scatter plot (Brushable -- area selection for query filtering) | d3.brush() for 2D rectangular selection on scatter plot. scaleLinear for both axes. Brush "end" event to filter queries. Use invert() to map pixel selection back to data domain. |
| DGRP-06 | D3 shard bar chart (Grouped bar) | Two scaleBand scales (outer for groups, inner for shard names) + scaleLinear for values. Chart series colors from --chart-1 through --chart-8. |
| DGRP-07 | Recent Events list | React component consuming alert/event data. Badge component for severity. Straightforward list rendering -- no D3 needed. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| d3 | 7.9.0 | Force simulation, scales, axes, zoom, drag, brush | Already installed; project standard for all charts |
| @types/d3 | 7.4.3 | TypeScript types for D3 | Already installed |
| react | 19.2.3 | UI framework | Already installed |
| next | 16.1.6 | App Router framework | Already installed |
| radix-ui | 1.4.3 | Primitive UI components (via shadcn) | Already installed |
| lucide-react | 0.574.0 | Icons | Already installed |

### Supporting (Already Available)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui Sheet | (installed) | Right side panel for expanded node detail | DGRP-04 Tier 2 expanded panel |
| shadcn/ui Switch | (installed) | Toggle for particle animation ON/OFF | DGRP-02 toggle |
| shadcn/ui Badge | (installed) | Status badges in events list, popover | DGRP-03, DGRP-07 |
| shadcn/ui Card | (installed) | Container for charts and panels | All chart sections |
| shadcn/ui Tabs | (installed) | Layout toggle (Force/Radial) | DGRP-01 toggle |
| shadcn/ui ScrollArea | (installed) | Scrollable content in side panel | DGRP-04 Tier 2 |

### Needs Adding
| Component | Source | Purpose |
|-----------|--------|---------|
| shadcn Popover | `npx shadcn@latest add popover` | **Optional** -- see Architecture note below. A custom positioned div may be simpler for SVG-triggered popover since the anchor point is a D3-rendered SVG circle, not a React-rendered element. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom popover div | shadcn Popover | shadcn Popover expects a React element trigger; SVG circles rendered by D3 are not React-controlled. Custom div with absolute positioning is simpler and avoids Radix Portal focus-management complications with SVG. |
| Sheet for Tier 2 | Custom side panel div | Sheet already exists and provides slide-in animation, overlay, close button. Use it. |
| Canvas rendering | SVG rendering | Canvas is faster for 1000+ nodes but this is only 12 nodes + 18 links. SVG gives free DOM events, CSS styling, and simpler implementation. |

## Architecture Patterns

### Recommended Project Structure
```
src/
  app/
    monitoring/
      dgraph/
        page.tsx                    # DGraph Monitoring page (server component wrapper)
  components/
    dgraph/
      DgraphMonitoringPage.tsx      # Client component orchestrator
      ClusterTopology.tsx           # Force/Radial topology (DGRP-01, 02, 03)
      NodePopover.tsx               # Tier 1 popover card (DGRP-04)
      NodeDetailPanel.tsx           # Tier 2 side panel content (DGRP-04)
      QueryScatterPlot.tsx          # Brushable scatter (DGRP-05)
      ShardBarChart.tsx             # Grouped bar chart (DGRP-06)
      RecentEvents.tsx              # Events list (DGRP-07)
    charts/
      shared/
        chart-utils.ts              # (existing)
        chart-theme.ts              # (existing)
        chart-tooltip.ts            # (existing)
        ChartSkeleton.tsx           # (existing)
        ChartEmpty.tsx              # (existing)
```

### Pattern 1: D3 Force Simulation in React (useRef + useEffect)
**What:** Manage D3's mutable simulation inside React's immutable paradigm
**When to use:** Any force-directed layout in React
**Example:**
```typescript
// Source: D3 official docs + React best practice
"use client";

import { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";

export function ClusterTopology() {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<NodeDatum, LinkDatum> | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    // Create simulation ONCE
    const simulation = d3.forceSimulation<NodeDatum>(nodes)
      .force("link", d3.forceLink<NodeDatum, LinkDatum>(links).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

    simulationRef.current = simulation;

    // Drag behavior
    const drag = d3.drag<SVGCircleElement, NodeDatum>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Cleanup
    return () => {
      simulation.stop();
      simulationRef.current = null;
    };
  }, [/* stable dependencies only */]);

  return <svg ref={svgRef} />;
}
```

### Pattern 2: Force/Radial Layout Toggle via Force Swapping
**What:** Toggle between Force and Radial layouts by changing force configurations, not destroying/recreating the simulation
**When to use:** DGRP-01 layout toggle
**Example:**
```typescript
// Source: D3 forceRadial docs + layout transition best practice
function setForceLayout(simulation: d3.Simulation<NodeDatum, LinkDatum>) {
  simulation
    .force("radial", null) // Remove radial forces
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("link", d3.forceLink(links).id(d => d.id).distance(100))
    .alpha(0.3)            // Warm up gently
    .alphaTarget(0)
    .restart();
}

function setRadialLayout(simulation: d3.Simulation<NodeDatum, LinkDatum>) {
  simulation
    .force("charge", d3.forceManyBody().strength(-50)) // Weaker repulsion
    .force("center", null)  // Remove centering
    .force("link", d3.forceLink(links).id(d => d.id).distance(60).strength(0.1))
    .force("radial", d3.forceRadial<NodeDatum>(
      (d) => {
        if (d.type === "zero") return 0;      // Center ring
        if (d.name.includes("alpha")) return 120; // Middle ring
        return 200;                             // Outer ring
      },
      width / 2,
      height / 2
    ).strength(0.8))
    .alpha(0.3)
    .alphaTarget(0)
    .restart();
}
```

### Pattern 3: Particle Animation with requestAnimationFrame
**What:** Animate small circles ("particles") moving along link paths to represent data flow
**When to use:** DGRP-02 particle animation
**Example:**
```typescript
// Source: D3 path interpolation + requestAnimationFrame pattern
interface Particle {
  link: LinkDatum;
  offset: number;  // 0..1 progress along link
  speed: number;   // offset increment per frame
}

function animateParticles(
  particles: Particle[],
  particleSelection: d3.Selection<SVGCircleElement, Particle, SVGGElement, unknown>,
  destroyedRef: React.MutableRefObject<boolean>
) {
  function tick() {
    if (destroyedRef.current) return;

    particles.forEach(p => {
      p.offset += p.speed;
      if (p.offset > 1) p.offset -= 1; // Loop
    });

    particleSelection
      .attr("cx", d => {
        const src = d.link.source as NodeDatum;
        const tgt = d.link.target as NodeDatum;
        return src.x! + (tgt.x! - src.x!) * d.offset;
      })
      .attr("cy", d => {
        const src = d.link.source as NodeDatum;
        const tgt = d.link.target as NodeDatum;
        return src.y! + (tgt.y! - src.y!) * d.offset;
      });

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
```

### Pattern 4: Custom SVG-Triggered Popover
**What:** Show a floating card when a D3-rendered SVG node is clicked
**When to use:** DGRP-04 Tier 1 popover card
**Example:**
```typescript
// Source: Custom pattern for SVG + React interop
const [popoverState, setPopoverState] = useState<{
  node: ClusterNode;
  x: number;
  y: number;
} | null>(null);

// In D3 click handler (inside useEffect):
nodeSelection.on("click", (event, d) => {
  event.stopPropagation();
  const svgRect = svgRef.current!.getBoundingClientRect();
  const transform = d3.zoomTransform(svgRef.current!);
  setPopoverState({
    node: d,
    x: transform.applyX(d.x!) + svgRect.left,
    y: transform.applyY(d.y!) + svgRect.top,
  });
});

// In JSX (outside SVG):
{popoverState && (
  <NodePopover
    node={popoverState.node}
    x={popoverState.x}
    y={popoverState.y}
    onClose={() => setPopoverState(null)}
    onExpand={(node) => { setDetailNode(node); setPopoverState(null); }}
  />
)}
```

### Pattern 5: Brushable Scatter Plot
**What:** D3 brush on scatter plot to filter query data points
**When to use:** DGRP-05 query scatter plot
**Example:**
```typescript
// Source: D3 d3-brush official docs
const brush = d3.brush()
  .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
  .on("end", (event) => {
    if (!event.selection) {
      // No selection -- reset filter
      setFilteredQueries(allQueries);
      return;
    }
    const [[x0, y0], [x1, y1]] = event.selection;
    const filtered = allQueries.filter(q => {
      const cx = xScale(q.latency);
      const cy = yScale(q.throughput);
      return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
    });
    setFilteredQueries(filtered);
  });

svg.append("g")
  .attr("class", "brush")
  .call(brush);
```

### Pattern 6: Grouped Bar Chart
**What:** Two nested scaleBand scales for grouped bars
**When to use:** DGRP-06 shard bar chart
**Example:**
```typescript
// Source: D3 scaleBand pattern for grouped bars
const groups = data.map(d => d.group);       // ["Group 1", "Group 2", "Group 3"]
const shardNames = [...new Set(data.flatMap(d => d.shards.map(s => s.name)))];

const x0 = d3.scaleBand()
  .domain(groups)
  .range([margin.left, width - margin.right])
  .paddingInner(0.2);

const x1 = d3.scaleBand()
  .domain(shardNames)
  .range([0, x0.bandwidth()])
  .padding(0.05);

const y = d3.scaleLinear()
  .domain([0, d3.max(data, d => d3.max(d.shards, s => s.size))!])
  .nice()
  .range([height - margin.bottom, margin.top]);

const color = d3.scaleOrdinal<string>()
  .domain(shardNames)
  .range([colors.chart1, colors.chart2, colors.chart3, colors.chart4,
          colors.chart5, colors.chart6, colors.chart7, colors.chart8]);
```

### Anti-Patterns to Avoid
- **Re-creating simulation on every render:** Store simulation in useRef, not useState. Never put the simulation in React state -- it mutates nodes in place, which conflicts with React's immutability model.
- **Using d3.select inside render:** All D3 DOM manipulation must be inside useEffect. The SVG element itself can be JSX with a ref, but D3 mutations go in the effect.
- **Forgetting simulation.stop() cleanup:** Force simulation runs an internal timer. If you unmount the component without stopping it, you get memory leaks and errors accessing stale DOM references.
- **Using Canvas for 12 nodes:** Canvas is overkill and loses free SVG events/styling. SVG is the right choice for this node count.
- **Animating particles inside the simulation tick:** Particle animation should use its own `requestAnimationFrame` loop. The simulation tick only fires while alpha > alphaMin; once the layout stabilizes, ticks stop. Particles should keep moving.
- **Using shadcn Popover for SVG triggers:** Radix Popover expects a React-rendered trigger element with ref forwarding. D3-rendered SVG circles don't participate in React's tree. Use a custom positioned div instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Zoom/pan | Custom mouse event handlers | `d3.zoom()` | Handles touch, wheel, momentum, scale limits, coordinate transforms |
| Node dragging | Custom mousedown/mousemove | `d3.drag()` | Handles touch, pointer capture, subject detection, force sim integration |
| Brush selection | Custom rectangle drawing | `d3.brush()` | Handles resize handles, keyboard modifiers, selection state, touch |
| Scale calculations | Manual math for axes | `d3.scaleBand()`, `d3.scaleLinear()` | Handles padding, nice(), domain inversion, range mapping |
| Side panel slide-in | Custom CSS transition div | shadcn `Sheet` | Already exists with animation, overlay, close, accessibility |
| Axis rendering | Manual SVG text/lines | `d3.axisBottom()`, `d3.axisLeft()` | Handles tick formatting, label positioning, transitions |

**Key insight:** D3 v7's modular design means zoom, drag, brush, and force are all separate modules that compose cleanly. Let D3 handle interaction plumbing; focus custom code on the domain-specific rendering and data mapping.

## Common Pitfalls

### Pitfall 1: Force Simulation Mutation vs React State
**What goes wrong:** Putting D3 simulation nodes in React state causes infinite re-renders because the simulation mutates x/y/vx/vy on every tick.
**Why it happens:** React detects "state change" on every tick callback, triggers re-render, which re-runs useEffect, which creates a new simulation.
**How to avoid:** Store nodes array and simulation instance in `useRef`, not `useState`. Only use `useState` for UI state like selected node, layout mode, particle toggle.
**Warning signs:** Page freezes, console shows thousands of renders, simulation never stabilizes.

### Pitfall 2: Zoom + Drag Conflict
**What goes wrong:** Zoom and drag both listen to mousedown/mousemove. Without proper setup, dragging a node also pans the canvas.
**Why it happens:** Events bubble from node circles up to the SVG (where zoom is attached).
**How to avoid:** Apply `d3.drag()` to node elements. The drag handler calls `event.stopPropagation()` on `start` to prevent the zoom behavior from activating. Alternatively, apply zoom to the SVG and drag to circles; D3's event system handles priority correctly as long as drag is on a child element.
**Warning signs:** Nodes jump when dragged, canvas pans simultaneously with node drag.

### Pitfall 3: Particles Stop When Simulation Stabilizes
**What goes wrong:** Particle animation stops after ~2 seconds because it was tied to the simulation's `tick` event.
**Why it happens:** Force simulation alpha decays to < alphaMin (0.001) and stops ticking.
**How to avoid:** Run particle animation in a separate `requestAnimationFrame` loop that reads current node positions but doesn't depend on simulation tick events. Track a `destroyedRef` boolean to stop the loop on unmount.
**Warning signs:** Particles animate briefly then freeze in place.

### Pitfall 4: Layout Toggle Causes Node Position Jump
**What goes wrong:** Switching from Force to Radial (or back) causes nodes to teleport instead of smoothly transitioning.
**Why it happens:** Setting `alpha(1)` restarts the simulation at full temperature, causing violent movement. Or forces are removed/added abruptly.
**How to avoid:** Use a moderate alpha (0.3) when toggling. The simulation will gently move nodes to new positions over ~1 second. Keep the same node array -- don't create new nodes.
**Warning signs:** Nodes visibly jump to new positions, lines stretch wildly during transition.

### Pitfall 5: Brush Interferes with Click Events
**What goes wrong:** Clicking a dot on the scatter plot triggers a brush selection instead of (or in addition to) a dot click.
**Why it happens:** The brush overlay captures all mouse events in its extent.
**How to avoid:** Check `event.selection` in the brush end handler. If it's null or very small (< 5px), treat it as a click rather than a brush. Alternatively, layer the brush behind the dots.
**Warning signs:** Can't click individual dots, every click creates a tiny brush rectangle.

### Pitfall 6: Dark/Light Theme Color Stale After Toggle
**What goes wrong:** Chart colors don't update when theme switches.
**Why it happens:** `getChartColors()` resolves CSS variables at call time. If called only once in the initial useEffect, the resolved colors become stale after a theme toggle.
**How to avoid:** Re-resolve colors on theme change. Listen for the `dark` class change on `<html>` (via MutationObserver or the theme context) and re-render charts.
**Warning signs:** After toggling theme, chart colors still show the previous theme's values.

## Code Examples

### Node Status Ring with Pulse Animation
```typescript
// Source: CSS animation + D3 rendering pattern
// Status color mapping using existing semantic tokens
function getStatusColor(status: NodeStatus): string {
  switch (status) {
    case "healthy": return "var(--color-text-success)";
    case "warning": return "var(--color-text-warning)";
    case "error":   return "var(--color-text-critical)";
  }
}

// In D3 rendering:
nodeGroup.append("circle")
  .attr("r", NODE_RADIUS + 4)
  .attr("fill", "none")
  .attr("stroke", d => getStatusColor(d.status))
  .attr("stroke-width", 3)
  .attr("opacity", d => d.status === "healthy" ? 0.6 : 1);

// Pulse animation for warning/error nodes (CSS approach):
// Add a CSS class and animate with @keyframes
nodeGroup.filter(d => d.status !== "healthy")
  .select(".status-ring")
  .classed("pulse-ring", true);

// In CSS:
// @keyframes pulse-ring {
//   0%, 100% { opacity: 1; stroke-width: 3; }
//   50% { opacity: 0.4; stroke-width: 5; }
// }
// .pulse-ring { animation: pulse-ring 2s ease-in-out infinite; }
```

### Node Type Visual Differentiation
```typescript
// Source: Domain knowledge - Dgraph cluster topology
// Zero nodes: smaller, center role (coordinators)
// Alpha nodes: larger, data role
// Compute nodes: same type as alpha but different name prefix

const NODE_CONFIG = {
  zero:  { radius: 20, fill: "var(--chart-1)", label: "Z" }, // Blue
  alpha: { radius: 26, fill: "var(--chart-2)", label: "A" }, // Emerald
} as const;

function getNodeRadius(type: NodeType): number {
  return type === "zero" ? 20 : 26;
}
```

### Grouped Bar Chart Axis Formatting
```typescript
// Source: Existing chart-utils.ts formatNumber + D3 axis pattern
const yAxis = d3.axisLeft(y)
  .ticks(5)
  .tickFormat(d => formatNumber(d as number));

const xAxis = d3.axisBottom(x0)
  .tickSizeOuter(0);

// Apply with chart theme colors
svg.append("g")
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(xAxis)
  .call(g => g.select(".domain").attr("stroke", colors.axisLine))
  .call(g => g.selectAll(".tick line").attr("stroke", colors.tickLine))
  .call(g => g.selectAll(".tick text").attr("fill", colors.text).attr("font-size", 11));
```

### Popover Card Content (Tier 1)
```typescript
// Source: Design recommendation for Claude's discretion
// Popover shows: Name, Status badge, mini metrics, expand icon
interface NodePopoverProps {
  node: ClusterNode;
  x: number;
  y: number;
  onClose: () => void;
  onExpand: (node: ClusterNode) => void;
}

// Suggested layout:
// ┌─────────────────────────────┐
// │ sks-alpha-03       [warning]│  <- name + status badge
// │ 10.0.2.3:7080               │  <- host:port
// ├─────────────────────────────┤
// │ CPU    78.9%  ████████░░    │  <- mini progress bars
// │ Memory 85.2%  █████████░    │
// │ Disk   72.1%  ███████░░░    │
// ├─────────────────────────────┤
// │ QPS: 1,247/min              │
// │              [→ Details]    │  <- expand icon/button
// └─────────────────────────────┘
```

### Side Panel Content (Tier 2)
```typescript
// Source: Design recommendation for Claude's discretion
// Side panel shows expanded detail after clicking expand icon

// Suggested sections:
// 1. Node Header (name, status, uptime)
// 2. Metric Cards (CPU, Memory, Disk with trend sparklines)
// 3. Connection List (which nodes this one connects to, with link type)
// 4. Recent Events for this specific node (filtered from global events)
// 5. QPS breakdown (if data available)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| D3 v3/v4 force.start() | D3 v7 simulation.restart() | D3 v4 (2016) | velocity Verlet replaces Euler integration; alphaTarget for smooth transitions |
| D3 as monolith import | D3 v7 modular (`import { forceSimulation } from "d3"`) | D3 v4+ | Tree-shakeable, but since `d3` v7.9.0 is already bundled, import from `"d3"` is fine |
| jQuery + D3 DOM | React useRef + D3 for rendering | 2018+ | D3 handles SVG mutations inside useEffect; React handles state and lifecycle |
| Canvas for all graphs | SVG for small graphs, Canvas for large | Ongoing | 12 nodes = SVG is ideal; Canvas would be premature optimization |

**Deprecated/outdated:**
- `d3.layout.force()` (D3 v3 API) -- replaced by `d3.forceSimulation()` in v4+
- `force.start()` / `force.stop()` (D3 v3) -- replaced by `simulation.restart()` / `simulation.stop()`
- Directly reading `d3.event` (D3 v5 and earlier) -- v6+ passes event as first argument to handlers

## Open Questions

1. **Popover positioning during zoom/pan**
   - What we know: The popover is positioned using screen coordinates calculated from the node's simulation position + zoom transform + SVG bounding rect.
   - What's unclear: Should the popover move with the node during zoom/pan, or should it close? Moving requires updating position on zoom events. Closing is simpler.
   - Recommendation: Close the popover when zoom/pan starts. Re-open requires explicit re-click. This avoids complex position tracking and is standard UX for map-like interfaces.

2. **Particle count per link**
   - What we know: Each link should show flowing particles to indicate data flow. Link types differ (zero-alpha, alpha-alpha, zero-zero).
   - What's unclear: How many particles per link? Should particle density vary by link type?
   - Recommendation: 2-3 particles per link, staggered by offset (0, 0.33, 0.66). Zero-zero links (raft consensus) could have faster/more particles to indicate higher traffic. Compute-alpha links could show fewer. Total: ~40-55 particles for 18 links -- well within SVG performance budget.

3. **Events data source for DGRP-07**
   - What we know: The dgraph-data.ts file does not currently export a `getDgraphEvents()` function. The `Alert` type exists in types/index.ts.
   - What's unclear: Whether events data needs to be added to dgraph-data.ts or reused from another data file.
   - Recommendation: Add a `getDgraphEvents()` function to dgraph-data.ts returning 8-12 mock events with node IDs, severity, timestamps, and messages. Follow the same jitter pattern as other data functions.

4. **QPS value per node**
   - What we know: The popover shows QPS but `ClusterNode` type does not have a `qps` field. Only CPU/Memory/Disk are in the type.
   - What's unclear: Where QPS data comes from.
   - Recommendation: Either extend the data generator to include QPS per node, or derive it from the query scatter data by assigning queries to nodes. The simplest approach is adding a `qps` field to the node seed data in dgraph-data.ts.

## Sources

### Primary (HIGH confidence)
- [D3 Force Simulation API](https://d3js.org/d3-force/simulation) - Complete simulation lifecycle, node properties, alpha methods, tick events
- [D3 Force Link API](https://d3js.org/d3-force/link) - Link force with id accessor, distance, strength, iterations
- [D3 Force Many-Body API](https://d3js.org/d3-force/many-body) - Charge force with strength (-30 default), Barnes-Hut theta
- [D3 Force Position API](https://d3js.org/d3-force/position) - forceX, forceY, forceRadial with strength (0.1 default)
- [D3 Zoom API](https://d3js.org/d3-zoom) - Zoom behavior, scaleExtent, transform methods, event types
- [D3 Drag API](https://d3js.org/d3-drag) - Drag behavior, fx/fy pattern for force simulation integration
- [D3 Brush API](https://d3js.org/d3-brush) - 2D brush with extent, selection events, move/clear methods
- Codebase files verified: `src/data/dgraph-data.ts`, `src/types/index.ts`, `src/components/charts/shared/*.ts`, `src/components/ui/sheet.tsx`, `src/app/globals.css`, `package.json`

### Secondary (MEDIUM confidence)
- [Stamen - Forcing Functions](https://stamen.com/forcing-functions-inside-d3-v4-forces-and-layout-transitions-f3e89ee02d12/) - alphaTarget for smooth layout transitions
- [D3 Sticky Force Layout](https://observablehq.com/@d3/sticky-force-layout) - fx/fy pattern for keeping dragged nodes in place
- [Observable - Path animation with requestAnimationFrame](https://observablehq.com/@hjyeon/following-a-path-using-window-requestanimationframe) - Particle path following technique
- [D3 Graph Gallery - Grouped Bar](https://d3-graph-gallery.com/graph/barplot_grouped_basicWide.html) - Double scaleBand pattern for grouped bars
- [Bostock Grouped Bar Gist](https://gist.github.com/mbostock/3887051) - Classic grouped bar chart example

### Tertiary (LOW confidence)
- None. All findings verified against official D3 documentation or codebase inspection.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and verified in package.json; D3 v7.9.0 confirmed
- Architecture: HIGH - Patterns verified against D3 official docs; existing codebase utilities confirmed; component structure follows established project patterns
- Pitfalls: HIGH - Well-documented issues in D3+React integration; verified against official docs and established community patterns
- Data layer: HIGH - All data functions inspected directly in codebase; types verified in types/index.ts

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (stable -- D3 v7 and React 19 are mature)
