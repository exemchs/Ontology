# Phase 3: Ontology Dashboard - Research

**Researched:** 2026-02-19
**Domain:** D3.js v7 chart implementation (gauge, line, chord, force, sankey, scatter, bar), React component patterns, dashboard grid layout, shadcn/ui accordion
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 2-column grid layout
- Row 1: metric cards 4 (full width)
- Row 2: gauges 3 (full width)
- Row 3: dual line chart (left) + ontology relation chart (right)
- Row 4: node scatter plot (left) + resource bar chart (right)
- Row 5: Recent Alerts list (full width)
- Ontology relation chart: 3 view types (Chord Diagram / Force Graph / Sankey Diagram) with toggle
- Default view: Force Graph
- Sankey Diagram: direction filter (All default / Inbound / Outbound)
- Chord and Force: no direction filter
- Hover highlight on all 3 views
- Recent Alerts: 5 items list, severity badge + relative time + message
- Click to accordion expand: node name, detailed message, resolved status
- Only one accordion item expanded at a time

### Claude's Discretion
- Metric card internal design (number size, trend icon style, change rate display)
- Gauge 270-degree arc internal design (glow intensity, label placement)
- Dual line chart hourly/daily toggle UI style
- Relation chart 3 views specific colors/animations
- Scatter plot glow effect intensity and node size
- Resource bar chart Stacked/Grouped toggle UI style
- Alert accordion expanded detail fields

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DASH-01 | Metric cards 4 (Total Nodes, Relations, Query Rate, Uptime) | Data: `getDashboardMetrics()` already returns 4 items with label/value/unit/change/changeLabel. UI: shadcn Card component + Tailwind layout. |
| DASH-02 | D3 resource gauges 3 (CPU/Memory/Disk, 270-degree arc, 80% threshold glow) | Data: `getDashboardGauges()` returns GaugeData[]. D3: `d3.arc()` with startAngle/endAngle for 270-degree sweep. SVG filter for glow. |
| DASH-03 | D3 dual line chart (Agent Request Rate + Graph Query QPS, hourly/daily toggle) | Data: `getDashboardTimeSeries()` returns 2 series. D3: `d3.line()` + `d3.scaleTime()` + `d3.scaleLinear()`. Toggle regenerates data with different interval. |
| DASH-04 | D3 chord diagram (6 ontology types, hover highlight) -- expanded to 3 views with toggle | Data: `getOntologyTypes()` from studio-data.ts provides 6 types with relations. Need matrix derivation for Chord, node/link for Force, node/link for Sankey. d3-chord, d3-force, d3-sankey (MUST INSTALL). |
| DASH-05 | D3 node scatter plot (Latency x Throughput, glow effect) | Data: MUST ADD scatter data to dashboard-data.ts. D3: `d3.scaleLinear()` for both axes + SVG feGaussianBlur filter for glow. |
| DASH-06 | D3 resource bar chart (Stacked/Grouped toggle, CPU/Memory/Disk) | Data: MUST ADD per-node resource bar data to dashboard-data.ts. D3: `d3.stack()` for stacked, `d3.scaleBand()` + grouped offset for grouped. Animated transition between layouts. |
| DASH-07 | Recent Alerts list (accordion style) | Data: MUST ADD alerts data to dashboard-data.ts (5 Alert items). UI: shadcn Accordion component (MUST INSTALL via CLI) or Collapsible with controlled state. |
</phase_requirements>

---

## Summary

Phase 3 builds the landing page dashboard with 7 visual components: 4 metric cards (pure React/Tailwind), 3 D3 gauge arcs, 1 D3 dual-line time series chart, 1 D3 ontology relation chart (3 switchable views: Chord/Force/Sankey), 1 D3 scatter plot, 1 D3 stacked/grouped bar chart, and 1 alert list with accordion expand. This is the first phase that produces real D3 charts, so it serves as a pattern validation for all subsequent phases.

The codebase already has substantial foundation from Phase 1: `chart-utils.ts` (cleanup, ResizeObserver, formatNumber), `chart-theme.ts` (CSS variable resolution to concrete colors), `chart-tooltip.ts` (body-appended tooltip with viewport correction), `ChartSkeleton`/`ChartEmpty` components, and the `dashboard-data.ts` file with metrics, gauges, and time series. However, three data gaps exist: (1) scatter plot data (Latency x Throughput per node), (2) per-node resource bar data for stacked/grouped chart, and (3) alert data for the Recent Alerts component. These must be added to `dashboard-data.ts`.

The highest-complexity component is DASH-04 (ontology relation chart with 3 views). This requires d3-chord (already installed), d3-force (already installed), and d3-sankey (NOT installed -- must add). The data transformation layer must convert the flat `OntologyRelation[]` from `studio-data.ts` into three different formats: an NxN matrix for Chord, a nodes+links array for Force, and a nodes+links array for Sankey. A shared data transformation utility should handle this.

**Primary recommendation:** Build a reusable `useD3Chart` hook pattern that wraps useRef + useEffect + ResizeObserver + cleanup, then implement each chart as a self-contained component that consumes data props and uses this hook. Install `d3-sankey` + `@types/d3-sankey` and the shadcn accordion component before starting chart implementation.

---

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Verified |
|---------|---------|---------|----------|
| d3 | ^7.9.0 | Full D3 bundle (includes d3-shape, d3-scale, d3-axis, d3-selection, d3-transition, d3-chord, d3-force) | package.json |
| @types/d3 | ^7.4.3 | TypeScript definitions | package.json devDeps |
| next-themes | ^0.4.6 | Theme provider (dark/light toggle) | package.json |
| shadcn/ui | v3.8.5 | UI components (Card, Badge, Tabs, etc.) | package.json devDeps |
| radix-ui | ^1.4.3 | Headless primitives (Collapsible already used) | package.json |
| lucide-react | ^0.574.0 | Icons (TrendingUp, TrendingDown, Activity, etc.) | package.json |

### To Install (Phase 3)

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| d3-sankey | ^0.12.3 | Sankey diagram layout algorithm | Required for DASH-04 Sankey view. NOT bundled in d3 core package. |
| @types/d3-sankey | ^0.12.x | TypeScript definitions for d3-sankey | Project uses strict TypeScript. |

### shadcn/ui Component to Add

| Component | Purpose | Why |
|-----------|---------|-----|
| accordion | Recent Alerts accordion (DASH-07) | shadcn accordion wraps Radix Accordion with "type=single collapsible" for one-at-a-time behavior. |

### D3 Sub-Modules Used (from d3 bundle)

| Module | Chart(s) | Key Imports |
|--------|----------|-------------|
| d3-shape | Gauge, Line, Chord | `arc()`, `line()`, `curveMonotoneX`, `ribbon()` |
| d3-scale | All D3 charts | `scaleLinear()`, `scaleTime()`, `scaleBand()`, `scaleOrdinal()` |
| d3-axis | Line, Scatter, Bar | `axisBottom()`, `axisLeft()` |
| d3-selection | All D3 charts | `select()`, `selectAll()` |
| d3-transition | All D3 charts | `.transition()`, `.duration()` |
| d3-chord | Chord view | `chord()`, `ribbon()` |
| d3-force | Force view | `forceSimulation()`, `forceLink()`, `forceManyBody()`, `forceCenter()`, `forceCollide()` |
| d3-array | Bar, Scatter | `extent()`, `max()`, `range()` |
| d3-time-format | Line chart axis | `timeFormat()` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| d3-sankey | Manual Sankey layout | d3-sankey handles node positioning, link width calculation, iterative relaxation -- extremely complex to hand-roll |
| shadcn Accordion | Collapsible with manual state | Accordion has built-in one-at-a-time logic via `type="single"`; Collapsible would need custom state management |
| Individual D3 chart components | recharts/nivo | User decided D3.js for all charts; these alternatives are out of scope |

**Installation:**
```bash
# 1. d3-sankey + types
npm install d3-sankey
npm install -D @types/d3-sankey

# 2. shadcn accordion component
npx shadcn@latest add accordion
```

---

## Architecture Patterns

### Recommended Project Structure (Phase 3 deliverables)

```
src/
├── app/
│   └── page.tsx                                    # UPDATE: Dashboard page with grid layout
├── components/
│   ├── charts/
│   │   ├── shared/
│   │   │   ├── chart-utils.ts                      # EXISTS
│   │   │   ├── chart-theme.ts                      # EXISTS
│   │   │   ├── chart-tooltip.ts                    # EXISTS
│   │   │   ├── ChartSkeleton.tsx                   # EXISTS
│   │   │   └── ChartEmpty.tsx                      # EXISTS
│   │   └── dashboard/
│   │       ├── MetricCard.tsx                       # NEW: Single metric card (shadcn Card)
│   │       ├── ResourceGauge.tsx                    # NEW: D3 270-deg arc gauge
│   │       ├── DualLineChart.tsx                    # NEW: D3 dual time-series line chart
│   │       ├── OntologyRelationChart.tsx            # NEW: Container with view toggle
│   │       ├── OntologyChordView.tsx                # NEW: D3 chord diagram
│   │       ├── OntologyForceView.tsx                # NEW: D3 force-directed graph
│   │       ├── OntologySankeyView.tsx               # NEW: D3 sankey diagram
│   │       ├── NodeScatterPlot.tsx                  # NEW: D3 scatter (Latency x Throughput)
│   │       ├── ResourceBarChart.tsx                 # NEW: D3 stacked/grouped bar
│   │       └── RecentAlerts.tsx                     # NEW: Accordion alert list
│   └── ui/
│       └── accordion.tsx                            # NEW: shadcn accordion (CLI install)
├── data/
│   ├── dashboard-data.ts                            # UPDATE: Add scatter, bar, alert data
│   └── studio-data.ts                               # READ-ONLY: getOntologyTypes() for relation data
├── lib/
│   └── ontology-relation-data.ts                    # NEW: Transform OntologyType[] -> chord matrix / force nodes+links / sankey nodes+links
└── types/
    └── index.ts                                     # UPDATE: Add ScatterPoint, ResourceBarData, possibly extend Alert
```

### Pattern 1: useD3Chart Hook (Reusable D3-in-React Pattern)

**What:** A custom hook that encapsulates the ref + useEffect + ResizeObserver + cleanup lifecycle for every D3 chart.
**When to use:** Every D3 chart component in this phase (and all subsequent phases).
**Why:** Prevents the #1 source of D3-in-React bugs: forgotten cleanup, stale refs, and resize handling.

```typescript
// Suggested pattern - each chart component follows this structure
"use client";

import { useRef, useEffect } from "react";
import { select } from "d3-selection";
import { cleanupD3Svg, createDebouncedResizeObserver } from "@/components/charts/shared/chart-utils";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import { ChartSkeleton } from "@/components/charts/shared/ChartSkeleton";

interface Props {
  data: SomeDataType[];
  className?: string;
}

export function SomeD3Chart({ data, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || data.length === 0) return;

    // Destroyed flag for async safety
    let destroyed = false;

    const tooltip = createTooltip();
    const colors = getChartColors();

    function render(width: number, height: number) {
      if (destroyed) return;
      cleanupD3Svg(container);

      const svg = select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      // ... D3 rendering logic using colors, tooltip ...
    }

    // Initial render
    const { width, height } = container.getBoundingClientRect();
    if (width > 0 && height > 0) render(width, height);

    // Responsive resize
    const observer = createDebouncedResizeObserver((w, h) => render(w, h));
    observer.observe(container);

    // Cleanup
    return () => {
      destroyed = true;
      observer.disconnect();
      tooltip.destroy();
      cleanupD3Svg(container);
    };
  }, [data]); // Re-render when data changes

  if (data.length === 0) return <ChartEmpty />;

  return <div ref={containerRef} className={className} />;
}
```

### Pattern 2: Theme-Reactive D3 Charts

**What:** D3 charts must respond to dark/light theme changes without full remount.
**When to use:** All D3 chart components.
**How:** Listen for theme changes via MutationObserver on `document.documentElement` class changes, then re-resolve colors and re-render.

```typescript
// Add theme dependency to useEffect
import { useTheme } from "next-themes";

export function SomeChart({ data }: Props) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ... render logic ...
    // getChartColors() resolves CSS variables which change with theme
  }, [data, resolvedTheme]); // Re-render on theme change

  // ...
}
```

### Pattern 3: Ontology Relation Data Transformation

**What:** A pure function module that transforms `OntologyType[]` + `OntologyRelation[]` into the three data formats needed by Chord, Force, and Sankey views.
**When to use:** DASH-04 (the 3-view ontology relation chart).

```typescript
// src/lib/ontology-relation-data.ts

import type { OntologyType } from "@/types";

// For Chord: NxN matrix where matrix[i][j] = relationship weight from type i to type j
export interface ChordData {
  matrix: number[][];
  names: string[];
  colors: string[];
}

// For Force: nodes and links with source/target indices
export interface ForceNode {
  id: string;
  name: string;
  nodeCount: number;
  color: string;
}
export interface ForceLink {
  source: string;
  target: string;
  label: string;
}
export interface ForceData {
  nodes: ForceNode[];
  links: ForceLink[];
}

// For Sankey: nodes and links with value (flow width)
export interface SankeyNodeData {
  name: string;
  color: string;
}
export interface SankeyLinkData {
  source: number;
  target: number;
  value: number;
  label: string;
}
export interface SankeyData {
  nodes: SankeyNodeData[];
  links: SankeyLinkData[];
}

export function buildChordData(types: OntologyType[]): ChordData { /* ... */ }
export function buildForceData(types: OntologyType[]): ForceData { /* ... */ }
export function buildSankeyData(types: OntologyType[], direction: "all" | "inbound" | "outbound"): SankeyData { /* ... */ }
```

### Pattern 4: Stacked/Grouped Bar Toggle

**What:** D3 animated transition between stacked and grouped bar layouts.
**When to use:** DASH-06 (Resource Bar Chart).
**Key technique:** Pre-compute both layouts (stacked y0/y1 and grouped x-offset), then transition `attr("y")` and `attr("height")` values.

```typescript
// Stacked layout: d3.stack() generates y0, y1 per segment
// Grouped layout: manual x-offset using scaleBand with inner padding
// Toggle: re-bind data, transition bars from current to target positions
```

### Anti-Patterns to Avoid

- **Direct DOM manipulation outside useEffect:** D3 select/append must only happen inside useEffect, never in the render body.
- **Missing cleanup on unmount:** Every D3 chart MUST return a cleanup function that calls cleanupD3Svg, disconnects observers, destroys tooltips, and stops force simulations.
- **Using D3 for layout that Tailwind can handle:** Metric cards and alert list are NOT D3 charts. Use shadcn/ui Card + Tailwind grid, not D3.
- **Global SVG defs:** SVG filter definitions (glow, gradients) must be scoped per chart instance, not shared globally. Use unique IDs (e.g., `glow-${chartId}`) to prevent conflicts.
- **Forgetting force.stop():** Force simulations (DASH-04 Force view) must be stopped in the cleanup function or they continue running after unmount, causing memory leaks and errors.
- **Animating on mount with empty container:** Always check container dimensions are > 0 before rendering. If the container is hidden (e.g., in an inactive tab), defer rendering.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sankey node/link positioning | Custom node layout + link path calculation | `d3-sankey` sankey() + sankeyLinkHorizontal() | Iterative relaxation algorithm is non-trivial; handles node stacking, link ordering, and value-proportional widths |
| Chord arc/ribbon positioning | Manual angle calculation for N groups | `d3.chord()` + `d3.ribbon()` | Matrix-to-arc conversion with padding, sorting, and ribbon interpolation is mathematically complex |
| SVG glow effect | CSS box-shadow on SVG elements | SVG `<filter>` with `feGaussianBlur` + `feComposite` | box-shadow doesn't work on SVG elements; must use SVG filter pipeline |
| Accordion one-at-a-time logic | Manual open/close state management | shadcn Accordion `type="single" collapsible` | Radix handles keyboard nav, focus management, animation, ARIA attributes |
| Resize-responsive charts | window.addEventListener("resize") with debounce | `createDebouncedResizeObserver()` from chart-utils.ts | ResizeObserver is element-level (not window-level), handles sidebar collapse/expand, and is already built |
| Tooltip positioning with viewport correction | Naive `event.pageX + offset` | `createTooltip()` from chart-tooltip.ts | Handles viewport boundary flipping, theme-aware colors, body-appended positioning -- already built |
| Time axis formatting | Manual date string formatting | `d3.timeFormat()` + `d3.scaleTime()` | Handles locale-aware formatting, tick density, and scale domain computation |

**Key insight:** The chart utility layer from Phase 1 (chart-utils, chart-theme, chart-tooltip) was specifically designed to be consumed by Phase 3+ charts. Every D3 chart MUST use these utilities rather than reimplementing cleanup, color resolution, or tooltips.

---

## Common Pitfalls

### Pitfall 1: d3-sankey Not In D3 Bundle
**What goes wrong:** Importing `import { sankey } from "d3"` fails because d3-sankey is a separate package, NOT included in the d3 umbrella package.
**Why it happens:** d3-sankey is maintained by the D3 organization but is not part of the core d3 bundle.
**How to avoid:** Install separately: `npm install d3-sankey` and import from `"d3-sankey"` directly.
**Warning signs:** TypeScript error "Module 'd3' has no exported member 'sankey'".

### Pitfall 2: Force Simulation Memory Leak
**What goes wrong:** Force simulation continues running (calling tick events) after component unmount, causing "Cannot update unmounted component" errors and memory leaks.
**Why it happens:** `d3.forceSimulation()` runs an internal timer. If not explicitly stopped, it persists beyond React component lifecycle.
**How to avoid:** In the useEffect cleanup function, call `simulation.stop()` before `cleanupD3Svg()`.
**Warning signs:** Console warnings about state updates on unmounted components; increasing memory usage when navigating away and back.

### Pitfall 3: 270-Degree Gauge Angle Math
**What goes wrong:** Gauge arc renders incorrectly (wrong start position, wrong direction, or full circle instead of 270 degrees).
**Why it happens:** D3 arc angles are in radians, with 0 at 12 o'clock and positive values going clockwise. The 270-degree arc must leave a 90-degree gap at the bottom.
**How to avoid:** Use `startAngle = -3*PI/4` (7:30 position) and `endAngle = 3*PI/4` (4:30 position) for a symmetric 270-degree arc with the gap at 6 o'clock. The value arc scales between these angles.
**Warning signs:** Arc doesn't look symmetric, gap is at wrong position, or value exceeds the track.

### Pitfall 4: Chord Matrix Must Be Square and Match Type Count
**What goes wrong:** Chord diagram renders empty or throws an error.
**Why it happens:** `d3.chord()` requires an NxN square matrix where N equals the number of groups. If the matrix dimensions don't match, or if values are negative, the layout fails silently.
**How to avoid:** Derive the matrix programmatically from `OntologyType[].relations`. Ensure matrix is exactly 6x6 (one row/column per ontology type). Use relation count or nodeCount-based weights for cell values. Fill diagonal with 0.
**Warning signs:** Empty SVG, no ribbons rendered, console errors about NaN angles.

### Pitfall 5: Sankey Direction Filter Data Inconsistency
**What goes wrong:** Switching between All/Inbound/Outbound filters shows wrong or empty links.
**Why it happens:** The OntologyRelation data uses `direction: "outbound" | "inbound"` but all seed data currently only has `direction: "outbound"`. For "Inbound" filter to show anything, we need to compute inverse relations.
**How to avoid:** When building Sankey data for "Inbound" filter, reverse the source/target of outbound relations. For "All", include both directions. The data transformation function must handle this.
**Warning signs:** Inbound filter shows empty diagram.

### Pitfall 6: SVG Filter ID Collisions
**What goes wrong:** Glow effect from one chart bleeds into another, or stops working after re-render.
**Why it happens:** SVG `<filter>` elements are referenced by ID (`filter: url(#glow)`). If two charts use the same ID, they interfere.
**How to avoid:** Use unique filter IDs per chart instance. A simple pattern: `const filterId = useId()` or `glow-${Math.random().toString(36).slice(2)}`.
**Warning signs:** Glow appears on wrong chart, or disappears after navigating.

### Pitfall 7: Theme Switch Without Re-render
**What goes wrong:** D3 charts keep old theme colors after switching dark/light.
**Why it happens:** D3 renders to real DOM with resolved color values. CSS variable changes don't automatically update already-rendered SVG attributes.
**How to avoid:** Include `resolvedTheme` from `useTheme()` in the useEffect dependency array. When theme changes, `getChartColors()` will resolve new values and the chart re-renders.
**Warning signs:** Charts show light-mode colors on dark background or vice versa.

---

## Code Examples

### Example 1: 270-Degree Arc Gauge with Threshold Glow (DASH-02)

```typescript
// Source: D3 d3-shape/arc API + SVG filter spec
import { arc as d3Arc } from "d3-shape";
import { select } from "d3-selection";
import type { GaugeData } from "@/types";

function renderGauge(container: HTMLElement, data: GaugeData, colors: ChartColors) {
  const width = 200;
  const height = 200;
  const outerRadius = 80;
  const innerRadius = 60;

  // 270-degree arc: gap at bottom (6 o'clock)
  const startAngle = -Math.PI * 3 / 4;  // -135 degrees (7:30 position)
  const endAngle = Math.PI * 3 / 4;     // +135 degrees (4:30 position)
  const angleRange = endAngle - startAngle; // 270 degrees = 3PI/2

  const valueAngle = startAngle + (data.value / data.max) * angleRange;
  const threshold = 0.8; // 80%
  const isAboveThreshold = data.value / data.max >= threshold;

  const svg = select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // SVG glow filter (only applied above threshold)
  const defs = svg.append("defs");
  const filterId = `gauge-glow-${data.label}`;
  const filter = defs.append("filter").attr("id", filterId);
  filter.append("feGaussianBlur").attr("stdDeviation", 3.5).attr("result", "blur");
  filter.append("feComposite")
    .attr("in", "SourceGraphic")
    .attr("in2", "blur")
    .attr("operator", "over");

  const g = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Background track arc
  const trackArc = d3Arc<unknown>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle(startAngle)
    .endAngle(endAngle)
    .cornerRadius(4);

  g.append("path")
    .attr("d", trackArc({}))
    .attr("fill", colors.gridLine)
    .attr("opacity", 0.3);

  // Value arc
  const valueArc = d3Arc<unknown>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle(startAngle)
    .endAngle(valueAngle)
    .cornerRadius(4);

  g.append("path")
    .attr("d", valueArc({}))
    .attr("fill", data.color)
    .attr("filter", isAboveThreshold ? `url(#${filterId})` : null);

  // Center text
  g.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "0.1em")
    .attr("fill", colors.text)
    .attr("font-size", "24px")
    .attr("font-weight", "bold")
    .text(`${data.value}%`);

  g.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "1.8em")
    .attr("fill", colors.textSecondary)
    .attr("font-size", "12px")
    .text(data.label);
}
```

### Example 2: Chord Diagram Matrix from OntologyType[] (DASH-04)

```typescript
// Source: d3-chord API + studio-data.ts structure
import type { OntologyType } from "@/types";

export function buildChordMatrix(types: OntologyType[]): {
  matrix: number[][];
  names: string[];
} {
  const names = types.map(t => t.name);
  const nameIndex = new Map(names.map((n, i) => [n, i]));
  const n = names.length;

  // Initialize NxN zero matrix
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  // Fill matrix from relations
  for (const type of types) {
    const sourceIdx = nameIndex.get(type.name);
    if (sourceIdx === undefined) continue;

    for (const rel of type.relations) {
      const targetIdx = nameIndex.get(rel.target);
      if (targetIdx === undefined) continue;

      // Weight by source nodeCount (proportional to importance)
      // Multiplier to make ribbons visible
      matrix[sourceIdx][targetIdx] += Math.round(type.nodeCount / 100);
    }
  }

  return { matrix, names };
}
```

### Example 3: Sankey with Direction Filter (DASH-04)

```typescript
// Source: d3-sankey API
import { sankey, sankeyLinkHorizontal, sankeyCenter } from "d3-sankey";

interface SankeyInput {
  nodes: Array<{ name: string }>;
  links: Array<{ source: number; target: number; value: number }>;
}

function buildSankeyInput(
  types: OntologyType[],
  direction: "all" | "inbound" | "outbound"
): SankeyInput {
  const names = types.map(t => t.name);
  const nameIndex = new Map(names.map((n, i) => [n, i]));
  const nodes = names.map(name => ({ name }));
  const links: Array<{ source: number; target: number; value: number }> = [];

  for (const type of types) {
    const sourceIdx = nameIndex.get(type.name)!;
    for (const rel of type.relations) {
      const targetIdx = nameIndex.get(rel.target);
      if (targetIdx === undefined) continue;

      if (direction === "all" || direction === "outbound") {
        links.push({ source: sourceIdx, target: targetIdx, value: type.nodeCount });
      }
      if (direction === "all" || direction === "inbound") {
        // Reverse: target -> source for inbound view
        links.push({ source: targetIdx, target: sourceIdx, value: type.nodeCount });
      }
    }
  }

  // De-duplicate for "all" direction (same pair can appear twice)
  // Aggregate values for same source-target pair
  const linkMap = new Map<string, { source: number; target: number; value: number }>();
  for (const link of links) {
    const key = `${link.source}-${link.target}`;
    const existing = linkMap.get(key);
    if (existing) {
      existing.value += link.value;
    } else {
      linkMap.set(key, { ...link });
    }
  }

  return { nodes, links: Array.from(linkMap.values()) };
}

function renderSankey(container: HTMLElement, input: SankeyInput, width: number, height: number) {
  const sankeyLayout = sankey<{ name: string }, { value: number }>()
    .nodeWidth(15)
    .nodePadding(10)
    .nodeAlign(sankeyCenter)
    .extent([[1, 5], [width - 1, height - 5]]);

  const { nodes, links } = sankeyLayout({
    nodes: input.nodes.map(d => ({ ...d })),
    links: input.links.map(d => ({ ...d })),
  });

  // Render nodes as rects, links using sankeyLinkHorizontal()
  // ...
}
```

### Example 4: Stacked-to-Grouped Bar Transition (DASH-06)

```typescript
// Source: Observable stacked-to-grouped bars example
// Key: pre-compute both positions, animate between them

function transitionToGrouped(bars: d3.Selection<SVGRectElement, any, any, any>,
  x: d3.ScaleBand<string>, y: d3.ScaleLinear<number, number>,
  categories: string[], innerScale: d3.ScaleBand<string>) {
  bars.transition()
    .duration(500)
    .attr("x", (d: any) => (x(d.data.name) ?? 0) + (innerScale(d.category) ?? 0))
    .attr("width", innerScale.bandwidth())
    .attr("y", (d: any) => y(d.value))
    .attr("height", (d: any) => y(0) - y(d.value));
}

function transitionToStacked(bars: d3.Selection<SVGRectElement, any, any, any>,
  x: d3.ScaleBand<string>, y: d3.ScaleLinear<number, number>) {
  bars.transition()
    .duration(500)
    .attr("x", (d: any) => x(d.data.name) ?? 0)
    .attr("width", x.bandwidth())
    .attr("y", (d: any) => y(d[1]))
    .attr("height", (d: any) => y(d[0]) - y(d[1]));
}
```

### Example 5: SVG Glow Filter for Scatter Plot (DASH-05)

```typescript
// Source: SVG filter specification + Visual Cinnamon glow pattern
function addGlowFilter(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, filterId: string) {
  const defs = svg.append("defs");
  const filter = defs.append("filter")
    .attr("id", filterId)
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");

  filter.append("feGaussianBlur")
    .attr("in", "SourceGraphic")
    .attr("stdDeviation", 4)
    .attr("result", "blur");

  filter.append("feMerge")
    .selectAll("feMergeNode")
    .data(["blur", "SourceGraphic"])
    .join("feMergeNode")
    .attr("in", d => d);
}

// Usage on scatter dots:
svg.selectAll("circle")
  .data(scatterData)
  .join("circle")
  .attr("cx", d => xScale(d.latency))
  .attr("cy", d => yScale(d.throughput))
  .attr("r", 6)
  .attr("fill", colors.chart1)
  .attr("filter", `url(#${filterId})`)
  .attr("opacity", 0.8);
```

---

## Data Gaps (Must Be Added to dashboard-data.ts)

### Gap 1: Scatter Plot Data (DASH-05)

The scatter plot needs Latency x Throughput data per node. This does not exist in `dashboard-data.ts`.

```typescript
// Suggested addition to dashboard-data.ts
export interface ScatterPoint {
  name: string;        // Node name
  latency: number;     // ms (x-axis)
  throughput: number;  // ops/sec (y-axis)
  status: NodeStatus;  // For color coding
}

export function getDashboardScatterData(): ScatterPoint[] {
  // Generate from 12 nodes with jitter
  return [
    { name: "sks-zero-01", latency: addJitter(2.1, 10), throughput: addJitter(850, 8), status: "healthy" },
    { name: "sks-zero-02", latency: addJitter(1.8, 10), throughput: addJitter(920, 8), status: "healthy" },
    // ... 12 nodes total
  ];
}
```

### Gap 2: Resource Bar Chart Data (DASH-06)

Per-node CPU/Memory/Disk data for the stacked/grouped bar chart.

```typescript
// Suggested addition to dashboard-data.ts
export interface ResourceBarData {
  name: string;    // Short node name
  cpu: number;     // percentage
  memory: number;  // percentage
  disk: number;    // percentage
}

export function getDashboardResourceBars(): ResourceBarData[] {
  // 12 nodes with resource percentages
  // Can derive from dgraph-data.ts node seeds with jitter
}
```

### Gap 3: Alert Data (DASH-07)

5 recent alerts for the accordion list.

```typescript
// Suggested addition to dashboard-data.ts
import type { Alert } from "@/types";

export function getDashboardAlerts(): Alert[] {
  return [
    {
      id: 1, clusterId: 1, nodeId: 12, severity: "error",
      title: "Node sks-compute-03 High CPU",
      message: "CPU usage exceeded 90% threshold for 5 consecutive minutes. Current: 92.1%.",
      resolved: false, resolvedAt: null,
    },
    // ... 5 total
  ];
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| D3 v6 chord with manual typing | D3 v7 chord with @types/d3 | D3 v7 (2021) | Better tree-shaking, ES module imports, native TypeScript support |
| tailwindcss-animate for shadcn | tw-animate-css | Tailwind v4 (2024) | Already using tw-animate-css in project |
| Window resize event for chart sizing | ResizeObserver | All modern browsers | Already using createDebouncedResizeObserver in chart-utils.ts |
| d3.forceSimulation with SVG | d3.forceSimulation with Canvas | Performance-critical cases | SVG is fine for 6 nodes; Canvas would be overkill here |

**Deprecated/outdated:**
- `d3.svg.arc()` (D3 v3 API): Use `d3.arc()` from `d3-shape`
- `tailwindcss-animate`: Replaced by `tw-animate-css` (already handled in Phase 1)
- Global SVG filter defs: Use per-component scoped filters with unique IDs

---

## Open Questions

1. **Dashboard page route**
   - What we know: Current `page.tsx` at `/` is a bare scaffold. Phase 2 defines routing with `/` as the dashboard.
   - What's unclear: Whether Phase 2 layout shell will already mount the dashboard page component or leave it as a placeholder.
   - Recommendation: Phase 3 should create the dashboard content regardless. Either replace `page.tsx` content directly, or create a `DashboardPage` component that Phase 2's layout will mount.

2. **Time series data for hourly vs daily toggle**
   - What we know: `getDashboardTimeSeries()` generates 24 points at 5-minute intervals (2 hours of data).
   - What's unclear: How "hourly" vs "daily" toggle should differ. Options: (a) hourly = 24 points at 5-min, daily = 24 points at 1-hour; (b) hourly = 12 points at 5-min, daily = 7 points at 1-day.
   - Recommendation: hourly = 24 points at 5-min intervals (current), daily = 24 points at 1-hour intervals. Update `getDashboardTimeSeries()` to accept an `interval: "hourly" | "daily"` parameter.

3. **Ontology relation weights for chord/sankey**
   - What we know: Relations in studio-data.ts are structural (name, target, direction) with no explicit weight/count.
   - What's unclear: What values to use for chord ribbon width and sankey link width.
   - Recommendation: Use source type's `nodeCount` as the weight for each outbound relation. This gives proportional visual importance (Wafer->Defect will be thicker than Recipe->Process, reflecting data volume).

---

## Sources

### Primary (HIGH confidence)
- Existing codebase: `chart-utils.ts`, `chart-theme.ts`, `chart-tooltip.ts`, `dashboard-data.ts`, `studio-data.ts`, `types/index.ts` -- verified by reading source files
- D3 v7 API: [d3-shape/arc](https://d3js.org/d3-shape/arc) -- arc angle system, cornerRadius, generator pattern
- D3 v7 API: [d3-chord](https://d3js.org/d3-chord) -- chord() layout, ribbon() shape, matrix input format
- D3 v7 API: [d3-force](https://d3js.org/d3-force) -- forceSimulation, forceLink, forceManyBody, forceCenter
- Package.json verified: d3 ^7.9.0, no d3-sankey installed, d3-chord available as sub-module of d3

### Secondary (MEDIUM confidence)
- [d3-sankey npm](https://www.npmjs.com/package/d3-sankey) -- version ^0.12.3, API: sankey(), sankeyLinkHorizontal(), sankeyCenter
- [@types/d3-sankey](https://www.npmjs.com/package/@types/d3-sankey) -- TypeScript definitions available
- [shadcn/ui Accordion](https://ui.shadcn.com/docs/components/radix/accordion) -- Radix-based, type="single" collapsible
- [React Graph Gallery - Chord](https://www.react-graph-gallery.com/chord-diagram) -- React + D3 chord integration pattern
- [Visual Cinnamon - Glow Filter](https://www.visualcinnamon.com/2016/06/glow-filter-d3-visualization/) -- SVG feGaussianBlur glow technique
- [Observable - Stacked to Grouped](https://observablehq.com/@d3/stacked-to-grouped-bars) -- Animated bar layout transition

### Tertiary (LOW confidence)
- None -- all findings verified with at least one authoritative source

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all dependencies verified in package.json and node_modules; d3-sankey gap identified and confirmed
- Architecture: HIGH - patterns derived from existing Phase 1 code (chart-utils, chart-theme, chart-tooltip) and established D3-in-React patterns
- Pitfalls: HIGH - D3 pitfalls (force cleanup, angle math, filter IDs) well-documented in official D3 docs and verified community patterns
- Data gaps: HIGH - confirmed by reading dashboard-data.ts source; three missing data functions clearly identified

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (30 days - stable D3 v7 ecosystem, no breaking changes expected)
