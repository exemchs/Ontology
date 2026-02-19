# Architecture Patterns

**Domain:** D3.js-heavy monitoring dashboard on Next.js 16 App Router + Supabase
**Researched:** 2026-02-19
**Confidence:** HIGH (well-established patterns for D3+React+Next.js; PRD specs are definitive)

---

## Recommended Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Next.js 16 App Router                        │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Root Layout (Server)                       │   │
│  │  ThemeProvider + Geist Font + Global CSS                     │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │              Auth Gate (Client)                         │ │   │
│  │  │  PasswordGate → sessionStorage token                    │ │   │
│  │  │                                                         │ │   │
│  │  │  ┌──────────────────────────────────────────────────┐  │ │   │
│  │  │  │           App Shell (Client)                     │  │ │   │
│  │  │  │  ┌──────────┐ ┌──────────────────────────────┐  │  │ │   │
│  │  │  │  │          │ │  HeaderBar                    │  │  │ │   │
│  │  │  │  │  App     │ │  ┌───────────────────────┐   │  │  │ │   │
│  │  │  │  │  Sidebar │ │  │    Page Content        │   │  │  │ │   │
│  │  │  │  │          │ │  │  ┌─────────────────┐  │   │  │  │ │   │
│  │  │  │  │  280px   │ │  │  │  D3 Charts      │  │   │  │  │ │   │
│  │  │  │  │          │ │  │  │  (Client Only)   │  │   │  │  │ │   │
│  │  │  │  │          │ │  │  └─────────────────┘  │   │  │  │ │   │
│  │  │  │  └──────────┘ │  └───────────────────────┘   │  │  │ │   │
│  │  │  │               └──────────────────────────────┘  │  │ │   │
│  │  │  └──────────────────────────────────────────────────┘  │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Data Sources                               │   │
│  │  ┌──────────────┐  ┌──────────────────┐  ┌───────────────┐  │   │
│  │  │ Hardcoded    │  │ Supabase API     │  │ Client State  │  │   │
│  │  │ Data Files   │  │ (users, queries) │  │ (theme, role) │  │   │
│  │  └──────────────┘  └──────────────────┘  └───────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With | Rendering |
|-----------|---------------|-------------------|-----------|
| **Root Layout** | HTML shell, fonts, global CSS, ThemeProvider wrapper | All children | Server |
| **PasswordGate** | Session-based auth wall, token in sessionStorage | HeaderBar (auth state), all page content | Client |
| **AppSidebar** | 4-group navigation (Operations/Monitoring/Workspace/Admin) | Router (navigation), HeaderBar (breadcrumb sync) | Client |
| **HeaderBar** | Breadcrumbs, search trigger, theme toggle, role indicator | CommandPalette, ThemeProvider, RBAC context | Client |
| **CommandPalette** | Cmd+K search and page navigation | Router, sidebar items | Client |
| **WelcomePopup** | First-visit Korean notice dialog | localStorage (dismiss flag) | Client |
| **Page Components (6)** | Page-level layout, data orchestration, chart composition | Data files, Supabase API, D3 chart components | Client |
| **D3 Chart Components (19)** | SVG rendering, animations, interactions | Container ref, data props, theme system | Client |
| **shadcn/ui Components (17)** | Form controls, cards, tables, dialogs, badges | Page components, chart wrappers | Client |
| **Data Files (5)** | Static hardcoded data for dashboards | Page components (imported directly) | N/A (pure data) |
| **PII Masking System** | Role-based data transformation | Query Console page, PII config | Client |
| **Supabase Clients** | Database queries for users/queries tables | Server/client components, middleware | Both |

---

## Client vs Server Component Boundaries

This is the most critical architectural decision for a D3-heavy Next.js App Router project.

### The Rule: D3 = Client Components, Always

D3.js requires DOM access (`document`, `window`, `ResizeObserver`, `d3.select()`, `d3.drag()`, `d3.zoom()`). Every D3 chart component MUST be a client component (`"use client"`).

### Recommended Boundary Strategy

```
src/app/layout.tsx                    ← SERVER (html, metadata, font)
src/app/(authenticated)/layout.tsx    ← CLIENT ("use client" — wraps auth + sidebar + theme)
src/app/(authenticated)/page.tsx      ← CLIENT (dashboard with D3 charts)
src/app/(authenticated)/monitoring/
  dgraph/page.tsx                     ← CLIENT (D3 cluster topology)
  gpu/page.tsx                        ← CLIENT (D3 GPU charts)
src/app/(authenticated)/workspace/
  studio/page.tsx                     ← CLIENT (D3 ontology graph)
  query/page.tsx                      ← CLIENT (D3 query views + PII masking)
src/app/(authenticated)/admin/
  users/page.tsx                      ← CLIENT (Supabase API calls, no D3)
```

**Why almost everything is Client:** This is a dashboard POC where:
1. All 6 pages contain either D3 charts or interactive UI requiring browser APIs
2. The PasswordGate wrapping everything needs `sessionStorage` (browser API)
3. Theme detection needs `document.documentElement.classList`
4. The sidebar needs `useState` for collapse/expand

**What stays Server:** Only the root `layout.tsx` (metadata, fonts, HTML structure). Everything below the auth gate is client-rendered.

### The (authenticated) Route Group Pattern

Use Next.js route groups to create a shared authenticated layout without affecting URLs:

```
src/app/
├── layout.tsx                         ← Server: <html>, metadata, fonts
├── (authenticated)/
│   ├── layout.tsx                     ← Client: PasswordGate + SidebarProvider + ThemeProvider
│   ├── page.tsx                       ← Dashboard (/)
│   ├── monitoring/
│   │   ├── dgraph/page.tsx            ← DGraph Monitoring
│   │   └── gpu/page.tsx               ← GPU Monitoring
│   ├── workspace/
│   │   ├── studio/page.tsx            ← Ontology Studio
│   │   └── query/page.tsx             ← Query Console
│   └── admin/
│       └── users/page.tsx             ← User Management
```

This keeps routes clean (`/monitoring/dgraph` not `/authenticated/monitoring/dgraph`) while sharing the auth+sidebar+header layout.

---

## Data Flow

### Three Data Lanes

This application has three distinct data sources, and keeping them architecturally separate is essential.

```
┌──────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                  │
│                                                                  │
│  Lane 1: HARDCODED DATA (majority of app)                        │
│  ┌───────────────┐    import    ┌──────────────┐    props       │
│  │ data/*.ts      │ ──────────→ │ Page Component│ ──────────→   │
│  │ (static files) │             │              │  D3 Charts     │
│  └───────────────┘              └──────────────┘                │
│                                                                  │
│  Lane 2: SUPABASE API (users + queries only)                     │
│  ┌───────────────┐   fetch/RPC  ┌──────────────┐    render     │
│  │ Supabase DB   │ ←──────────→ │ Page Component│ ──────────→   │
│  │ (PostgreSQL)  │              │ (useEffect)  │  Tables/Lists  │
│  └───────────────┘              └──────────────┘                │
│                                                                  │
│  Lane 3: CLIENT STATE (cross-cutting)                            │
│  ┌───────────────┐   context    ┌──────────────┐    consume    │
│  │ React Context │ ──────────→ │ Any Component │ ──────────→   │
│  │ / useState    │              │              │  UI Updates    │
│  │ theme, role   │              └──────────────┘                │
│  └───────────────┘                                              │
└──────────────────────────────────────────────────────────────────┘
```

#### Lane 1: Hardcoded Data (5 files)

```
src/data/
├── dashboard-data.ts    → OntologyDashboard page
├── dgraph-data.ts       → DGraphMonitoring page
├── gpu-data.ts           → GpuMonitoring page
├── studio-data.ts        → Studio page
├── query-data.ts         → QueryConsole page (includes piiDemoData)
```

Each page imports its data file directly. No API calls, no async, no loading states for this data. This is intentional for the POC — the data is static and bundled with the application.

#### Lane 2: Supabase API (2 tables)

Only two pages need Supabase API calls:
- **Query Console:** `GET /api/queries` (query history)
- **User Management:** `GET /api/users` (user list)

**Pattern:** Use the Supabase browser client directly in client components with `useEffect` + `useState`. No React Query or TanStack Query needed for this POC scope (only 2 simple fetches, no caching requirements, no mutations beyond seed data).

```typescript
// Example: UserManagement page
"use client";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("users").select("id, username, email, role, lastLogin")
      .then(({ data }) => { setUsers(data ?? []); setLoading(false); });
  }, []);
  // ...
}
```

#### Lane 3: Client State (3 concerns)

| State | Mechanism | Scope | Consumers |
|-------|-----------|-------|-----------|
| Theme (dark/light) | React Context + `<html>` class toggle + localStorage | Global | All D3 charts, all shadcn/ui components |
| Auth (password gate) | sessionStorage token + useState | Global | PasswordGate, HeaderBar |
| RBAC Role (masking) | useState (local to Query Console) | Page-local | RoleMaskingSimulator, PiiTable, PiiDemoTabs |

**Important:** The RBAC role selector is NOT a global context. It lives only inside the Query Console page. This is correct for the POC — the role simulator is a demo feature, not actual auth.

---

## File Structure

### Recommended Directory Layout (Adapted from PRD for Next.js App Router)

```
src/
├── app/
│   ├── layout.tsx                          # Server: <html>, metadata, Geist font
│   ├── globals.css                         # Tailwind 4 + exem-ui CSS vars + chart tokens
│   │
│   └── (authenticated)/
│       ├── layout.tsx                      # Client: PasswordGate + SidebarProvider + ThemeProvider
│       ├── page.tsx                        # Dashboard (/)
│       ├── monitoring/
│       │   ├── dgraph/page.tsx             # DGraph Monitoring
│       │   └── gpu/page.tsx                # GPU Monitoring
│       ├── workspace/
│       │   ├── studio/page.tsx             # Ontology Studio
│       │   └── query/page.tsx              # Query Console + RBAC Masking
│       └── admin/
│           └── users/page.tsx              # User Management
│
├── components/
│   ├── layout/
│   │   ├── AppSidebar.tsx                  # 4-group navigation
│   │   ├── HeaderBar.tsx                   # Breadcrumbs, search, theme, role
│   │   ├── PasswordGate.tsx                # Session auth wall
│   │   ├── WelcomePopup.tsx                # First-visit dialog
│   │   └── CommandPalette.tsx              # Cmd+K
│   │
│   ├── charts/
│   │   ├── shared/
│   │   │   ├── chart-utils.ts              # cleanupD3Svg, formatNumber, generateTimeSeries
│   │   │   ├── chart-theme.ts              # CSS var resolution, theme-aware color getter
│   │   │   └── chart-tooltip.ts            # Shared tooltip creation/positioning
│   │   ├── dashboard/
│   │   │   ├── D3ResourceGauge.tsx          # 270-degree arc gauge (x3 instances)
│   │   │   ├── D3DualLineChart.tsx          # Dual Y-axis line chart
│   │   │   ├── D3ChordDiagram.tsx           # 6-type relation chord
│   │   │   ├── D3NodeScatter.tsx            # Latency x Throughput scatter
│   │   │   └── D3ResourceBars.tsx           # Stacked/Grouped resource bars
│   │   ├── dgraph/
│   │   │   ├── D3ClusterTopology.tsx        # Force/Radial topology (MOST COMPLEX)
│   │   │   ├── D3QueryScatter.tsx           # Brushable query scatter
│   │   │   └── D3ShardBars.tsx              # Grouped shard bars
│   │   ├── gpu/
│   │   │   ├── D3PerformanceTrends.tsx      # Multi-line with tabs
│   │   │   ├── D3GpuHeatmap.tsx             # GPU x Time heatmap
│   │   │   ├── D3GpuRidgeline.tsx           # Ridgeline density chart
│   │   │   └── D3GpuComparisonBars.tsx      # Grouped comparison bars
│   │   ├── studio/
│   │   │   ├── D3OntologyGraph.tsx          # 3-mode schema graph (2ND MOST COMPLEX)
│   │   │   └── D3TypeDistribution.tsx       # Type distribution bars
│   │   └── query/
│   │       ├── D3ForceGraph.tsx             # Bipartite equipment-location
│   │       ├── D3Treemap.tsx                # Equipment type treemap
│   │       ├── D3ArcDiagram.tsx             # Equipment-Bay arcs
│   │       ├── D3QueryScatterView.tsx       # Location x Complexity scatter
│   │       └── D3QueryDistribution.tsx      # Location x Type distribution
│   │
│   ├── query/                              # Query Console domain components
│   │   ├── RoleMaskingSimulator.tsx         # Role selector + info banner
│   │   ├── PiiTable.tsx                     # Masked result table
│   │   └── PiiDemoTabs.tsx                  # FAB / General PII tabs
│   │
│   └── ui/                                 # shadcn/ui (17 components)
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── dialog.tsx
│       ├── tabs.tsx
│       ├── table.tsx
│       ├── select.tsx
│       ├── tooltip.tsx
│       ├── sidebar.tsx
│       ├── command.tsx
│       ├── scroll-area.tsx
│       ├── separator.tsx
│       ├── dropdown-menu.tsx
│       ├── breadcrumb.tsx
│       ├── collapsible.tsx
│       ├── switch.tsx
│       ├── textarea.tsx
│       └── toaster.tsx
│
├── data/
│   ├── dashboard-data.ts                   # Metrics, gauges, chart data
│   ├── dgraph-data.ts                      # Cluster topology, node metrics
│   ├── gpu-data.ts                         # GPU cards, health, processes
│   ├── studio-data.ts                      # 6 ontology types (sampleTypes[])
│   ├── query-data.ts                       # Sample data + piiDemoData
│   └── pii-config.ts                       # PII field configs, role definitions
│
├── hooks/
│   ├── use-theme.ts                        # Theme context hook
│   ├── use-auth.ts                         # Password gate auth hook
│   └── use-mobile.ts                       # Mobile detection hook
│
├── lib/
│   ├── utils.ts                            # cn() utility (shadcn/ui pattern)
│   └── pii-masking.ts                      # maskName, maskPhone, maskEmail, etc.
│
├── types/
│   └── index.ts                            # Role, PiiLevel, chart data types
│
├── utils/
│   └── supabase/                           # (existing)
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
│
└── middleware.ts                            # (existing — session refresh)
```

### Key Structural Decisions

**1. `components/charts/shared/` — The shared chart utilities are the architectural linchpin.** Three files create consistency across 19 charts:
- `chart-utils.ts`: `cleanupD3Svg()`, `formatNumber()`, `generateTimeSeriesData()` — used by every chart
- `chart-theme.ts`: Resolves CSS custom properties to D3-usable colors, handles dark/light — used by every chart
- `chart-tooltip.ts`: Creates and positions tooltips with consistent styling — used by ~15 charts

**2. Charts grouped by page, not by chart type.** A `D3QueryScatter` in dgraph/ and a `D3QueryScatterView` in query/ are different components with different data shapes, even though both are scatter plots. Grouping by page makes it clear which data file feeds which chart.

**3. `components/query/` is separate from `components/charts/query/`.** The PII masking components (RoleMaskingSimulator, PiiTable, PiiDemoTabs) are domain logic components, not chart components. They use shadcn/ui tables, not D3.

---

## Patterns to Follow

### Pattern 1: D3 Chart Component Template

Every D3 chart component follows the same structural pattern. This is the most important pattern in the entire codebase.

**What:** A standardized React component structure for D3 charts with proper lifecycle management.

**When:** Every time you create a D3 chart component (19 times in this project).

```typescript
"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { cleanupD3Svg } from "@/components/charts/shared/chart-utils";
import { getChartColors } from "@/components/charts/shared/chart-theme";

interface D3ExampleChartProps {
  data: ExampleData[];
  className?: string;
}

export function D3ExampleChart({ data, className }: D3ExampleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || data.length === 0) return;

    // 1. Destroyed ref — prevents stale updates
    const destroyedRef = { current: false };

    // 2. Get theme-aware colors
    const colors = getChartColors();

    // 3. Setup ResizeObserver
    const observer = new ResizeObserver((entries) => {
      if (destroyedRef.current) return;
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          renderChart(width, height);
        }
      }
    });

    function renderChart(width: number, height: number) {
      if (destroyedRef.current) return;

      // 4. Clean previous render
      cleanupD3Svg(container);

      // 5. Create SVG
      const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("role", "img")
        .attr("aria-label", "Example chart description");

      // 6. D3 rendering logic...
    }

    observer.observe(container);

    // 7. Cleanup function
    return () => {
      destroyedRef.current = true;
      observer.disconnect();
      // Stop any simulations/timers
      // simulation?.stop();
      // timer?.stop();
      d3.select(".chart-tooltip").remove();
      if (container) cleanupD3Svg(container);
    };
  }, [data]); // Re-render when data changes

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full min-h-[200px]", className)}
      data-testid="example-chart"
    />
  );
}
```

**Critical details:**
- `destroyedRef` pattern prevents rendering after unmount (React 19 strict mode calls cleanup then re-renders)
- `cleanupD3Svg()` on every render prevents SVG accumulation
- `ResizeObserver` makes charts responsive
- Tooltip cleanup in the return function prevents orphaned tooltips

### Pattern 2: Theme-Aware Color Resolution

**What:** Centralized CSS variable resolution for D3 charts.

**When:** Every chart needs colors that match the current theme.

```typescript
// components/charts/shared/chart-theme.ts

export function getChartColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    chart1: style.getPropertyValue("--color-chart-1").trim(),
    chart2: style.getPropertyValue("--color-chart-2").trim(),
    chart3: style.getPropertyValue("--color-chart-3").trim(),
    chart4: style.getPropertyValue("--color-chart-4").trim(),
    chart5: style.getPropertyValue("--color-chart-5").trim(),
    chart6: style.getPropertyValue("--color-chart-6").trim(),
    chart7: style.getPropertyValue("--color-chart-7").trim(),
    chart8: style.getPropertyValue("--color-chart-8").trim(),
    text: style.getPropertyValue("--color-text-primary").trim(),
    textSecondary: style.getPropertyValue("--color-text-secondary").trim(),
    border: style.getPropertyValue("--color-border-primary").trim(),
    background: style.getPropertyValue("--color-background").trim(),
  };
}

export function isLightTheme(): boolean {
  return document.documentElement.classList.contains("light");
}
```

**Why centralized:** If 19 charts each inline `getComputedStyle()` calls, theme-related bugs become impossible to trace. A single source of truth means one fix propagates everywhere.

### Pattern 3: Page Component as Chart Orchestrator

**What:** Page components own data + layout. Charts are pure renderers.

**When:** Every page that contains D3 charts.

```typescript
// app/(authenticated)/page.tsx (Dashboard)
"use client";

import { dashboardMetrics, gaugeData, dualLineData, ... } from "@/data/dashboard-data";
import { D3ResourceGauge } from "@/components/charts/dashboard/D3ResourceGauge";
import { D3DualLineChart } from "@/components/charts/dashboard/D3DualLineChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OntologyDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-4 gap-4">
        {dashboardMetrics.map(m => <MetricCard key={m.id} {...m} />)}
      </div>

      {/* Gauges Row */}
      <div className="grid grid-cols-3 gap-4">
        {gaugeData.map(g => (
          <Card key={g.id}>
            <CardContent className="h-[200px]">
              <D3ResourceGauge value={g.value} label={g.label} color={g.color} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Agent Request Rate</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <D3DualLineChart data={dualLineData} />
          </CardContent>
        </Card>
        {/* ... more charts */}
      </div>
    </div>
  );
}
```

**Key principle:** D3 chart components receive data as props. They never import data files themselves. This makes charts reusable and testable.

### Pattern 4: PII Masking as a Pure Function Pipeline

**What:** Masking is a data transformation, not a UI concern.

**When:** Query Console page applies role-based masking to demo data.

```
User selects role
    ↓
applyMasking(rawData, role, fieldConfigs)
    ↓
Transformed data (masked values)
    ↓
PiiTable renders with cell styling based on original vs masked comparison
```

```typescript
// Query Console page manages this flow:
const [role, setRole] = useState<Role>("super_admin");
const maskedData = useMemo(
  () => applyMasking(piiDemoData.fab, role, fabFieldConfigs),
  [role]
);

// PiiTable receives both original and masked for cell styling:
<PiiTable
  originalData={piiDemoData.fab}
  maskedData={maskedData}
  fieldConfigs={fabFieldConfigs}
/>
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Server Components for D3 Pages

**What:** Trying to make page components server-rendered and only wrapping individual D3 charts in client boundaries.

**Why bad:** In this project, every page either has D3 charts (needs `useEffect`, `useRef`, DOM access) or interactive shadcn/ui components (needs event handlers). The overhead of boundary management creates complexity with zero benefit — there is no server-fetchable data to optimize (data is hardcoded). You end up with dozens of "use client" wrappers for no SSR gain.

**Instead:** Make the entire `(authenticated)` layout a client component. Accept that this is a client-heavy dashboard application. The root layout provides enough SSR for metadata/SEO.

### Anti-Pattern 2: React Query for Hardcoded Data

**What:** Wrapping hardcoded data imports in React Query hooks with fake API endpoints.

**Why bad:** Adds unnecessary abstraction (query keys, loading states, cache invalidation) for data that never changes. The data is `import`-ed, not `fetch`-ed. React Query solves problems this POC does not have.

**Instead:** Direct `import` from `data/*.ts` files. Use React Query only if the 2 Supabase-backed endpoints (users, queries) need caching/refetching — and even then, plain `useEffect` + `useState` is sufficient for a POC with 5 users and minimal query history.

### Anti-Pattern 3: Global RBAC Context

**What:** Creating a global React Context for the RBAC role that wraps the entire app.

**Why bad:** The role selector is a demo feature isolated to the Query Console page. Making it global implies it affects routing, sidebar visibility, or data fetching — which it does not. It only affects PII masking in one table on one page.

**Instead:** Keep role state as `useState` inside the Query Console page component. Pass it down as props to RoleMaskingSimulator, PiiDemoTabs, and PiiTable.

### Anti-Pattern 4: Inline D3 in Page Components

**What:** Writing D3 rendering logic directly inside page components instead of extracting chart components.

**Why bad:** Page components become 500+ line monsters. Charts become untestable. Shared patterns (cleanup, resize, tooltip) get copy-pasted. Theme changes require editing 6 files.

**Instead:** Every D3 visualization is its own component in `components/charts/{page}/`. Shared utilities in `components/charts/shared/`. Page components are layout + data orchestration only.

### Anti-Pattern 5: D3 Managing React State

**What:** Using D3 to update React state (e.g., `d3.select(...).on("click", () => setState(...))`).

**Why bad for most cases:** Creates bidirectional data flow between D3's DOM manipulation and React's virtual DOM. Can cause infinite re-render loops if state change triggers useEffect that re-renders the chart.

**Instead:** Use D3 for rendering only. For interactions that need to update React state (like node selection in ClusterTopology), use a stable callback ref:

```typescript
// Safe: callback doesn't change, won't trigger re-render of D3
const onNodeSelect = useCallback((nodeId: string) => {
  setSelectedNode(nodeId);
}, []);

// In useEffect, attach D3 event with stable reference
node.on("click", (event, d) => onNodeSelect(d.id));
```

---

## Component Communication Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    Communication Flows                           │
│                                                                 │
│  ThemeProvider ──context──→ All Components                      │
│       ↑                                                         │
│  Theme Toggle (HeaderBar)                                       │
│                                                                 │
│  PasswordGate ──auth state──→ HeaderBar (role indicator)        │
│                                                                 │
│  AppSidebar ──navigation──→ Next.js Router ──page──→ Page Comp  │
│       ↑                                                         │
│  CommandPalette ──navigate──→ Next.js Router                    │
│                                                                 │
│  Page Component ──props──→ D3 Chart Components                  │
│       │                    ↑                                    │
│       │              chart-utils.ts (shared)                    │
│       │              chart-theme.ts (shared)                    │
│       │              chart-tooltip.ts (shared)                  │
│       │                                                         │
│  Page Component ──props──→ shadcn/ui Components                 │
│       │                                                         │
│  data/*.ts ──import──→ Page Component                           │
│                                                                 │
│  Supabase Client ──fetch──→ UserManagement, QueryConsole        │
│                                                                 │
│  ┌─ Query Console Internal ──────────────────────────┐         │
│  │  role (useState) ──→ applyMasking() ──→ PiiTable  │         │
│  │       ↑                                            │         │
│  │  RoleMaskingSimulator (Select onChange)            │         │
│  └────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Scalability Considerations

| Concern | POC (current) | Production (future) | Notes |
|---------|--------------|---------------------|-------|
| Data source | Hardcoded files | Real Dgraph + PostgreSQL API | Would need React Query, loading/error states |
| D3 chart count | 19 charts, static data | Same charts, real-time data | Would need WebSocket/SSE, data update diffing |
| RBAC | Client-side simulation | Server-side enforcement | Supabase RLS policies, Dgraph ACL integration |
| Auth | Password gate (sessionStorage) | Supabase Auth (JWT) | Already have middleware infrastructure |
| Theme | CSS vars + class toggle | Same approach scales fine | No change needed |
| Bundle size | ~19 D3 chart components loaded | Dynamic import per page | Next.js automatic code splitting by route handles this |

---

## Build Order (Dependencies Between Components)

### Phase Dependency Graph

```
Phase 1: Foundation
  ├── shadcn/ui init (17 components)
  ├── CSS token system (globals.css)
  ├── ThemeProvider + theme toggle
  ├── types/index.ts (Role, PiiLevel, data types)
  └── lib/utils.ts (cn helper)
       │
       ▼
Phase 2: Layout Shell
  ├── PasswordGate (needs: types, shadcn input/button)
  ├── AppSidebar (needs: shadcn sidebar/collapsible, ThemeProvider)
  ├── HeaderBar (needs: shadcn breadcrumb/button, ThemeProvider)
  ├── (authenticated)/layout.tsx (needs: all above)
  ├── WelcomePopup (needs: shadcn dialog)
  └── CommandPalette (needs: shadcn command)
       │
       ▼
Phase 3: Chart Infrastructure
  ├── chart-utils.ts (cleanupD3Svg, formatNumber)
  ├── chart-theme.ts (getChartColors, isLightTheme)
  └── chart-tooltip.ts (createTooltip, positionTooltip)
       │
       ▼
Phase 4-7: Pages (can be built in parallel after Phase 3)

  Phase 4: Dashboard (/) — 5 D3 charts
    ├── data/dashboard-data.ts
    ├── D3ResourceGauge (simplest chart — good first)
    ├── D3DualLineChart
    ├── D3ChordDiagram
    ├── D3NodeScatter
    └── D3ResourceBars

  Phase 5: DGraph Monitoring — 3 D3 charts (HARDEST)
    ├── data/dgraph-data.ts
    ├── D3ClusterTopology (force sim + particles + drag + zoom)
    ├── D3QueryScatter (brushable)
    └── D3ShardBars

  Phase 6: GPU Monitoring — 4 D3 charts
    ├── data/gpu-data.ts
    ├── D3PerformanceTrends
    ├── D3GpuHeatmap
    ├── D3GpuRidgeline
    └── D3GpuComparisonBars

  Phase 7: Ontology Studio — 2 D3 charts
    ├── data/studio-data.ts
    ├── D3OntologyGraph (3 layout modes — 2nd hardest)
    └── D3TypeDistribution

  Phase 8: Query Console + RBAC — 5 D3 charts + PII system
    ├── data/query-data.ts + data/pii-config.ts
    ├── lib/pii-masking.ts
    ├── D3ForceGraph, D3Treemap, D3ArcDiagram, D3QueryScatterView, D3QueryDistribution
    ├── RoleMaskingSimulator, PiiTable, PiiDemoTabs
    └── Query editor + template selector + history (Supabase)

  Phase 9: User Management — No D3, Supabase API
    ├── User table (Supabase fetch)
    └── Role badges + tooltips

  Phase 10: Data Seeding
    └── Supabase seed script (clusters, nodes, gpus, users, queries, etc.)
```

### Critical Path Analysis

The critical path is: **Phase 1 → Phase 2 → Phase 3 → Phase 5 (DGraph)**

Phase 5 (DGraph Monitoring) is the highest-risk phase because:
1. `D3ClusterTopology` is the most complex chart (force simulation + particle animation + drag + zoom + 2 layout modes)
2. It exercises every shared utility (cleanup, theme, tooltip)
3. If the chart infrastructure (Phase 3) has design flaws, they surface here

**Recommendation:** Build the Dashboard page (Phase 4) first to validate the chart template pattern on simpler charts, then tackle DGraph (Phase 5) second while the pattern is fresh.

### What Can Be Parallelized

After Phase 3 (Chart Infrastructure), Phases 4-7 have zero dependencies on each other. They can be built in any order or simultaneously. Phase 8 (Query Console) depends on `lib/pii-masking.ts` and `data/pii-config.ts` but those can be built alongside its charts. Phase 9 (User Management) is independent of all chart work.

---

## Sources

- PRD v1.3: `/Users/chs/Downloads/exemble-ontology-docs-v1.3/01_PRD.md`
- D3 Visualization Spec v1.2: `/Users/chs/Downloads/exemble-ontology-docs-v1.3/03_D3-Visualization-Spec.md`
- Implementation Guide v1.1: `/Users/chs/Downloads/exemble-ontology-docs-v1.3/04_Implementation-Guide.md`
- Data Schema v1.3: `/Users/chs/Downloads/exemble-ontology-docs-v1.3/02_Data-Schema.md`
- Existing codebase: `/Users/chs/Desktop/Claude/Ontology/src/`
- D3.js + React integration patterns: Based on D3 v7 imperative approach with React hooks (well-established community pattern since 2020, stable through React 19)
- Next.js App Router client/server boundaries: Based on Next.js 14-16 App Router documentation patterns

**Confidence notes:**
- HIGH confidence on D3+React patterns — these are mature, well-documented patterns unchanged since D3 v7 + React hooks
- HIGH confidence on file structure — adapted directly from PRD Implementation Guide, mapped to Next.js App Router conventions
- HIGH confidence on client/server boundaries — follows from D3's fundamental need for DOM access
- MEDIUM confidence on Next.js 16 `middleware.ts` deprecation — the codebase concerns note mentions it, and the POC may need to address this during Phase 1 if proxy pattern is required; however, for a POC this may be acceptable to defer

---

*Architecture analysis: 2026-02-19*
