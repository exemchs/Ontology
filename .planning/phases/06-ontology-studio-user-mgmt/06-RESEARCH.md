# Phase 6: Ontology Studio & User Management - Research

**Researched:** 2026-02-19
**Domain:** D3.js force/radial/tree graph layouts, ontology schema visualization, stacked/grouped bar charts, Supabase user data fetching, role badge system, global role state management
**Confidence:** HIGH (verified against existing codebase + D3 official docs + community patterns)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 2-panel layout: left panel (type list + detail) | right panel (graph + distribution chart)
- Left:right ratio approximately 35:65 so graph has wider space
- 3 graph modes via toggle: Force / Radial / Hierarchy (Tree), Force is default
- Force mode: drag, zoom/pan, bidirectional edges
- Radial mode: BFS-based ring placement
- Hierarchy mode: d3.tree() layout
- Edge filter: All (default) / Outbound / Inbound
- User Management: read + role change via dropdown selector
- User table columns: username, email, role badge (color-coded), last login
- Role badge hover shows Tooltip with PII access permission summary
- 4 roles: super_admin / service_app / data_analyst / auditor
- Role change is client-state only (no DB persist, POC)
- Role state shared with Query Console PII masking

### Claude's Discretion
- Type list selection UI style (highlight, icons, etc.)
- Detail panel Predicates/Relations/Statistics tab or section design
- Type edit dialog implementation approach
- Graph node/edge visualization details (size, color, label)
- Type distribution bar chart Stacked/Grouped toggle style
- User table sort/filter feature scope
- Whether role change needs a confirmation dialog

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STUD-01 | Type list (6: Equipment/Process/Wafer/Recipe/Defect/MaintenanceRecord) | Data layer: `studio-data.ts` provides `getOntologyTypes()` with all 6 types. Architecture Patterns: left panel list with selection state |
| STUD-02 | Type detail panel (Predicates, Relations, Statistics) | Data layer: `OntologyType` has predicates[], relations[], nodeCount. Architecture Patterns: tabbed/sectioned detail panel |
| STUD-03 | D3 ontology graph (Force/Radial/Hierarchy 3-mode, bidirectional edges, zoom/pan) | Code Examples: D3 force simulation, d3.tree() radial projection, zoom behavior, edge rendering with SVG markers |
| STUD-04 | D3 type distribution bar chart (Records/Queries, Stacked/Grouped toggle) | Code Examples: stacked-to-grouped transition pattern, `getTypeDistribution()` data source |
| STUD-05 | Type edit dialog + edge filter (all/outbound/inbound) | Architecture Patterns: shadcn Dialog component, filter state management, relation filtering logic |
| USER-01 | User table (username, email, role badge, last login -- Supabase API) | Code Examples: Supabase `from("users").select()` pattern, shadcn Table component |
| USER-02 | 4 role badges (color-coded: red/blue/gray/outline) | Architecture Patterns: shadcn Badge with CVA custom variants for each role |
| USER-03 | Role description Tooltip (PII access permission summary) | Architecture Patterns: shadcn Tooltip, role permission mapping from PII config |
</phase_requirements>

---

## Summary

Phase 6 builds two distinct pages: (1) Ontology Studio -- a 2-panel schema explorer with an interactive D3 graph supporting three layout modes and a type distribution bar chart, and (2) User Management -- a table of system users fetched from Supabase with role badges and client-side role switching.

The **highest-complexity component** is the ontology graph (STUD-03) which must support three layout modes (Force, Radial, Hierarchy) with smooth transitions, bidirectional edge rendering, zoom/pan, and edge filtering. This is architecturally similar to Phase 4's DGraph cluster topology (DGRP-01) but with fewer nodes (6 types vs 12 nodes) and an additional Hierarchy mode. The key challenge is maintaining a single SVG container that can transition between three fundamentally different layout algorithms while preserving zoom state.

The **data layer is already complete**: `studio-data.ts` provides `getOntologyTypes()` (6 types with predicates, relations, nodeCount) and `getTypeDistribution()` (records + queries per type with chart colors). The Supabase `users` table has 5 seed users with username, email, role, last_login. The `User` type and `Role` type are already defined in `types/index.ts`. All D3 chart infrastructure (chart-utils, chart-theme, chart-tooltip, ChartSkeleton, ChartEmpty) exists from Phase 1.

**Primary recommendation:** Build the ontology graph as a single `OntologyGraph` component with an internal layout engine that computes node positions based on the active mode, then renders all nodes/edges in a shared SVG with D3 zoom. Use React Context at the app root level for the global role state that connects User Management role changes to Query Console PII masking.

---

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Verified |
|---------|---------|---------|----------|
| D3.js | ^7.9.0 | Force simulation, tree layout, zoom, scales, shapes | `package.json` |
| @types/d3 | ^7.4.3 | TypeScript definitions | `package.json` |
| @supabase/supabase-js | ^2.95.3 | User data fetching | `package.json` |
| @supabase/ssr | ^0.8.0 | SSR-compatible Supabase client | `package.json` |
| lucide-react | ^0.574.0 | Icons for type list, badges, etc. | `package.json` |
| radix-ui | ^1.4.3 | Headless UI primitives (via shadcn) | `package.json` |

### shadcn/ui Components (Already Installed)

| Component | Purpose in This Phase |
|-----------|----------------------|
| Table | User management table (USER-01) |
| Badge | Role badges (USER-02), type count badges |
| Tooltip | Role description tooltip (USER-03) |
| Dialog | Type edit dialog (STUD-05) |
| Select | Role change dropdown (USER-01), edge filter, graph mode selector |
| Card | Panel containers for studio layout |
| Tabs | Detail panel Predicates/Relations/Statistics sections |
| Skeleton | Loading states for Supabase data fetching |

### D3 Sub-modules Used

| Module | Import | Purpose |
|--------|--------|---------|
| d3-force | `forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide` | Force layout mode |
| d3-hierarchy | `hierarchy, tree` | Hierarchy + Radial layout modes |
| d3-zoom | `zoom, zoomIdentity` | Pan/zoom on all modes |
| d3-selection | `select, selectAll` | DOM manipulation |
| d3-scale | `scaleBand, scaleLinear, scaleOrdinal` | Bar chart axes and colors |
| d3-shape | `linkHorizontal, linkRadial` | Edge path generation |
| d3-transition | `transition` | Animated mode transitions |
| d3-drag | `drag` | Node dragging in force mode |
| d3-array | `max, stack` | Bar chart stacking |

### No New Dependencies Required

Everything needed for Phase 6 is already installed. No `npm install` needed.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
  app/
    workspace/
      studio/
        page.tsx                    # Ontology Studio page
    admin/
      users/
        page.tsx                    # User Management page
  components/
    studio/
      StudioPage.tsx                # 2-panel layout orchestrator
      TypeList.tsx                  # Left panel top: 6 type cards
      TypeDetail.tsx                # Left panel bottom: tabs for predicates/relations/stats
      TypeEditDialog.tsx            # Edit dialog (STUD-05)
    charts/
      studio/
        OntologyGraph.tsx           # D3 graph with 3 modes (STUD-03)
        TypeDistributionChart.tsx   # D3 bar chart (STUD-04)
    users/
      UsersPage.tsx                 # User management orchestrator
      UserTable.tsx                 # Supabase-powered table (USER-01)
      RoleBadge.tsx                 # Color-coded badge (USER-02)
      RoleTooltip.tsx               # PII permission tooltip (USER-03)
  contexts/
    RoleContext.tsx                  # Global role state (shared with Query Console)
```

### Pattern 1: D3 Force Graph with Multi-Mode Layout Engine

**What:** A single D3 SVG container that renders the ontology graph in three different layout modes (Force, Radial, Hierarchy) using a layout computation layer that translates between modes.

**When to use:** When the same graph data needs to be viewed in different spatial arrangements.

**Architecture:**

```typescript
// Layout mode type
type GraphMode = "force" | "radial" | "hierarchy";
type EdgeFilter = "all" | "outbound" | "inbound";

interface GraphNode {
  id: string;
  name: string;
  nodeCount: number;
  // D3 force adds: x, y, vx, vy
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  name: string;
  direction: "outbound" | "inbound";
}
```

**Mode Transition Strategy:**
1. When mode changes, compute target positions for all nodes
2. Use D3 transition to animate from current positions to target positions
3. For Force mode: start `forceSimulation` after transition
4. For Radial/Hierarchy: use `d3.tree()` with different size parameters
5. Stop simulation when leaving Force mode

```typescript
// Force mode setup
const simulation = forceSimulation<GraphNode>(nodes)
  .force("link", forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(120))
  .force("charge", forceManyBody().strength(-400))
  .force("center", forceCenter(width / 2, height / 2))
  .force("collide", forceCollide(40));

// Radial mode: use tree with radial projection
// tree.size([2 * Math.PI, radius]) then project with:
// x = d.y * Math.cos(d.x - Math.PI / 2)
// y = d.y * Math.sin(d.x - Math.PI / 2)

// Hierarchy mode: use tree with cartesian layout
// tree.size([width - margin, height - margin])
```

### Pattern 2: D3 Zoom Integration with React Refs

**What:** Apply D3 zoom behavior to an SVG element via React ref, transforming a child `<g>` group.

**When to use:** Any zoomable/pannable D3 visualization.

```typescript
// Inside useEffect:
const svgEl = svgRef.current;
const g = select(svgEl).select<SVGGElement>("g.zoom-group");

const zoomBehavior = zoom<SVGSVGElement, unknown>()
  .scaleExtent([0.3, 3])
  .on("zoom", (event) => {
    g.attr("transform", event.transform.toString());
  });

select(svgEl).call(zoomBehavior);

// Cleanup
return () => {
  select(svgEl).on(".zoom", null);
  simulation?.stop();
};
```

### Pattern 3: Bidirectional Edge Rendering with SVG Markers

**What:** Render directed edges between ontology type nodes with arrowhead markers, using curved paths to distinguish bidirectional edges.

**When to use:** When two nodes have edges in both directions.

```typescript
// Define arrow marker in SVG defs
// <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5"
//   markerWidth="6" markerHeight="6" orient="auto-start-reverse">
//   <path d="M 0 0 L 10 5 L 0 10 Z" />
// </marker>

// For bidirectional edges, offset the paths using a curve
function linkArc(d: GraphLink) {
  const dx = (d.target as GraphNode).x! - (d.source as GraphNode).x!;
  const dy = (d.target as GraphNode).y! - (d.source as GraphNode).y!;
  const dr = Math.sqrt(dx * dx + dy * dy) * 1.2; // curve radius
  return `M${(d.source as GraphNode).x},${(d.source as GraphNode).y}` +
         `A${dr},${dr} 0 0,1 ${(d.target as GraphNode).x},${(d.target as GraphNode).y}`;
}
```

### Pattern 4: Stacked-to-Grouped Bar Chart Transition

**What:** A bar chart that toggles between stacked and grouped layout with animated transitions.

**When to use:** When comparing both composition (stacked) and individual values (grouped) of the same dataset.

```typescript
// D3 stack generator for stacked layout
const stackGen = stack<TypeDistributionItem>()
  .keys(["records", "queries"]);

// For grouped layout: use scaleBand with inner padding
const xInner = scaleBand()
  .domain(["records", "queries"])
  .range([0, xOuter.bandwidth()])
  .padding(0.05);

// Transition between layouts:
// Stacked: y = y0 (bottom of stack), height = y1 - y0
// Grouped: y = yScale(value), height = height - yScale(value), x offset by inner band
```

### Pattern 5: Global Role State with React Context

**What:** A React Context provider at the app root that manages the current user role, shared between User Management (role change) and Query Console (PII masking).

**When to use:** When role state must persist across page navigation and be accessible from multiple pages.

```typescript
// contexts/RoleContext.tsx
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Role } from "@/types";

interface RoleContextType {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role>("super_admin");
  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within RoleProvider");
  return context;
}
```

Place `<RoleProvider>` inside the root layout's `<ThemeProvider>`, so it wraps all pages.

### Pattern 6: Supabase Data Fetching in Client Components

**What:** Fetch user data from Supabase `users` table using the browser client.

**When to use:** Client-side data fetching for the user management table.

```typescript
"use client";

import { createClient } from "@/utils/supabase/client";
import type { User } from "@/types";

// Inside component:
const [users, setUsers] = useState<User[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchUsers() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("users")
      .select("id, username, email, role, last_login, created_at")
      .order("id");

    if (data && !error) {
      // Map snake_case DB columns to camelCase TypeScript interface
      setUsers(data.map(row => ({
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role as Role,
        lastLogin: row.last_login,
        createdAt: row.created_at,
      })));
    }
    setLoading(false);
  }
  fetchUsers();
}, []);
```

### Anti-Patterns to Avoid

- **Separate SVG per mode:** Do NOT create three different SVG elements for Force/Radial/Hierarchy. Use a single SVG with one `<g>` group that transitions between computed positions. Multiple SVGs would duplicate zoom state and cause visual jumps.

- **Uncontrolled force simulation:** Do NOT let the force simulation run indefinitely. Call `simulation.stop()` when switching to Radial or Hierarchy mode, and in the useEffect cleanup. Running simulations waste CPU and can cause layout conflicts.

- **Direct DOM manipulation in render:** Do NOT use `d3.select()` in the React render function. All D3 DOM operations must be inside `useEffect` with proper cleanup. This is the foundational pattern already established in the project's chart-utils.ts.

- **Fetching Supabase data in useEffect without loading state:** Always show a skeleton/spinner while the async fetch is in progress. The existing `ChartSkeleton` component should be used.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Graph node positioning (3 modes) | Custom position calculator | `d3.forceSimulation` + `d3.tree()` | Force simulation has N-body physics, collision detection, link tension -- all deceptively complex |
| Zoom/pan behavior | Custom mouse/wheel event handlers | `d3.zoom()` | Handles touch, trackpad, mouse wheel, inertia, scale extent, translate extent, double-click reset |
| Edge path curves | Manual SVG path string building | D3 `linkHorizontal()`, `linkRadial()`, custom arc function | Handles control point math, prevents path overlap for bidirectional edges |
| Stacked bar computation | Manual y-offset calculation | `d3.stack()` | Handles baseline alignment, series ordering, negative values |
| Role badge variants | Custom className logic | CVA (class-variance-authority) via shadcn Badge | Type-safe variant management already in the codebase pattern |
| Table rendering | Custom div-based grid | shadcn Table component | Accessible `<table>` markup, built-in styling, consistent with app patterns |
| Tooltip positioning | Custom mouse position math | Existing `createTooltip()` from chart-tooltip.ts (for D3 charts) + shadcn Tooltip (for UI elements) | Viewport boundary correction, theme-aware styling already built |

**Key insight:** The D3 ecosystem provides battle-tested layout algorithms (force, tree, zoom, stack) that handle edge cases (node overlap, viewport boundaries, touch events) which take weeks to implement correctly from scratch. Use them as layout engines and render the output.

---

## Common Pitfalls

### Pitfall 1: Force Simulation Not Stopping on Mode Switch

**What goes wrong:** Switching from Force to Radial mode while the simulation is still running causes nodes to jitter -- the simulation keeps updating positions while the radial layout tries to fix them.

**Why it happens:** `forceSimulation` runs asynchronously via `d3-timer`. Calling `simulation.stop()` is required to halt it.

**How to avoid:** Store simulation ref. On mode switch: (1) call `simulation.stop()`, (2) compute new positions, (3) transition nodes. Only restart simulation when switching back to Force mode.

**Warning signs:** Nodes vibrating or slowly drifting after switching to Radial/Hierarchy mode.

### Pitfall 2: D3 Zoom and React Re-render Conflict

**What goes wrong:** React re-renders reset the zoom transform because the SVG is re-created, losing the user's current pan/zoom position.

**Why it happens:** If the SVG is controlled by React state (e.g., in JSX), re-renders can conflict with D3's imperative zoom transform.

**How to avoid:** Use a stable ref for the SVG element. Apply zoom behavior via D3 selection inside useEffect. Store zoom transform in a ref (not state) to avoid triggering re-renders.

**Warning signs:** Zoom resets to default when any state (like edge filter) changes.

### Pitfall 3: Bidirectional Edge Overlap

**What goes wrong:** Two edges between the same pair of nodes (e.g., Equipment -> Process "runs" and Process -> Equipment implicit reverse) render on top of each other, appearing as one edge.

**Why it happens:** Both straight-line paths follow the exact same coordinates.

**How to avoid:** Use curved arc paths (`linkArc`) with opposite curvature for forward vs reverse edges. Detect bidirectional pairs and apply an offset.

**Warning signs:** Edge count appears less than expected in the visualization.

### Pitfall 4: Supabase snake_case vs TypeScript camelCase Mismatch

**What goes wrong:** Supabase returns `last_login` but the TypeScript `User` type expects `lastLogin`. Direct assignment causes type errors or undefined values.

**Why it happens:** PostgreSQL convention is snake_case, TypeScript convention is camelCase. The mapping is noted in the codebase's `types/index.ts` header comment.

**How to avoid:** Always map Supabase response rows to TypeScript interfaces explicitly. Do NOT use `as User` casting on raw Supabase data.

**Warning signs:** `user.lastLogin` is always undefined despite data existing in Supabase.

### Pitfall 5: Edge Filter State Not Syncing with Graph

**What goes wrong:** Changing edge filter from "All" to "Outbound" doesn't update the graph because the D3 rendering is divorced from React state.

**Why it happens:** D3 renders imperatively in useEffect, and if the edge filter state isn't in the useEffect dependency array, the graph won't re-render.

**How to avoid:** Include `edgeFilter` in the useEffect dependency array. On filter change, recompute visible links and update the D3 selection via `.join()` or explicit enter/update/exit.

**Warning signs:** Filter dropdown changes but graph edges don't update.

### Pitfall 6: Graph Container Size Not Available on First Render

**What goes wrong:** The graph renders at 0x0 size or at incorrect dimensions because the container hasn't been laid out yet when useEffect runs.

**Why it happens:** CSS flex/grid layout is computed after the first paint. D3 needs concrete pixel dimensions for centering and scaling.

**How to avoid:** Use the existing `createDebouncedResizeObserver` from chart-utils.ts. Initialize the graph only after getting valid dimensions from ResizeObserver.

**Warning signs:** Graph appears in the top-left corner or is invisible.

---

## Code Examples

### Graph Node Data Preparation from studio-data.ts

```typescript
// Source: existing codebase src/data/studio-data.ts
import { getOntologyTypes } from "@/data/studio-data";
import type { OntologyType } from "@/types";

function buildGraphData(types: OntologyType[], edgeFilter: EdgeFilter) {
  const nodes: GraphNode[] = types.map(t => ({
    id: t.name,
    name: t.name,
    nodeCount: t.nodeCount,
  }));

  const links: GraphLink[] = [];
  for (const type of types) {
    for (const rel of type.relations) {
      // Edge filter logic
      if (edgeFilter === "outbound" && rel.direction !== "outbound") continue;
      if (edgeFilter === "inbound" && rel.direction !== "inbound") continue;

      // Only include edges where target exists in our 6 types
      if (types.some(t => t.name === rel.target)) {
        links.push({
          source: type.name,
          target: rel.target,
          name: rel.name,
          direction: rel.direction,
        });
      }
    }
  }
  return { nodes, links };
}
```

### Force Mode Initialization

```typescript
// Source: D3 official docs https://d3js.org/d3-force
import {
  forceSimulation, forceLink, forceManyBody,
  forceCenter, forceCollide
} from "d3-force";

function startForceLayout(
  nodes: GraphNode[],
  links: GraphLink[],
  width: number,
  height: number
) {
  const simulation = forceSimulation(nodes)
    .force("link", forceLink(links)
      .id((d: any) => d.id)
      .distance(120)
      .strength(0.5))
    .force("charge", forceManyBody().strength(-500))
    .force("center", forceCenter(width / 2, height / 2))
    .force("collide", forceCollide(50))
    .alphaDecay(0.02);

  return simulation;
}
```

### Radial Layout from Tree

```typescript
// Source: D3 official docs https://d3js.org/d3-hierarchy/tree
import { hierarchy, tree } from "d3-hierarchy";

function computeRadialPositions(
  types: OntologyType[],
  width: number,
  height: number
) {
  // Create a virtual root for the hierarchy
  const root = hierarchy({
    name: "root",
    children: types.map(t => ({ name: t.name, nodeCount: t.nodeCount })),
  });

  const radius = Math.min(width, height) / 2 - 60;
  const treeLayout = tree<any>().size([2 * Math.PI, radius]);
  treeLayout(root);

  const positions: Record<string, { x: number; y: number }> = {};
  for (const node of root.leaves()) {
    // Polar to Cartesian conversion
    const angle = node.x - Math.PI / 2;
    const r = node.y;
    positions[node.data.name] = {
      x: width / 2 + r * Math.cos(angle),
      y: height / 2 + r * Math.sin(angle),
    };
  }
  return positions;
}
```

### Hierarchy (Tree) Layout

```typescript
// Source: D3 official docs https://d3js.org/d3-hierarchy/tree
function computeTreePositions(
  types: OntologyType[],
  width: number,
  height: number
) {
  // Build hierarchy from relations (Equipment as root, or use virtual root)
  const root = hierarchy({
    name: "root",
    children: types.map(t => ({ name: t.name, nodeCount: t.nodeCount })),
  });

  const treeLayout = tree<any>()
    .size([width - 120, height - 120]);
  treeLayout(root);

  const positions: Record<string, { x: number; y: number }> = {};
  for (const node of root.leaves()) {
    positions[node.data.name] = {
      x: node.x + 60,
      y: node.y + 60,
    };
  }
  return positions;
}
```

### Role Badge Component

```typescript
// Source: shadcn Badge + CVA pattern
// USER-02: 4 role badges with color coding
import { Badge } from "@/components/ui/badge";
import { cva } from "class-variance-authority";
import type { Role } from "@/types";

const roleBadgeVariants = cva("text-xs font-medium", {
  variants: {
    role: {
      super_admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      service_app: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      data_analyst: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      auditor: "border border-current bg-transparent text-muted-foreground",
    },
  },
});

const roleLabels: Record<Role, string> = {
  super_admin: "Super Admin",
  service_app: "Service App",
  data_analyst: "Data Analyst",
  auditor: "Auditor",
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge className={roleBadgeVariants({ role })} data-testid={`role-badge-${role}`}>
      {roleLabels[role]}
    </Badge>
  );
}
```

### Role Tooltip Content

```typescript
// USER-03: PII permission summary per role
const rolePermissions: Record<Role, string> = {
  super_admin: "Full access to all PII fields (Plain text)",
  service_app: "API access, masked PII for phone/email",
  data_analyst: "Masked names/emails, denied phone/address",
  auditor: "Read-only audit, denied all PII fields",
};
```

### Stacked/Grouped Bar Chart Toggle

```typescript
// Source: D3 official Observable example
// https://observablehq.com/@d3/stacked-to-grouped-bars
import { stack, scaleBand, scaleLinear } from "d3";
import { getTypeDistribution } from "@/data/studio-data";

type BarMode = "stacked" | "grouped";

// Two series keys: "records" and "queries"
const keys = ["records", "queries"];

// For stacked: use d3.stack()
const stackedData = stack().keys(keys)(distributionData);

// For grouped: use nested scaleBand
const xOuter = scaleBand()
  .domain(distributionData.map(d => d.name))
  .range([0, chartWidth])
  .padding(0.2);

const xInner = scaleBand()
  .domain(keys)
  .range([0, xOuter.bandwidth()])
  .padding(0.05);

// Transition between modes:
// bars.transition().duration(500)
//   .attr("x", /* stacked: xOuter, grouped: xOuter + xInner offset */)
//   .attr("y", /* stacked: yScale(d[1]), grouped: yScale(d.value) */)
//   .attr("height", /* stacked: yScale(d[0]) - yScale(d[1]), grouped: chartHeight - yScale(d.value) */)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| D3 enter/append/exit pattern | `selection.join("element")` | D3 v5+ | Simpler data binding, automatic enter/update/exit handling |
| Manual zoom event math | `d3.zoom()` with `.on("zoom", event)` | D3 v4+ | Handles all input devices, programmatic zoom control |
| Global D3 import | Selective sub-module imports | D3 v4+ | Tree-shaking, smaller bundles |
| React class components for D3 | Hooks (useEffect + useRef) | React 16.8+ | Cleaner lifecycle management, better cleanup |
| Custom state management | React Context (or Zustand for complex) | Ongoing | Context is sufficient for simple role state, no extra dependency needed |

**Not applicable for this phase:**
- Zustand -- overkill for a single `Role` state value. React Context is sufficient and adds no dependency.
- Server Components for data fetching -- while possible, the user table needs client-side role editing state, making a client component more natural. Could use hybrid approach but complexity isn't warranted for 5 rows.

---

## Open Questions

1. **Graph Hierarchy Root Node**
   - What we know: The 6 ontology types form a partially connected graph, not a strict tree. Equipment is the most-connected node (3 outbound relations + 2 inbound).
   - What's unclear: For the Hierarchy (tree) mode, how should a non-tree graph be projected into a tree?
   - Recommendation: Use a virtual root node (hidden) with all 6 types as children. This gives a flat tree for Hierarchy mode. The edges are drawn as overlays, not as tree links. Alternatively, use Equipment as root and show relation-based parent-child, but this orphans Recipe/Defect/MaintenanceRecord relationships.

2. **Edge Direction Semantics in Edge Filter**
   - What we know: Relations in `studio-data.ts` only have "outbound" direction. The "inbound" direction would be the reverse perspective (e.g., "runs" from Equipment to Process is "outbound" from Equipment, "inbound" to Process).
   - What's unclear: Is the edge filter relative to the selected type or global?
   - Recommendation: Make it relative to the selected type in TypeList. If Equipment is selected, "Outbound" shows Equipment's outgoing edges, "Inbound" shows edges pointing TO Equipment. "All" shows everything. If no type is selected, show all edges.

3. **Role State Initialization**
   - What we know: The role context needs a default value. The 5 seed users have different roles.
   - What's unclear: Should the initial role come from a specific user, or be a separate "viewing as" concept?
   - Recommendation: Default to `"super_admin"` (full access) so the demo starts with all data visible. The role dropdown in User Management and Query Console changes the "viewing as" role, not any user's actual role.

---

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: `src/types/index.ts`, `src/data/studio-data.ts`, `src/components/charts/shared/*`, `supabase/migrations/20260219000000_initial_schema.sql`
- [D3 Force Simulation](https://d3js.org/d3-force/simulation) - Official D3 docs for force layout API
- [D3 Hierarchy Tree](https://d3js.org/d3-hierarchy/tree) - Official D3 docs for tree layout, radial projection
- [D3 Zoom](https://d3js.org/d3-zoom) - Official D3 docs for zoom/pan behavior
- [D3 Force GitHub](https://github.com/d3/d3-force) - d3-force v3.0.0 source and README

### Secondary (MEDIUM confidence)
- [Stacked-to-Grouped Bars (Observable)](https://observablehq.com/@d3/stacked-to-grouped-bars) - Official D3 Observable notebook for transition pattern
- [D3 in Depth - Force Layout](https://www.d3indepth.com/force-layout/) - Comprehensive force layout tutorial with transition strategies
- [Stamen - Forcing Functions Layout Transitions](https://stamen.com/forcing-functions-inside-d3-v4-forces-and-layout-transitions-f3e89ee02d12/) - Layout transition techniques with alphaTarget
- [Radial Tidy Tree (Observable)](https://observablehq.com/@d3/radial-tree/2) - Official D3 radial tree example
- [shadcn/ui Badge](https://ui.shadcn.com/docs/components/radix/badge) - Badge component with variant pattern
- [Supabase React Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs) - Data fetching pattern
- [Vercel - React Context with Next.js](https://vercel.com/kb/guide/react-context-state-management-nextjs) - Official Vercel guide on Context provider placement

### Tertiary (LOW confidence)
- [D3 Bidirectional Arrowheads Discussion](https://groups.google.com/g/d3-js/c/nXwKJMiwS4o) - Community discussion on bidirectional edge rendering
- [D3 V6 Force Graph with Arrows (Observable)](https://observablehq.com/@brunolaranjeira/d3-v6-force-directed-graph-with-directional-straight-arrow) - Arrow marker pattern (v6 but applicable to v7)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies already installed and verified in `package.json`
- Data layer: HIGH - `studio-data.ts` and Supabase schema directly inspected
- D3 Force/Tree/Zoom patterns: HIGH - Official D3 docs + established codebase patterns
- Stacked/Grouped bar transition: MEDIUM - Observable example verified, React integration pattern extrapolated
- Role state management: HIGH - React Context is a fundamental pattern, verified with Vercel docs
- Edge filter semantics: MEDIUM - Implementation recommendation based on UX analysis, not explicitly specified in requirements
- Bidirectional edge rendering: MEDIUM - Multiple sources agree on arc path approach, exact implementation needs testing

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (stable D3 v7 ecosystem, no breaking changes expected)
