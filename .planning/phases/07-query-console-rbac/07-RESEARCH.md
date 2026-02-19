# Phase 7: Query Console & RBAC - Research

**Researched:** 2026-02-19
**Domain:** Code editor (CodeMirror 6), D3.js visualizations (5 chart types), RBAC/PII masking UI
**Confidence:** HIGH

## Summary

Phase 7 is the "killer demo feature" of the platform. It combines three distinct domains: (1) a code editor for GraphQL/DQL queries using CodeMirror 6, (2) six result view types including five D3.js visualizations and a table view, and (3) an interactive PII masking simulator driven by role-based access control. The PII masking infrastructure (functions, configs, demo data) was already built in Phase 1, so this phase focuses on the UI layer that drives those functions.

CodeMirror 6 is the only new npm dependency. Use `@uiw/react-codemirror` (v4.x) as the React wrapper -- it provides a controlled component API with props for value, onChange, theme, extensions, and height. GraphQL syntax highlighting uses `cm6-graphql`. DQL (Dgraph Query Language) has no official CodeMirror mode, so use the JSON/plaintext mode as a fallback with bracket matching (DQL's syntax resembles structured JSON with curly braces and directives).

The five D3 visualizations follow the same pattern already established in the codebase: useRef + useEffect + ResizeObserver, using `cleanupD3Svg`, `getChartColors`, and `createTooltip` from the shared chart utilities. Each visualization operates on hardcoded data from `query-data.ts` or transforms from existing data files.

**Primary recommendation:** Split implementation into 3 plans: (1) CodeMirror editor + template/history + multi-tab infrastructure, (2) 5 D3 chart visualizations + table view, (3) PII masking demo UI with role selector and styled tables.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- CodeMirror 6 for query editor (lightweight, syntax highlighting, line numbers, theme integration)
- GraphQL / DQL mode toggle (upper UI area)
- Dark/light theme integration
- Template selector: dropdown with 4 query templates, auto-insert into editor
- Icon tab bar for 6 result view types (Table / Graph / Treemap / Arc Diagram / Scatter / Distribution)
- Default view: Table
- Multi-tab: max 5 result tabs, each with execution time badge
- FAB Equipment | General PII tab switch
- Role Selector: above tabs, dropdown with 4 roles
- Info Banner: selected role's permission summary message
- Real-time masking toggle on role change
- Masked cells: amber(masked)/red(anonymized/denied) background + icon
- Column headers: PII level badges (highest/high/medium/low/none)
- FAB Equipment: 8 rows of data
- General PII: 5 rows of data

### Claude's Discretion
- CodeMirror 6 specific extension choices (basicSetup, language modes, etc.)
- Editor height and resize capability
- Icon tab bar icon selection and styling
- Multi-tab UI design (close button, overflow behavior)
- PII table column widths and cell styling details
- Query history UI (Supabase API based)
- Specific interactions for each D3 visualization (Graph/Treemap/Arc/Scatter/Distribution)

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| QURY-01 | Query editor with line numbers, GraphQL/DQL mode toggle | CodeMirror 6 via @uiw/react-codemirror; basicSetup includes line numbers; cm6-graphql for GraphQL mode; JSON/plain for DQL |
| QURY-02 | Template selector + saved query list | shadcn Select component; getQueryTemplates() from query-data.ts provides 5 templates |
| QURY-03 | Query history (Supabase API based) | getQueryHistory() provides 10 mock items; shadcn ScrollArea + Table for list; Sheet/Dialog for history panel |
| QURY-04 | Multi-tab results (max 5 tabs, execution time badges) | shadcn Tabs + Badge; React state array for tab management; close button on tabs |
| QURY-05 | D3 Force Graph (Bipartite equipment-location) | d3-force: forceSimulation + forceLink + forceManyBody + forceX/forceY for bipartite layout; chart-utils shared patterns |
| QURY-06 | D3 Treemap (equipment type groups) | d3-hierarchy: d3.treemap() + d3.hierarchy().sum().sort(); color by equipment type |
| QURY-07 | D3 Arc Diagram (Equipment -> Bay connections) | d3-shape: d3.arc() or manual SVG path arcs; nodes on horizontal axis, curved link paths |
| QURY-08 | D3 Query Scatter (Location x Complexity, Brush) | d3-brush: d3.brushX/brushY/brush for 2D selection; d3-scale for axes; highlight selected points |
| QURY-09 | D3 Query Distribution (Location x Type, Stacked/Grouped) | d3-shape: d3.stack(); d3-scale: scaleBand + scaleLinear; toggle between stacked/grouped with transitions |
| QURY-10 | Table View (result table) | shadcn Table component; existing pattern from codebase |
| RBAC-01 | 4 role definitions | Already defined in types/index.ts: Role type with super_admin/service_app/data_analyst/auditor |
| RBAC-02 | PII masking functions | Already built in lib/pii-masking.ts: maskName, maskPhone, maskEmail, maskId, maskAddress, anonymize, deny |
| RBAC-03 | Role-based field masking rules | Already built in data/pii-config.ts: fabPiiFieldConfigs, generalPiiFieldConfigs, applyPiiMasking() |
| RBAC-04 | Role Selector dropdown in Query Console | shadcn Select with 4 role options; React state drives masking recalculation |
| RBAC-05 | PII demo tabs (FAB Equipment 8 rows + General PII 5 rows) | getPiiDemoData() from query-data.ts provides both datasets; shadcn Tabs for switching |
| RBAC-06 | PII table with masking cell styling (amber/red backgrounds + icons) | Tailwind bg-amber-500/10 and bg-red-500/10 for cell backgrounds; lucide-react icons (EyeOff, ShieldX, Lock) |
| RBAC-07 | Column header PII level badges | shadcn Badge with variant styling per PII level; fabPiiFieldConfigs/generalPiiFieldConfigs provide level data |
| RBAC-08 | Role-specific Info Banner | Conditional banner messages per role; Tailwind styled alert/info box |
</phase_requirements>

## Standard Stack

### Core (NEW for Phase 7)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @uiw/react-codemirror | ^4.23 | React wrapper for CodeMirror 6 | Most popular CM6 React binding (2.5M weekly downloads); controlled component API |
| cm6-graphql | ^0.7 | GraphQL syntax highlighting for CM6 | Standalone CM6 GraphQL mode with highlighting + bracket matching |
| @codemirror/theme-one-dark | ^6.1 | Dark theme for CodeMirror | Official CM6 dark theme; pairs with light default |
| @codemirror/lang-json | ^6.0 | JSON language mode | Fallback for DQL mode (DQL syntax resembles JSON with curly braces) |

### Already Installed (from Phase 1)
| Library | Version | Purpose |
|---------|---------|---------|
| d3 | ^7.9.0 | All D3 visualizations (force, treemap, arc, scatter, distribution) |
| @types/d3 | ^7.4.3 | TypeScript definitions |
| lucide-react | ^0.574.0 | Icons for view tabs, PII status indicators |
| shadcn/ui components | installed | Tabs, Select, Badge, Table, Button, ScrollArea, Card |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @uiw/react-codemirror | Raw CodeMirror 6 (useEffect + EditorView) | More control but significantly more boilerplate; wrapper handles React lifecycle |
| cm6-graphql | codemirror-graphql (official) | Official package requires graphql-js as peer dep (heavy); cm6-graphql is lighter standalone |
| @codemirror/lang-json for DQL | Custom Lezer grammar | Building a DQL grammar is overkill for a POC demo; JSON gives adequate bracket matching and structure |

**Installation:**
```bash
npm install @uiw/react-codemirror cm6-graphql @codemirror/theme-one-dark @codemirror/lang-json
```

## Architecture Patterns

### Recommended Component Structure
```
src/
├── app/workspace/query/
│   └── page.tsx                    # Query Console page (server component shell)
├── components/query/
│   ├── QueryConsole.tsx            # Main client component (editor + results + PII)
│   ├── QueryEditor.tsx             # CodeMirror 6 editor wrapper
│   ├── QueryModeToggle.tsx         # GraphQL/DQL mode switch
│   ├── TemplateSelector.tsx        # Template dropdown + auto-insert
│   ├── QueryHistory.tsx            # History list (Sheet or collapsible panel)
│   ├── ResultTabs.tsx              # Multi-tab container (max 5)
│   ├── ResultViewBar.tsx           # Icon tab bar for 6 view types
│   ├── views/
│   │   ├── TableView.tsx           # QURY-10: shadcn Table result view
│   │   ├── ForceGraphView.tsx      # QURY-05: D3 bipartite force graph
│   │   ├── TreemapView.tsx         # QURY-06: D3 treemap
│   │   ├── ArcDiagramView.tsx      # QURY-07: D3 arc diagram
│   │   ├── ScatterView.tsx         # QURY-08: D3 scatter with brush
│   │   └── DistributionView.tsx    # QURY-09: D3 stacked/grouped bars
│   └── pii/
│       ├── PiiDemo.tsx             # PII masking demo container
│       ├── RoleSelector.tsx        # RBAC-04: Role dropdown
│       ├── RoleInfoBanner.tsx      # RBAC-08: Info banner per role
│       └── PiiTable.tsx            # RBAC-06/07: Styled PII masking table
```

### Pattern 1: CodeMirror 6 React Integration
**What:** Use @uiw/react-codemirror as a controlled React component
**When to use:** For the query editor (QURY-01)
**Example:**
```typescript
// Source: @uiw/react-codemirror documentation
import CodeMirror from "@uiw/react-codemirror";
import { graphql } from "cm6-graphql";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { useTheme } from "next-themes";

interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
  mode: "graphql" | "dql";
}

export function QueryEditor({ value, onChange, mode }: QueryEditorProps) {
  const { resolvedTheme } = useTheme();

  const extensions = mode === "graphql" ? [graphql()] : [json()];

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      height="300px"
      theme={resolvedTheme === "dark" ? oneDark : "light"}
      extensions={extensions}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        bracketMatching: true,
        autocompletion: false, // No schema for POC
      }}
    />
  );
}
```

### Pattern 2: Multi-Tab Result Management
**What:** State-managed tab array with max 5 limit
**When to use:** For result tabs (QURY-04)
**Example:**
```typescript
interface ResultTab {
  id: string;
  label: string;
  executionTime: number; // ms
  resultCount: number;
  queryText: string;
  queryType: "graphql" | "dql";
  timestamp: Date;
}

// Tab state management
const [tabs, setTabs] = useState<ResultTab[]>([]);
const [activeTabId, setActiveTabId] = useState<string | null>(null);

function addResultTab(result: ResultTab) {
  setTabs((prev) => {
    const next = [...prev, result];
    // Remove oldest if exceeding max 5
    if (next.length > 5) next.shift();
    return next;
  });
  setActiveTabId(result.id);
}

function closeTab(id: string) {
  setTabs((prev) => prev.filter((t) => t.id !== id));
  // Switch to last tab or null
  setActiveTabId((prev) =>
    prev === id ? tabs[tabs.length - 2]?.id ?? null : prev
  );
}
```

### Pattern 3: D3 Chart in React (established project pattern)
**What:** useRef + useEffect + ResizeObserver with cleanup
**When to use:** All 5 D3 visualizations (QURY-05 through QURY-09)
**Example:**
```typescript
// Follows established pattern from chart-utils.ts
import { useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { cleanupD3Svg, createDebouncedResizeObserver } from "@/components/charts/shared/chart-utils";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";

export function ForceGraphView({ data }: { data: EquipmentNode[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const colors = getChartColors();
    const tooltip = createTooltip();

    function render(width: number, height: number) {
      cleanupD3Svg(container);
      // ... D3 rendering logic with forceSimulation
    }

    const { width, height } = container.getBoundingClientRect();
    render(width, height);

    const observer = createDebouncedResizeObserver((w, h) => render(w, h));
    observer.observe(container);

    return () => {
      observer.disconnect();
      tooltip.destroy();
      cleanupD3Svg(container);
    };
  }, [data, resolvedTheme]);

  return <div ref={containerRef} className="w-full h-full min-h-[400px]" />;
}
```

### Pattern 4: PII Masking Integration
**What:** Apply existing masking functions based on selected role
**When to use:** PII demo tables (RBAC-05/06)
**Example:**
```typescript
import { applyPiiMasking, type PiiAction } from "@/data/pii-config";
import { fabPiiFieldConfigs, generalPiiFieldConfigs } from "@/data/pii-config";
import type { Role } from "@/types";

// For each cell in the PII table:
function renderMaskedCell(
  value: string,
  field: string,
  action: PiiAction
) {
  const maskedValue = applyPiiMasking(value, field, action);
  const bgClass =
    action === "masked"
      ? "bg-amber-500/10"
      : action === "anonymized" || action === "denied"
        ? "bg-red-500/10"
        : "";

  return { maskedValue, bgClass, action };
}

// Get action for a field given a role:
function getFieldAction(field: string, role: Role, configs: PiiFieldRule[]): PiiAction {
  const config = configs.find((c) => c.field === field);
  return config?.actions[role] ?? "plain";
}
```

### Anti-Patterns to Avoid
- **Creating CodeMirror instances in useEffect manually:** Use @uiw/react-codemirror instead; it handles lifecycle, state sync, and cleanup
- **Rebuilding PII masking logic:** Everything is already in `pii-masking.ts` and `pii-config.ts`; call `applyPiiMasking()` directly
- **Using D3 for the Table view:** Use shadcn Table (HTML table); D3 is only for the 5 chart visualizations
- **Fetching real Supabase data for query execution:** This is a POC demo; "executing" a query means simulating results from hardcoded data with a short delay
- **Putting all query console logic in one massive component:** Split into editor, results, and PII sections as separate components

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Code editor | Custom textarea with highlighting | @uiw/react-codemirror | Line numbers, syntax highlighting, themes, bracket matching are complex |
| GraphQL highlighting | Custom regex tokenizer | cm6-graphql | GraphQL grammar has nested types, directives, fragments |
| Dark/light theme switching in editor | Manual CSS variable injection | @codemirror/theme-one-dark + "light" built-in | Official themes handle all CM6 token types |
| Force graph physics | Manual position calculations | d3-force (forceSimulation) | Velocity Verlet integration, collision detection, stabilization |
| Treemap layout | Manual rectangle packing | d3-hierarchy (d3.treemap) | Squarified algorithm for optimal aspect ratios |
| Brush selection | Custom mouse event tracking | d3-brush | Handles resize handles, keyboard modifiers, touch events |
| PII masking | New masking functions | Existing pii-masking.ts + pii-config.ts | Already built and tested in Phase 1 |

**Key insight:** This phase has the most npm dependencies to add (4 CodeMirror packages), but every other capability is already available in the codebase. The D3 chart patterns, PII masking infrastructure, and UI components are all established.

## Common Pitfalls

### Pitfall 1: CodeMirror SSR Crash
**What goes wrong:** CodeMirror accesses `document` and `window` during initialization, causing Next.js SSR to crash
**Why it happens:** @uiw/react-codemirror renders on the server by default in Next.js App Router
**How to avoid:** Mark the editor component with `"use client"` and use dynamic import with `ssr: false` if needed, or wrap in a client boundary
**Warning signs:** "document is not defined" error during build or dev

### Pitfall 2: CodeMirror Theme Not Syncing with App Theme
**What goes wrong:** Editor stays in light/dark mode while the rest of the app toggles
**Why it happens:** The CM6 theme prop is set once on mount but doesn't react to next-themes changes
**How to avoid:** Pass `resolvedTheme` from `useTheme()` as a dependency; use `theme` prop reactively (re-render triggers theme change in @uiw/react-codemirror)
**Warning signs:** Editor appears white in dark mode or vice versa

### Pitfall 3: D3 Force Simulation Never Stabilizes
**What goes wrong:** Nodes keep moving indefinitely, high CPU usage
**Why it happens:** Too many or conflicting forces; alphaDecay too low; not enough alphaMin
**How to avoid:** Use reasonable defaults: `forceSimulation(nodes).alphaDecay(0.02).alphaMin(0.001)`; for bipartite layout, use `forceX` to position equipment on left and locations on right
**Warning signs:** CPU stays high, nodes oscillate without settling

### Pitfall 4: Multi-Tab State Gets Out of Sync
**What goes wrong:** Closing a tab leaves stale active tab reference; adding 6th tab causes render errors
**Why it happens:** Tab ID management not accounting for edge cases
**How to avoid:** Always validate activeTabId exists in tabs array after mutations; enforce max 5 with FIFO eviction
**Warning signs:** Blank result area after closing tab, React key errors

### Pitfall 5: PII Table Re-renders Entire Grid on Role Change
**What goes wrong:** Noticeable flicker when switching roles
**Why it happens:** Every cell value changes, causing full table DOM replacement
**How to avoid:** Use `useMemo` to compute masked data per role; apply CSS transitions on background color changes for smooth visual transitions
**Warning signs:** Table flickers or blinks on role dropdown change

### Pitfall 6: D3 Brush Interferes with SVG Pan/Zoom
**What goes wrong:** Brush selection and zoom/pan gestures conflict
**Why it happens:** Both d3-brush and d3-zoom listen to the same mouse/touch events
**How to avoid:** For the scatter view (QURY-08), use brush only (no zoom); or use keyboard modifier (e.g., hold Shift to brush)
**Warning signs:** Dragging to select points also zooms/pans the chart

### Pitfall 7: Arc Diagram Labels Overlap
**What goes wrong:** Node labels on the horizontal axis become unreadable
**Why it happens:** Too many nodes placed along a single axis
**How to avoid:** Use angled labels (45 degrees), or show labels only on hover via tooltip; limit to the ~8 equipment items + ~5 locations for a clean demo
**Warning signs:** Text overlapping in a horizontal line

## Code Examples

### CodeMirror 6 Editor with Mode Toggle
```typescript
// Source: @uiw/react-codemirror docs + cm6-graphql
"use client";

import { useState, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { graphql } from "cm6-graphql";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { useTheme } from "next-themes";
import type { QueryType } from "@/types";

interface Props {
  value: string;
  onChange: (value: string) => void;
  mode: QueryType;
}

export function QueryEditor({ value, onChange, mode }: Props) {
  const { resolvedTheme } = useTheme();

  const extensions = useMemo(
    () => (mode === "graphql" ? [graphql()] : [json()]),
    [mode]
  );

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      height="280px"
      theme={resolvedTheme === "dark" ? oneDark : "light"}
      extensions={extensions}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        bracketMatching: true,
        highlightActiveLine: true,
        autocompletion: false,
      }}
      className="border rounded-md overflow-hidden"
    />
  );
}
```

### D3 Bipartite Force Graph (QURY-05)
```typescript
// Source: d3-force documentation + project patterns
import * as d3 from "d3";

interface BipartiteNode extends d3.SimulationNodeDatum {
  id: string;
  type: "equipment" | "location";
  label: string;
}

interface BipartiteLink extends d3.SimulationLinkDatum<BipartiteNode> {
  source: string;
  target: string;
}

function renderBipartiteForce(
  container: HTMLElement,
  nodes: BipartiteNode[],
  links: BipartiteLink[],
  width: number,
  height: number,
  colors: ChartColors
) {
  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink<BipartiteNode, BipartiteLink>(links)
      .id((d) => d.id)
      .distance(120))
    .force("charge", d3.forceManyBody().strength(-200))
    // Bipartite: push equipment left, locations right
    .force("x", d3.forceX<BipartiteNode>((d) =>
      d.type === "equipment" ? width * 0.3 : width * 0.7
    ).strength(0.3))
    .force("y", d3.forceY(height / 2).strength(0.1))
    .alphaDecay(0.02);

  // ... render links as paths, nodes as circles with labels
}
```

### D3 Treemap (QURY-06)
```typescript
// Source: d3-hierarchy documentation
import * as d3 from "d3";

interface TreemapData {
  name: string;
  children: { name: string; value: number; type: string }[];
}

function renderTreemap(
  container: HTMLElement,
  data: TreemapData,
  width: number,
  height: number,
  colors: ChartColors
) {
  const root = d3.hierarchy(data)
    .sum((d: any) => d.value)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  d3.treemap<typeof data>()
    .size([width, height])
    .padding(2)
    .round(true)(root);

  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const colorScale = d3.scaleOrdinal<string>()
    .domain(["CVD", "Etcher", "Furnace", "CMP"])
    .range([colors.chart1, colors.chart2, colors.chart3, colors.chart4]);

  // Render leaves as rectangles with labels
  const leaves = svg.selectAll("g")
    .data(root.leaves())
    .join("g")
    .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

  leaves.append("rect")
    .attr("width", (d: any) => d.x1 - d.x0)
    .attr("height", (d: any) => d.y1 - d.y0)
    .attr("fill", (d: any) => colorScale(d.data.type))
    .attr("rx", 2);
}
```

### D3 Arc Diagram (QURY-07)
```typescript
// Source: D3 Graph Gallery arc diagram pattern
function renderArcDiagram(
  container: HTMLElement,
  nodes: { id: string; label: string }[],
  links: { source: string; target: string }[],
  width: number,
  height: number,
  colors: ChartColors
) {
  const margin = { top: 20, right: 20, bottom: 60, left: 20 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Position nodes along x-axis
  const xScale = d3.scalePoint<string>()
    .domain(nodes.map((n) => n.id))
    .range([0, innerWidth]);

  const yBase = innerHeight; // nodes at bottom

  // Draw arcs as curved paths
  svg.selectAll("path")
    .data(links)
    .join("path")
    .attr("d", (d) => {
      const x1 = xScale(d.source) ?? 0;
      const x2 = xScale(d.target) ?? 0;
      const arcHeight = Math.abs(x2 - x1) * 0.5;
      return `M${x1},${yBase} A${Math.abs(x2 - x1) / 2},${arcHeight} 0 0,${x1 < x2 ? 1 : 0} ${x2},${yBase}`;
    })
    .attr("fill", "none")
    .attr("stroke", colors.chart1)
    .attr("stroke-width", 1.5)
    .attr("opacity", 0.5);
}
```

### D3 Scatter with Brush Selection (QURY-08)
```typescript
// Source: d3-brush documentation
function renderBrushableScatter(
  container: HTMLElement,
  data: { x: number; y: number; label: string }[],
  width: number,
  height: number,
  colors: ChartColors
) {
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };

  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, (d) => d.x) as [number, number])
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, (d) => d.y) as [number, number])
    .range([height - margin.bottom, margin.top]);

  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const dots = svg.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", (d) => xScale(d.x))
    .attr("cy", (d) => yScale(d.y))
    .attr("r", 5)
    .attr("fill", colors.chart1)
    .attr("opacity", 0.7);

  // Brush for 2D selection
  const brush = d3.brush()
    .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
    .on("brush end", (event) => {
      if (!event.selection) {
        dots.attr("opacity", 0.7).attr("fill", colors.chart1);
        return;
      }
      const [[x0, y0], [x1, y1]] = event.selection;
      dots
        .attr("opacity", (d) => {
          const cx = xScale(d.x);
          const cy = yScale(d.y);
          return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1 ? 1 : 0.15;
        })
        .attr("fill", (d) => {
          const cx = xScale(d.x);
          const cy = yScale(d.y);
          return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1
            ? colors.chart2
            : colors.chart1;
        });
    });

  svg.append("g").call(brush);
}
```

### D3 Stacked/Grouped Distribution (QURY-09)
```typescript
// Source: d3-shape stack documentation + d3-graph-gallery patterns
function renderDistribution(
  container: HTMLElement,
  data: { location: string; [type: string]: string | number }[],
  keys: string[],
  width: number,
  height: number,
  colors: ChartColors,
  mode: "stacked" | "grouped"
) {
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };

  const xScale = d3.scaleBand()
    .domain(data.map((d) => d.location as string))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const colorScale = d3.scaleOrdinal<string>()
    .domain(keys)
    .range([colors.chart1, colors.chart2, colors.chart3, colors.chart4]);

  if (mode === "stacked") {
    const stackGen = d3.stack<typeof data[0]>().keys(keys);
    const stacked = stackGen(data);
    const yMax = d3.max(stacked, (s) => d3.max(s, (d) => d[1])) ?? 0;
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([height - margin.bottom, margin.top]);
    // render stacked rectangles...
  } else {
    // Grouped: sub-band scale
    const xSub = d3.scaleBand()
      .domain(keys)
      .range([0, xScale.bandwidth()])
      .padding(0.05);
    // render grouped rectangles side by side...
  }
}
```

### PII Table with Masking Visualization
```typescript
// Source: Existing pii-config.ts API + shadcn Table
import { EyeOff, ShieldAlert, Lock } from "lucide-react";

function getMaskIcon(action: PiiAction) {
  switch (action) {
    case "masked": return <EyeOff className="h-3 w-3 text-amber-500" />;
    case "anonymized": return <ShieldAlert className="h-3 w-3 text-red-500" />;
    case "denied": return <Lock className="h-3 w-3 text-red-500" />;
    default: return null;
  }
}

function getCellBg(action: PiiAction): string {
  switch (action) {
    case "masked": return "bg-amber-500/10";
    case "anonymized": return "bg-red-500/10";
    case "denied": return "bg-red-500/10";
    default: return "";
  }
}

function getPiiLevelBadgeVariant(level: PiiLevel): string {
  switch (level) {
    case "highest": return "destructive";
    case "high": return "destructive";
    case "medium": return "default";
    case "low": return "secondary";
    case "none": return "outline";
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CodeMirror 5 (monolithic) | CodeMirror 6 (modular extensions) | 2022-06 (v6 stable) | Tree-shakeable; only import what you need |
| Ace Editor / Monaco | @uiw/react-codemirror | 2023+ | CM6 is lighter than Monaco (~200KB vs ~2MB), better for embedded editors |
| codemirror-graphql (legacy) | cm6-graphql (standalone) | 2024 | Dedicated CM6 package without graphql-js peer dependency |
| D3 v5 force API | D3 v7 force API | 2021 (v7 release) | ES modules, no API changes for force/hierarchy |

**Deprecated/outdated:**
- `@codemirror/basic-setup` package is deprecated; use `basicSetup` from `codemirror` or the `basicSetup` prop in @uiw/react-codemirror
- The old `codemirror-graphql` package for CM5 should not be used; use `cm6-graphql` for CM6

## Open Questions

1. **DQL Syntax Highlighting Quality**
   - What we know: No official CodeMirror 6 mode exists for Dgraph DQL. JSON mode provides bracket matching and basic structure highlighting.
   - What's unclear: Whether the JSON mode adequately highlights DQL-specific constructs (func:, @filter, orderdesc:, etc.)
   - Recommendation: Use JSON mode as fallback; it provides 80% of the value. If insufficient, a simple StreamLanguage-based tokenizer can be added later (low priority for POC).

2. **Query "Execution" Simulation Timing**
   - What we know: This is a POC with hardcoded data. There is no real Dgraph backend.
   - What's unclear: How to make query execution feel realistic (random delay? fixed delay?)
   - Recommendation: Use a `setTimeout` with a random delay of 200-800ms, then populate the result tab with mock data from `query-data.ts`. Show a loading spinner during the delay.

3. **D3 Visualization Data Sources for Result Views**
   - What we know: `query-data.ts` has templates and PII demo data. Equipment/location data for graphs comes from existing data files.
   - What's unclear: Whether each D3 view needs its own dedicated dataset or can transform existing data.
   - Recommendation: Generate visualization-specific data within `query-data.ts` (e.g., a `getQueryResultData()` function that returns equipment-location pairs, type groupings, etc.). All views show the same "query result" from different angles.

4. **Supabase Query History Integration**
   - What we know: QURY-03 specifies "Supabase API based" query history. The app already has Supabase client setup.
   - What's unclear: Whether to actually persist to Supabase or use the mock `getQueryHistory()` function.
   - Recommendation: Use `getQueryHistory()` mock data for the demo. Optionally add Supabase write on query "execution" if time permits, but it should not block the demo.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/lib/pii-masking.ts`, `src/data/pii-config.ts`, `src/data/query-data.ts` - Existing PII infrastructure and query data
- Codebase analysis: `src/components/charts/shared/chart-utils.ts`, `chart-theme.ts`, `chart-tooltip.ts` - Established D3 patterns
- Codebase analysis: `src/types/index.ts` - Role, PiiLevel, QueryType type definitions
- [D3 Force Documentation](https://d3js.org/d3-force) - Force simulation API
- [D3 Hierarchy Documentation](https://d3js.org/d3-hierarchy) - Treemap layout API
- [D3 Brush Documentation](https://d3js.org/d3-brush) - Brush selection API
- [D3 Shape Stack Documentation](https://d3js.org/d3-shape/stack) - Stacked bar layout

### Secondary (MEDIUM confidence)
- [GitHub: @uiw/react-codemirror](https://github.com/uiwjs/react-codemirror) - React CodeMirror wrapper, v4.23+
- [npm: cm6-graphql](https://www.npmjs.com/package/cm6-graphql) - GraphQL language mode for CM6
- [npm: @codemirror/theme-one-dark](https://www.npmjs.com/package/@codemirror/theme-one-dark) - Official dark theme
- [D3 Graph Gallery: Arc Diagram](https://d3-graph-gallery.com/arc.html) - Arc diagram patterns
- [React Graph Gallery: Treemap](https://www.react-graph-gallery.com/treemap) - React + D3 treemap pattern
- [Observable: Stacked-to-Grouped Bars](https://observablehq.com/@d3/stacked-to-grouped-bars) - Toggle animation pattern

### Tertiary (LOW confidence)
- DQL as JSON mode fallback: Based on structural similarity analysis; no official source confirms this as best approach

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - @uiw/react-codemirror is well-documented with 2.5M+ weekly downloads; D3 v7 already proven in codebase
- Architecture: HIGH - Component structure follows established patterns from prior phases; PII infrastructure is already built
- Pitfalls: HIGH - CodeMirror SSR issues are well-documented; D3 force stabilization is a known challenge
- D3 visualizations: MEDIUM - Specific implementation details (bipartite layout, arc path generation) derived from documentation patterns, not verified in this exact context
- DQL mode: LOW - No official CM6 mode exists; JSON fallback is a pragmatic choice but unverified for DQL-specific syntax

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (stable domain; CodeMirror 6 and D3 v7 are mature)
