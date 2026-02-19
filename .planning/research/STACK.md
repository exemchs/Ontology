# Technology Stack

**Project:** eXemble Ontology Platform (Graph DB Monitoring Dashboard)
**Researched:** 2026-02-19
**Research mode:** Brownfield (adapting to existing Next.js 16 + Supabase stack)
**Alignment:** Consistent with ARCHITECTURE.md, FEATURES.md, and PITFALLS.md from same research session.

---

## Verified Existing Stack (DO NOT CHANGE)

These are already installed and confirmed from `node_modules`:

| Technology | Installed Version | Purpose | Verified |
|------------|------------------|---------|----------|
| Next.js | 16.1.6 | App Router framework | node_modules/next/package.json |
| React | 19.2.3 | UI library | node_modules/react/package.json |
| Tailwind CSS | 4.2.0 | Utility-first CSS (CSS-first config, no tailwind.config.js) | node_modules/tailwindcss/package.json |
| @tailwindcss/postcss | ^4 | PostCSS integration for Tailwind v4 | postcss.config.mjs |
| @supabase/supabase-js | 2.97.0 | Supabase client SDK | node_modules/@supabase/supabase-js/package.json |
| @supabase/ssr | 0.8.0 | SSR-compatible Supabase auth/sessions | node_modules/@supabase/ssr/package.json |
| TypeScript | 5.9.3 | Type safety | node_modules/typescript/package.json |
| ESLint | ^9 | Linting (with eslint-config-next) | package.json |

**Deployment:** Vercel (auto-deploy on push to `main`), production at https://ontology-eta.vercel.app
**Supabase setup:** Browser client, Server client, and middleware session refresh already scaffolded in `src/utils/supabase/`.
**Font:** Geist Sans (via `next/font/google`), already configured in `src/app/layout.tsx`.

---

## Recommended Stack Additions

### Layer 1: D3.js Visualization (19 chart components)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| d3 | ^7.9.0 | Core visualization library | D3 v7 is the current stable major. Full ESM, tree-shakeable. 19 chart components need force simulations, treemaps, chord diagrams, heatmaps, ridgeline plots, arc diagrams, scatter plots with brush -- no wrapper library covers all of these. | HIGH |
| @types/d3 | ^7.4.3 | TypeScript definitions | DefinitelyTyped provides comprehensive D3 v7 types. Essential for strict TypeScript (project has `"strict": true`). | HIGH |

**Why D3 v7, not alternatives:**

| Alternative | Why Not for This Project |
|-------------|--------------------------|
| Recharts | Cannot do force-directed graphs, chord diagrams, treemaps, ridgeline plots, arc diagrams, or heatmaps. Covers maybe 3 of the 19 charts. |
| Visx (Airbnb) | React-aware but still too opinionated. The PRD specifies exact D3 rendering patterns (cleanupD3Svg, destroyedRef, ResizeObserver) that Visx would fight. |
| Observable Plot | Exploratory analysis tool, wrong for production dashboards with specific design requirements. |
| ECharts | Configuration-driven API. Custom particle animations on topology links (d3.timer), BFS radial layout, and the specific interaction patterns cannot be expressed in ECharts config. |
| Cytoscape.js | Graph-only. This project also needs line charts, gauges, heatmaps, chord diagrams, etc. |
| react-force-graph | Wraps D3-force but hides internals needed for custom node rendering, particle animation, and dual layout modes. |

**D3 Integration Pattern for This Project:**

The ARCHITECTURE.md and PITFALLS.md establish the D3 pattern for this project: **full imperative D3 inside `useEffect`, isolated to a ref-contained container.** This differs from the "D3 for math, React for rendering" pattern because:

1. ALL 6 pages are client components (no SSR benefit to preserve)
2. The PRD's chart template requires `cleanupD3Svg()`, `destroyedRef`, `ResizeObserver` -- pure imperative D3
3. Force simulations, particle animations (`d3.timer`), brushes, and zoom behaviors all need imperative DOM access
4. 19 charts with this pattern is manageable with shared utilities (`chart-utils.ts`, `chart-theme.ts`, `chart-tooltip.ts`)

```typescript
// The project's D3 chart pattern (from ARCHITECTURE.md Pattern 1)
"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { cleanupD3Svg } from "@/components/charts/shared/chart-utils";
import { getChartColors } from "@/components/charts/shared/chart-theme";

export function D3ExampleChart({ data }: { data: ExampleData[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || data.length === 0) return;
    const destroyedRef = { current: false };
    const colors = getChartColors();

    const observer = new ResizeObserver((entries) => {
      if (destroyedRef.current) return;
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) renderChart(width, height);
      }
    });

    function renderChart(width: number, height: number) {
      if (destroyedRef.current) return;
      cleanupD3Svg(container);
      const svg = d3.select(container).append("svg")
        .attr("width", width).attr("height", height);
      // ... D3 rendering logic
    }

    observer.observe(container);
    return () => {
      destroyedRef.current = true;
      observer.disconnect();
      if (container) cleanupD3Svg(container);
    };
  }, [data]);

  return <div ref={containerRef} className="w-full h-full min-h-[200px]" />;
}
```

**D3 Sub-modules Used by This Project:**

| Module | Chart Components That Use It |
|--------|------------------------------|
| d3-selection | All 19 charts (svg creation, element manipulation) |
| d3-scale | All charts with axes (linear, ordinal, time, band, sequential) |
| d3-axis | Charts with visible axes (~12 charts) |
| d3-shape | Line charts, arc gauge, chord diagram, area charts |
| d3-force | D3ClusterTopology, D3OntologyGraph, D3ForceGraph (3 components) |
| d3-hierarchy | D3Treemap, D3OntologyGraph (hierarchy mode) |
| d3-zoom | D3ClusterTopology, D3OntologyGraph (2 components) |
| d3-drag | D3ClusterTopology, D3OntologyGraph (2 components) |
| d3-brush | D3QueryScatter (brushable scatter) |
| d3-chord | D3ChordDiagram |
| d3-array | All charts (extent, max, min, bin, rollup) |
| d3-transition | Charts with animated updates |
| d3-timer | D3ClusterTopology (particle animation on links) |
| d3-interpolate | Color interpolation in heatmaps, gauges |
| d3-color | Theme-aware color manipulation |
| d3-time-format | Time-series chart axes |
| d3-contour | D3GpuRidgeline (kernel density estimation) |

**Install the full `d3` package** (not individual sub-modules). Sub-module version alignment across 17 modules is fragile. The full package is ~30KB gzipped and tree-shakes well. Import from sub-module paths for clarity:

```typescript
import { forceSimulation, forceLink, forceManyBody } from "d3-force";
import { scaleLinear, scaleOrdinal } from "d3-scale";
```

---

### Layer 2: shadcn/ui Component Library (17 components)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| shadcn/ui | latest CLI | Pre-built accessible UI components | CLI copies component source code into project. Full ownership. Built on Radix UI + Tailwind CSS. Tailwind v4 supported. | MEDIUM |
| @radix-ui/* | (installed per-component by shadcn CLI) | Headless accessible primitives | shadcn components wrap Radix for accessibility (keyboard nav, ARIA, focus management). | HIGH |
| lucide-react | (installed by shadcn CLI) | Icon library | Default shadcn icon set. Tree-shakeable. Consistent design. | HIGH |
| class-variance-authority | (installed by shadcn CLI) | Component variants | Powers size/color/state variants in shadcn components. | HIGH |
| clsx + tailwind-merge | (installed by shadcn CLI) | Class merging | `cn()` utility for conditional/merged Tailwind classes. | HIGH |

**17 shadcn/ui Components Needed** (from ARCHITECTURE.md):

| Component | Used By | Primary Purpose |
|-----------|---------|-----------------|
| button | All pages | Actions, toggles, form submission |
| input | PasswordGate, Query Console | Text input |
| card | Dashboard, all pages | Container for charts and metrics |
| badge | Dashboard, Users, Alerts | Status indicators, role labels |
| dialog | Studio (type edit), Welcome popup | Modal overlays |
| tabs | Query Console (5 result tabs), GPU (chart toggle) | Content switching |
| table | Users, Query Console (PII table, history) | Tabular data display |
| select | Query Console (role picker, template picker) | Dropdown selection |
| tooltip | Header, Sidebar, charts | Hover information |
| sidebar | Dashboard layout | Main navigation (280px, collapsible) |
| command | Header (Cmd+K palette) | Keyboard-driven search/navigation |
| scroll-area | Sidebar, long content panels | Custom scrollbars |
| separator | Sidebar, cards | Visual dividers |
| dropdown-menu | Header, context actions | Menu overlays |
| breadcrumb | Header | Navigation context |
| collapsible | Sidebar groups | Expand/collapse nav sections |
| switch | Settings, chart toggles | Boolean toggles |
| textarea | Query Console (query editor) | Multi-line text |
| toaster (sonner) | App-wide | Toast notifications |

**shadcn/ui + Tailwind CSS v4 Setup:**

Tailwind v4 uses CSS-first configuration. No `tailwind.config.js`. The shadcn CLI detects Tailwind v4 and generates correct `@theme` directives in `globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.141 0.004 285.823);
  --color-primary: oklch(0.21 0.006 285.885);
  /* ... 40+ CSS custom properties for shadcn theming */

  /* Chart-specific tokens (added for D3 color consistency) */
  --color-chart-1: oklch(0.646 0.222 41.116);
  --color-chart-2: oklch(0.6 0.118 184.714);
  --color-chart-3: oklch(0.398 0.07 227.392);
  --color-chart-4: oklch(0.828 0.189 84.429);
  --color-chart-5: oklch(0.769 0.188 70.08);
  /* Extended palette for 19 charts */
  --color-chart-6: ...;
  --color-chart-7: ...;
  --color-chart-8: ...;
}
```

**CRITICAL VALIDATION STEP:** Run `npx shadcn@latest init` as the very first Phase 1 action. This is the highest-risk integration point. If the CLI does not correctly detect Tailwind CSS 4.2.0, manual configuration will be needed. See PITFALLS.md Pitfall 7 for Tailwind v4 specifics.

---

### Layer 3: State Management (Minimal)

**This project deliberately avoids heavyweight state management libraries.** The ARCHITECTURE.md establishes three data lanes:

| Data Lane | Mechanism | Why This, Not a Library |
|-----------|-----------|------------------------|
| Lane 1: Hardcoded data (majority) | Direct `import` from `src/data/*.ts` | Static data imported at build time. No fetching, no loading states, no caching needed. React Query / SWR would add unnecessary abstraction. |
| Lane 2: Supabase API (users + queries only) | `useEffect` + `useState` with Supabase browser client | Only 2 simple fetches across the entire app. No polling, no mutations, no caching requirements. `useEffect` + `useState` is the right tool for this scope. |
| Lane 3: Client state (theme, auth, role) | React Context + `useState` | Theme toggle (global context), password gate (sessionStorage + useState), RBAC role selector (page-local useState in Query Console). No cross-page state sharing needed. |

**What NOT to install for state management:**

| Library | Why Not |
|---------|---------|
| @tanstack/react-query | Only 2 Supabase calls in the entire app. React Query's value (caching, polling, refetch) is not needed. Would add 12KB+ for no benefit. |
| zustand | No cross-page state. Theme/auth use React Context. RBAC role is page-local useState. Zustand adds a paradigm without a problem to solve. |
| redux / @reduxjs/toolkit | Massive overkill. |
| jotai / recoil | Atomic state management for a POC with 3 state concerns is over-engineering. |
| swr | Same reasoning as React Query. Not enough Supabase calls to justify. |

**If the project scope expands** (real-time data, many Supabase calls, cross-page state), revisit this decision. For the POC, simplicity wins.

---

### Layer 4: Development Dependencies

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| prettier | ^3.4.0 | Code formatting | 50+ component files need consistent formatting. | HIGH |
| prettier-plugin-tailwindcss | ^0.6.0 | Auto-sort Tailwind classes | Ensures consistent class ordering across all components. Works with Tailwind v4. | MEDIUM |
| @next/bundle-analyzer | ^16.0.0 | Bundle size analysis | Critical for monitoring D3 bundle impact. Run `ANALYZE=true npm run build` to visualize. | MEDIUM |

**What NOT to install as dev dependencies:**

| Library | Why Not |
|---------|---------|
| @faker-js/faker | Data is hardcoded in `src/data/*.ts` files with realistic semiconductor FAB values. No generation needed. |
| jest / vitest | POC with mostly hardcoded data and no complex business logic. Manual testing + visual inspection is sufficient. |
| storybook | Not needed for a 6-page POC with a single developer. |
| husky + lint-staged | Nice for teams, unnecessary overhead for POC velocity. |

---

## Complete Dependency List

### Production Dependencies (to install)

```bash
# D3 visualization
npm install d3

# shadcn/ui (CLI-based, installs Radix + utilities automatically)
npx shadcn@latest init
npx shadcn@latest add button input card badge dialog tabs table select \
  tooltip sidebar command scroll-area separator dropdown-menu breadcrumb \
  collapsible switch textarea sonner
```

### Dev Dependencies (to install)

```bash
npm install -D @types/d3 prettier prettier-plugin-tailwindcss @next/bundle-analyzer
```

### Already Installed (no action needed)

```
next@16.1.6  react@19.2.3  react-dom@19.2.3
@supabase/supabase-js@2.97.0  @supabase/ssr@0.8.0
tailwindcss@4.2.0  @tailwindcss/postcss@^4
typescript@5.9.3  eslint@^9  eslint-config-next@16.1.6
```

### Total New Dependencies

| Category | Count | Estimated Bundle Impact |
|----------|-------|------------------------|
| d3 (production) | 1 package (meta-package of ~30 sub-modules) | ~30KB gzipped (tree-shakes to ~15-20KB actual usage) |
| shadcn/ui components | 0 npm packages (source code copied into project) | 0KB overhead (compiled with project bundle) |
| Radix UI primitives | ~17 packages (installed by shadcn CLI per component) | ~2-5KB gzipped per component used |
| lucide-react icons | 1 package | ~1KB per icon used (tree-shakeable) |
| CVA + clsx + tailwind-merge | 3 packages | ~3KB gzipped total |
| Dev-only | 4 packages | 0KB (not in production bundle) |

**Total production bundle addition estimate:** ~60-80KB gzipped. Acceptable for a monitoring dashboard.

---

## Alternatives Considered and Rejected

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Visualization | D3.js v7 | Recharts | Covers 3 of 19 chart types. Cannot do force graphs, treemaps, chord diagrams, ridgeline, heatmaps, arc diagrams. |
| Visualization | D3.js v7 | Visx (Airbnb) | Fights the established D3 chart template pattern (cleanupD3Svg, destroyedRef, ResizeObserver). |
| Visualization | D3.js v7 | ECharts | Cannot express custom particle animations, BFS radial layouts, or the specific interaction patterns in the PRD. |
| UI Components | shadcn/ui | Material UI (MUI) | Heavy bundle (100KB+), opinionated Material Design clashes with EXEM branding. |
| UI Components | shadcn/ui | Ant Design | Enterprise-oriented but heavy, CJK font handling issues, hard to customize. |
| UI Components | shadcn/ui | Chakra UI | Runtime CSS-in-JS (Emotion), conflicts with Tailwind CSS approach. |
| UI Components | shadcn/ui | Headless UI (Tailwind Labs) | Fewer components (no sidebar, command, table, breadcrumb). Would need to build more from scratch. |
| Data Fetching | useEffect + useState | React Query v5 | Only 2 Supabase calls. Not enough usage to justify the library. |
| Data Fetching | useEffect + useState | SWR | Same reasoning. |
| State | React Context + useState | Zustand | No cross-page state. 3 state concerns, all simple. |
| State | React Context + useState | Redux | Massive overkill for POC scope. |
| Dates | D3 d3-time-format + Intl | date-fns | D3 already handles time axis formatting. `Intl.DateTimeFormat` handles UI text. No need for a third date library. |
| Icons | Lucide React | Heroicons | Lucide is shadcn/ui default, more icons (1500+), consistent with component library. |
| CSS | Tailwind CSS 4 (existing) | CSS Modules | Already have Tailwind; CSS Modules would create inconsistency. |
| Animation | D3 transitions + CSS | Framer Motion | D3 handles all chart animations. CSS transitions handle UI animations. Framer Motion (30KB+) adds weight without value. |
| Auth | Supabase Auth (existing) | NextAuth/Auth.js | @supabase/ssr already handles sessions. Adding NextAuth duplicates auth infrastructure. |
| ORM | Supabase client (existing) | Prisma | Supabase PostgREST + RLS is the database access pattern. Prisma adds an unnecessary abstraction layer that conflicts with RLS. |
| API | Next.js API Routes / Server Actions | tRPC | 2 simple Supabase calls do not warrant an RPC framework. |

---

## What NOT to Install (Explicit Exclusion List)

| Library | Why Not |
|---------|---------|
| chart.js / react-chartjs-2 | D3 covers all charting needs. Two viz libraries = two paradigms. |
| framer-motion | 30KB+. D3 transitions + CSS transitions cover all animation needs. |
| axios | `fetch` is built in. Supabase client handles DB calls. |
| lodash | Modern JS (`Object.entries`, `Array.flat`, `structuredClone`) + d3-array covers utility needs. |
| moment.js / dayjs / date-fns | D3's `d3-time-format` handles chart axes. `Intl.DateTimeFormat` handles UI dates. |
| styled-components / emotion | Tailwind CSS is the styling solution. CSS-in-JS conflicts with it. |
| react-router | Next.js App Router IS the router. |
| next-auth / auth.js | @supabase/ssr already handles auth. |
| socket.io | Supabase Realtime provides WebSocket when needed (future). |
| graphql / @apollo/client | Supabase PostgREST is sufficient. No GraphQL needed. |
| @tanstack/react-query | Only 2 Supabase fetches. Insufficient usage to justify. |
| zustand / jotai / recoil | No cross-page state management needed. |
| @faker-js/faker | Data is handcrafted in `src/data/*.ts` for semiconductor FAB realism. |
| i18next / react-intl | Korean-first POC. Hardcode Korean strings. No i18n framework needed. |
| tailwindcss-animate | shadcn/ui in Tailwind v4 mode uses CSS animations directly, not this plugin. |

---

## Installation Plan (Phased)

### Phase 1: Foundation (Day 1)

```bash
# 1. Initialize shadcn/ui (VALIDATES Tailwind v4 compatibility)
npx shadcn@latest init

# 2. Install core shadcn components for layout shell
npx shadcn@latest add button input card sidebar command breadcrumb \
  collapsible separator scroll-area dropdown-menu tooltip switch sonner

# 3. Install D3 for chart development
npm install d3
npm install -D @types/d3

# 4. Install dev tooling
npm install -D prettier prettier-plugin-tailwindcss @next/bundle-analyzer
```

### Phase 2-3: As Pages Are Built

```bash
# Add shadcn components as pages need them
npx shadcn@latest add badge          # Dashboard metric cards
npx shadcn@latest add tabs           # Query Console result tabs, GPU toggle
npx shadcn@latest add table          # Users page, PII table
npx shadcn@latest add dialog         # Studio type editor, Welcome popup
npx shadcn@latest add select         # Query Console role/template picker
npx shadcn@latest add textarea       # Query Console editor
```

**Rationale for phased installation:** Only install components when needed. This avoids 17 unused component files sitting in `src/components/ui/` during early development, and ensures each component is validated against Tailwind v4 as it's added.

---

## Tailwind CSS v4 Configuration Notes

The project uses Tailwind CSS 4.2.0 with `@tailwindcss/postcss`. Key differences from v3 that affect development:

| Aspect | Tailwind v3 (old) | Tailwind v4 (this project) |
|--------|-------------------|---------------------------|
| Config file | `tailwind.config.js` | No config file. `@theme { }` in CSS. |
| Custom colors | `theme.extend.colors` in JS | `--color-*` in `@theme { }` |
| Arbitrary values | `bg-[--brand]` | `bg-(--brand)` (parentheses, not brackets) |
| Default border color | `gray-200` | `currentColor` (must specify color explicitly) |
| Shadow scale | `shadow-sm` was small | `shadow-sm` = old `shadow`. `shadow-xs` = old `shadow-sm`. |
| Ring width | `ring` = 3px | `ring` = 1px. Use `ring-3` for old behavior. |
| Plugin system | `require()` in config | `@plugin` directive in CSS |
| Content detection | Explicit `content: [...]` in config | Automatic detection |

**D3 + Tailwind v4 Color Bridge:**

```typescript
// src/components/charts/shared/chart-theme.ts
export function getChartColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    chart1: style.getPropertyValue("--color-chart-1").trim(),
    chart2: style.getPropertyValue("--color-chart-2").trim(),
    // ... 8 chart colors
    text: style.getPropertyValue("--color-foreground").trim(),
    textSecondary: style.getPropertyValue("--color-muted-foreground").trim(),
    border: style.getPropertyValue("--color-border").trim(),
    background: style.getPropertyValue("--color-background").trim(),
  };
}
```

This bridges Tailwind's CSS custom properties to D3's imperative color assignments. Charts call `getChartColors()` inside `useEffect` to get theme-aware colors. When the user toggles dark/light mode, charts re-render with updated colors.

---

## Supabase Schema Approach

**Minimal schema for POC** (only 2 tables actually hit by the app):

| Table | Purpose | Accessed By |
|-------|---------|-------------|
| `users` | User list with roles for admin page | User Management page (useEffect + useState) |
| `queries` | Query history for query console | Query Console page (useEffect + useState) |

**All other data is hardcoded** in `src/data/*.ts`:
- `dashboard-data.ts` -- Metrics, gauges, chord data
- `dgraph-data.ts` -- Cluster topology, node metrics
- `gpu-data.ts` -- GPU cards, heatmap data, ridgeline data
- `studio-data.ts` -- 6 ontology types
- `query-data.ts` -- Sample query results + PII demo data

**RLS is NOT needed for the POC.** RBAC masking is simulated client-side (see PITFALLS.md Pitfall 15). Supabase tables use the anon key for public read access. In production, RLS policies would enforce server-side data filtering.

---

## Version Pinning Strategy

Use caret ranges (`^`) for all packages. POC benefits from latest patches. Lock file (`package-lock.json`) provides reproducibility.

**Version guardrails:**
- If D3 v8 releases during development, stay on v7. Major version upgrades during active development break charts.
- If React 20 appears, stay on 19.x. The project is built for React 19's event system.
- shadcn/ui components are source code, not a versioned dependency. Once added, they don't auto-update.

---

## Sources & Confidence

| Claim | Source | Confidence |
|-------|--------|------------|
| Existing stack versions | Verified from `node_modules/*/package.json` | HIGH |
| D3 v7.9.0 is current stable | Training data (May 2025). D3 v7 has been stable since 2021. | MEDIUM |
| D3 imperative pattern in React | Established in ARCHITECTURE.md Pattern 1, derived from PRD Implementation Guide. Consistent with D3 official React guide at d3js.org/getting-started. | HIGH |
| shadcn/ui supports Tailwind CSS v4 | Training data. shadcn/ui added Tailwind v4 support in 2024-2025. Needs runtime validation via `npx shadcn@latest init`. | MEDIUM |
| Tailwind v4 CSS-first config | Verified: `postcss.config.mjs` uses `@tailwindcss/postcss`, no `tailwind.config.js` exists. Verified against official upgrade guide. | HIGH |
| No React Query needed | Established in ARCHITECTURE.md: only 2 Supabase calls, `useEffect` + `useState` is sufficient. | HIGH |
| No Zustand needed | Established in ARCHITECTURE.md: no cross-page state, 3 simple state concerns handled by Context + useState. | HIGH |
| Bundle size estimates | Training data, approximate. | LOW |
| shadcn component list (17) | Derived from ARCHITECTURE.md file structure analysis. | HIGH |

**Highest-risk uncertainty:** shadcn/ui CLI behavior with Tailwind CSS 4.2.0. Validate by running `npx shadcn@latest init` as the very first action in Phase 1. If it fails, fall back to manual component installation with Tailwind v4 adaptations.

**Second-highest risk:** `@types/d3` version compatibility with D3 v7.9.0+. DefinitelyTyped can lag behind D3 releases. If type errors occur, use `// @ts-expect-error` sparingly or pin `@types/d3` to a known-good version.

---

*Stack research: 2026-02-19. Aligned with ARCHITECTURE.md, FEATURES.md, PITFALLS.md from same research session.*
