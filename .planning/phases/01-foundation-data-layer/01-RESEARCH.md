# Phase 1: Foundation & Data Layer - Research

**Researched:** 2026-02-19
**Domain:** CSS token system, shadcn/ui + Tailwind CSS 4, dark/light theme, D3 chart utilities, TypeScript types, Supabase schema/seed, hardcoded data files, loading/empty state UX
**Confidence:** HIGH (verified against existing codebase, exem-ui source, official docs, PRD specs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- exem-ui 글로벌 CSS 변수 기반으로 구축하되, eXemble만의 아이덴티티를 추가
- 블루 계열 액센트 컬러로 exemONE 등 기존 EXEM 제품과 차별화
- EXEM 패밀리 느낌은 유지하면서 eXemble 고유 브랜드 표현
- PRD의 chart series 8색, primitive/semantic 토큰 구조는 유지
- 다크 모드를 기본값으로 설정 (defaultTheme="dark")
- 라이트 모드 전환 지원 (토글)
- D3 차트도 테마 전환에 즉시 반응해야 함
- PRD에 정의된 데이터를 그대로 사용 (이미 충분히 상세함)
- SK실트론 FAB 맥락 (SKS-FAB1-PROD, 장비명, 위치, 온톨로지 타입 등) PRD 그대로 반영
- 페이지 로드 시 약간의 랜덤 변동으로 '살아있는' 데이터 느낌 (실시간 모니터링 시뮬레이션)
- 하드코딩 데이터에 타임스탬프/값에 미세한 jitter 적용하여 생동감

### Claude's Discretion
- Supabase 스키마 세부 구조 (PRD 8테이블 기반, Next.js/Supabase에 맞게 조정)
- 시드 데이터 삽입 전략 (SQL migration vs seed script)
- D3 차트 공통 유틸리티 구체적 API 설계 (cleanupD3Svg, destroyedRef, ResizeObserver)
- 로딩 스켈레톤/빈 상태 디자인
- shadcn/ui + Tailwind CSS 4 호환성 검증 방식

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUN-01 | D3.js v7 + shadcn/ui 17종 설치 및 초기화 | Standard Stack section: D3 v7.9.0 install, shadcn CLI init with Tailwind v4, 17 component list |
| FOUN-02 | exem-ui CSS 토큰 시스템 (primitive + semantic + chart series 8색) | Architecture Patterns: exem-ui global.css analyzed, blue accent strategy, chart series color design |
| FOUN-03 | 다크/라이트 테마 시스템 (ThemeProvider, CSS variables) | Code Examples: next-themes setup, ThemeProvider pattern, CSS variable dark/light mapping |
| FOUN-04 | TypeScript 타입 정의 (Role, PiiLevel, OntologyType, ClusterNode 등) | Code Examples: type definitions from PRD Data Schema |
| FOUN-05 | D3 차트 공통 유틸리티 (cleanupD3Svg, destroyedRef, ResizeObserver 패턴) | Architecture Patterns: chart-utils.ts API design, cleanup patterns from D3 Viz Spec |
| FOUN-06 | D3 차트 테마 유틸리티 (CSS variable 기반 색상 resolve) | Architecture Patterns: chart-theme.ts getChartColors() with CSS var resolution |
| FOUN-07 | D3 Tooltip 공통 컴포넌트 | Architecture Patterns: chart-tooltip.ts pattern from D3 Viz Spec section 1.7 |
| DATA-01 | Supabase 스키마 (8테이블) | Recommendations: Supabase SQL migration approach, snake_case adaptation, RLS considerations |
| DATA-02 | 시드 데이터 (SKS-FAB1-PROD, 12노드, 4GPU, 6 온톨로지 타입, 5 유저) | Recommendations: Single SQL migration with schema + seed data combined |
| DATA-03 | 클라이언트 하드코딩 데이터 (5 data files) | Architecture Patterns: data file structure, jitter utility for live feel |
| DATA-04 | PII 데모 데이터 (FAB + General 시나리오) | Code Examples: piiDemoData structure from Data Schema doc section 4 |
| UX-01 | D3 차트 로딩 상태 | Recommendations: Skeleton component pattern using shadcn Card + animated pulse |
| UX-02 | D3 차트 빈 상태 | Recommendations: EmptyState component with icon + message pattern |
| UX-03 | data-testid 속성 | Convention: `{action}-{target}` pattern from PRD |
</phase_requirements>

---

## Summary

Phase 1 builds the complete foundation for the eXemble Ontology Platform. The existing codebase is a bare Next.js 16.1.6 scaffold with Supabase client utilities already configured, Tailwind CSS 4.2.0 with `@tailwindcss/postcss`, and a minimal `globals.css` with only `@import "tailwindcss"`. Everything else must be built from scratch.

The highest-risk action is `npx shadcn@latest init` -- this must be the very first step to validate shadcn/ui compatibility with Tailwind CSS 4.2.0. shadcn/ui has officially added Tailwind v4 support with a new CSS structure using `@theme inline` directives and OKLCH colors, replacing the old HSL-in-`@theme` pattern. The animation library has changed from `tailwindcss-animate` to `tw-animate-css`. This is the point-of-no-return compatibility check.

The color system requires a deliberate architectural bridge: exem-ui's primitive tokens (20 color scales, 11 shades each) serve as the foundation, while eXemble adds a blue accent identity layer (using exem-ui's `--color-blue-*` scale instead of the sky scale used by other EXEM products). The semantic tokens must map to both shadcn/ui's expected variables (via `@theme inline`) AND the exem-ui semantic layer, creating a three-tier system: exem-ui primitives -> eXemble semantics -> shadcn/ui bridge. Dark mode tokens come directly from exem-ui's `[data-theme='dark']` definitions, adapted to next-themes' `class` attribute pattern (`.dark` class on `<html>`).

**Primary recommendation:** Run `npx shadcn@latest init` first, then layer the exem-ui + blue accent token system on top of shadcn's generated CSS, then validate with a visual smoke test before building anything else.

---

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Verified |
|---------|---------|---------|----------|
| Next.js | 16.1.6 | App Router framework | `package.json` |
| React | 19.2.3 | UI library | `package.json` |
| Tailwind CSS | 4.2.0 | CSS-first utility framework | `package.json` devDeps |
| @tailwindcss/postcss | ^4 | PostCSS integration | `postcss.config.mjs` |
| @supabase/supabase-js | ^2.95.3 | Supabase client | `package.json` |
| @supabase/ssr | ^0.8.0 | SSR-compatible auth | `package.json` |
| TypeScript | ^5 (5.9.3 resolved) | Type safety | `package.json` devDeps |

### To Install (Phase 1)

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| d3 | ^7.9.0 | D3 visualization (full package) | 19 charts use 17+ D3 sub-modules; individual imports for code clarity, full package for version alignment |
| @types/d3 | ^7.4.3 | TypeScript definitions for D3 | DefinitelyTyped comprehensive D3 v7 types; project has `strict: true` |
| next-themes | latest | Dark/light theme provider | Official shadcn/ui recommendation for Next.js dark mode |
| tw-animate-css | latest (dev) | Animation utilities for shadcn/ui | Replaced deprecated `tailwindcss-animate` for Tailwind v4 |

### Installed by shadcn CLI (automatic)

| Library | Purpose |
|---------|---------|
| @radix-ui/* (per component) | Headless accessible primitives |
| lucide-react | Icon library (shadcn default) |
| class-variance-authority | Component variant system |
| clsx | Conditional class composition |
| tailwind-merge | Tailwind class deduplication |

### Optional Dev Dependencies

| Library | Version | Purpose | Recommendation |
|---------|---------|---------|----------------|
| prettier | ^3.4.0 | Code formatting | DEFER to Phase 2+; not blocking for foundation |
| prettier-plugin-tailwindcss | ^0.6.0 | Tailwind class sorting | DEFER with prettier |
| @next/bundle-analyzer | ^16.0.0 | Bundle analysis | DEFER to first build verification |

### Alternatives Considered

| Instead of | Could Use | Why Not |
|------------|-----------|---------|
| d3 (full) | Individual d3-* sub-modules | 17+ sub-modules need version alignment; full package is ~30KB gzipped, tree-shakes well |
| next-themes | Custom ThemeProvider | next-themes handles flash-of-theme, localStorage, system preference, SSR hydration; building custom would be reimplementing these |
| tw-animate-css | tailwindcss-animate | Deprecated for Tailwind v4; shadcn/ui v4 projects use tw-animate-css |

**Installation:**
```bash
# 1. shadcn/ui init (MUST be first -- validates Tailwind v4 compatibility)
npx shadcn@latest init

# 2. shadcn/ui components (all 17 at once -- PRD requires all)
npx shadcn@latest add button input card badge dialog tabs table select \
  tooltip sidebar command scroll-area separator dropdown-menu breadcrumb \
  collapsible switch textarea sonner

# 3. D3 + types
npm install d3
npm install -D @types/d3

# 4. Theme
npm install next-themes
```

---

## Architecture Patterns

### Recommended Project Structure (Phase 1 deliverables)

```
src/
├── app/
│   ├── layout.tsx                          # UPDATE: add ThemeProvider, suppressHydrationWarning
│   ├── globals.css                         # REWRITE: exem-ui tokens + shadcn bridge + chart tokens
│   └── (authenticated)/                    # NEW: route group (empty pages for now)
│       └── layout.tsx                      # NEW: client layout shell placeholder
│
├── components/
│   ├── charts/
│   │   └── shared/
│   │       ├── chart-utils.ts              # cleanupD3Svg, formatNumber, generateTimeSeries, addJitter
│   │       ├── chart-theme.ts              # getChartColors, resolveColor, isLightTheme
│   │       └── chart-tooltip.ts            # createTooltip, positionTooltip, removeTooltip
│   ├── ui/                                 # shadcn/ui (17 components, auto-generated)
│   └── theme-provider.tsx                  # next-themes wrapper
│
├── data/
│   ├── dashboard-data.ts                   # Hardcoded dashboard metrics + chart data
│   ├── dgraph-data.ts                      # Cluster topology, node metrics
│   ├── gpu-data.ts                         # GPU cards, health, processes
│   ├── studio-data.ts                      # 6 ontology types (sampleTypes[])
│   ├── query-data.ts                       # Sample data + piiDemoData (FAB + General)
│   └── pii-config.ts                       # PII field configs, masking rules
│
├── lib/
│   ├── utils.ts                            # cn() utility (created by shadcn init)
│   └── pii-masking.ts                      # maskName, maskPhone, maskEmail, etc.
│
├── types/
│   └── index.ts                            # Role, PiiLevel, OntologyType, ClusterNode, etc.
│
└── utils/
    └── supabase/                           # EXISTING (no changes needed)
        ├── client.ts
        ├── server.ts
        └── middleware.ts
```

### Pattern 1: CSS Token Architecture (Three-Tier System)

**What:** A layered CSS variable system that bridges exem-ui, eXemble brand identity, and shadcn/ui.

**Why:** The user decision locks in exem-ui primitives as the base, blue accent for eXemble identity, and shadcn/ui needs its own variable namespace for components to work.

**Structure:**
```
Layer 1: exem-ui Primitives (verbatim from exem-ui global.css)
  └── --color-gray-00 through --color-rose-10 (20 scales x 11 shades)
  └── --color-mono-white, --color-mono-black

Layer 2: eXemble Semantic Tokens (adapted from exem-ui, blue accent)
  └── --color-text-primary, --color-border-primary, etc.
  └── --color-text-accent: var(--color-blue-05)  ← BLUE instead of sky
  └── --color-surface-accent-default: var(--color-blue-05)
  └── --color-elevation-accent: var(--color-blue-00)
  └── Chart series: --color-chart-1 through --color-chart-8

Layer 3: shadcn/ui Bridge (@theme inline)
  └── --color-background: var(--color-elevation-elevation-0)
  └── --color-foreground: var(--color-text-primary)
  └── --color-primary: var(--color-surface-accent-default)
  └── --color-muted: var(--color-elevation-elevation-1)
  └── etc.
```

**Critical detail:** exem-ui uses `data-theme="dark"` attribute. next-themes uses `.dark` class on `<html>`. We must use the `.dark` class selector (since next-themes `attribute="class"` is the standard pattern), not `data-theme`. The dark mode CSS block must be `:root.dark { ... }` not `:root[data-theme='dark'] { ... }`.

### Pattern 2: shadcn/ui Tailwind v4 CSS Structure

**What:** The post-`shadcn init` globals.css structure for Tailwind v4.

**Current state (verified from shadcn docs):**
```css
@import "tailwindcss";
@import "tw-animate-css";

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.004 285.823);
  --primary: oklch(0.21 0.006 285.885);
  /* ... ~40 variables */
}

.dark {
  --background: oklch(0.141 0.004 285.823);
  --foreground: oklch(0.985 0 0);
  /* ... ~40 dark variables */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  /* ... maps :root vars to Tailwind color utilities */
  --color-chart-1: oklch(0.646 0.222 41.116);
  --color-chart-2: oklch(0.6 0.118 184.714);
  --color-chart-3: oklch(0.398 0.07 227.392);
  --color-chart-4: oklch(0.828 0.189 84.429);
  --color-chart-5: oklch(0.769 0.188 70.08);
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
}
```

**Our adaptation strategy:** After `shadcn init` generates this structure, we:
1. KEEP the `@theme inline` block (shadcn components depend on these variable names)
2. PREPEND exem-ui primitive variables into `:root` (they don't conflict)
3. REPLACE shadcn's default OKLCH color values with references to exem-ui primitives (e.g., `--background` points to `var(--color-elevation-elevation-0)`)
4. ADD eXemble-specific variables (chart series, PII indicators, role badges)
5. MAP the `.dark` block to exem-ui dark theme values with blue accent substitutions

### Pattern 3: D3 Chart Utility API Design (Discretion Area)

**What:** The three shared utility files that every D3 chart component imports.

**Recommendation for `chart-utils.ts`:**
```typescript
// components/charts/shared/chart-utils.ts

/** Clean up all SVG content from a container, interrupting transitions first */
export function cleanupD3Svg(container: HTMLElement | null): void;

/** Format large numbers: 1500 → "1.5K", 2500000 → "2.5M" */
export function formatNumber(value: number): string;

/** Generate time-series data points with realistic jitter */
export function generateTimeSeriesData(
  points: number,
  range: [number, number],
  startTime?: Date
): Array<{ time: Date; value: number }>;

/** Add random jitter to a value within percentage bounds */
export function addJitter(value: number, percent?: number): number;

/** Debounced ResizeObserver callback wrapper */
export function createDebouncedResizeObserver(
  callback: (width: number, height: number) => void,
  delay?: number
): ResizeObserver;
```

**Recommendation for `chart-theme.ts`:**
```typescript
// components/charts/shared/chart-theme.ts

export interface ChartColors {
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  chart6: string;
  chart7: string;
  chart8: string;
  text: string;
  textSecondary: string;
  border: string;
  background: string;
  axisLine: string;
  tickLine: string;
  gridLine: string;
  tooltipBg: string;
  tooltipText: string;
}

/** Resolve all chart CSS variables to concrete color strings (for D3 transitions) */
export function getChartColors(): ChartColors;

/** Resolve a single CSS variable to a concrete color string */
export function resolveColor(cssVar: string): string;

/** Check if current theme is light mode */
export function isLightTheme(): boolean;
```

**Recommendation for `chart-tooltip.ts`:**
```typescript
// components/charts/shared/chart-tooltip.ts
import * as d3 from "d3";

export interface TooltipInstance {
  show: (content: string, event: MouseEvent) => void;
  hide: () => void;
  destroy: () => void;
}

/** Create a tooltip div appended to body with consistent styling */
export function createTooltip(): TooltipInstance;
```

**Why this API design:** The PRD's D3 Viz Spec (section 1.7) defines tooltip as a body-appended div with absolute positioning. Wrapping this in a `TooltipInstance` with `show/hide/destroy` methods makes cleanup explicit and prevents orphaned tooltip divs (a known pitfall from PITFALLS.md).

### Pattern 4: Data Jitter for "Living Data" Feel

**What:** The user wants hardcoded data to feel alive -- slight random variations on each page load.

**Implementation approach:**
```typescript
// in chart-utils.ts
export function addJitter(value: number, percent: number = 5): number {
  const range = value * (percent / 100);
  return value + (Math.random() - 0.5) * 2 * range;
}

// Usage in data files:
export function getDashboardMetrics() {
  return baseDashboardMetrics.map(m => ({
    ...m,
    value: addJitter(m.value, 3),  // +/-3% variation
  }));
}
```

**Key detail:** The jitter function returns a new value on each call. Data files should export functions (not static objects) so that each import/call produces slightly different values. Alternatively, the jitter can be applied at the page component level when passing data to charts.

### Anti-Patterns to Avoid

- **Don't use `data-theme` attribute for theme switching.** next-themes uses CSS class (`.dark`) by default. exem-ui uses `data-theme="dark"`. We standardize on the class approach since shadcn/ui + next-themes expect it.
- **Don't put exem-ui primitives inside `@theme inline`.** Primitives go in `:root` as plain CSS variables. Only the shadcn bridge variables go in `@theme inline` (Tailwind needs them there to generate utility classes).
- **Don't create a singleton pattern for the Supabase browser client yet.** The existing `client.ts` calls `createBrowserClient()` each time. For a POC with 2 Supabase calls, this is fine. Optimization is premature.
- **Don't install shadcn/ui components incrementally.** Install all 17 at once. The phased approach from STACK.md was for a different strategy; the user decision is to set up ALL foundation infrastructure in Phase 1.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode flash prevention | Custom script to set class before hydration | next-themes | Handles blocking script injection, localStorage, system preference, hydration mismatch |
| Accessible dropdown/dialog/tooltip | Custom ARIA implementations | Radix UI (via shadcn) | ARIA roles, keyboard nav, focus trapping are extremely complex to get right |
| CSS class merging with Tailwind | Custom string concatenation | `cn()` from clsx + tailwind-merge | Handles conflicting Tailwind classes (e.g., `bg-red-500 bg-blue-500` → last wins) |
| Responsive chart sizing | Custom window resize listeners | ResizeObserver | ResizeObserver is element-level, not window-level; handles CSS grid/flex resizes |
| D3 SVG cleanup | Manual DOM removal | `cleanupD3Svg()` utility | Must interrupt transitions before removal to prevent errors |
| Animation utilities for shadcn | Custom keyframe definitions | tw-animate-css | Purpose-built for shadcn/ui components in Tailwind v4 |

**Key insight:** The entire Phase 1 is about building the foundation with established tools and patterns. No custom invention is needed -- it is assembly and integration work.

---

## Common Pitfalls

### Pitfall 1: shadcn/ui Init Fails with Tailwind CSS 4.2.0

**What goes wrong:** The `npx shadcn@latest init` command may not detect Tailwind v4 correctly, producing v3-style config or erroring on missing `tailwind.config.js`.

**Why it happens:** shadcn/ui Tailwind v4 support was added relatively recently. The detection heuristic looks for `@tailwindcss/postcss` in `postcss.config.mjs` or `@import "tailwindcss"` in CSS. Our project has both, so it should work.

**How to avoid:** Run `npx shadcn@latest init` as the absolute first action. If it asks about Tailwind version, select v4. After init completes, verify:
1. `components.json` exists with `"style": "new-york"` or `"default"`
2. `globals.css` contains `@theme inline { }` block (not `@layer base { }` with HSL variables)
3. `tw-animate-css` appears in devDependencies (not `tailwindcss-animate`)

**Warning signs:** If `globals.css` contains `@layer base { :root { --background: 0 0% 100% } }` with raw HSL numbers, shadcn initialized in v3 mode.

**Confidence:** MEDIUM -- shadcn CLI detection should work with our postcss.config.mjs, but unverified on 4.2.0 specifically.

### Pitfall 2: exem-ui CSS Variables Conflicting with shadcn/ui Variables

**What goes wrong:** Both exem-ui and shadcn/ui define `--color-*` prefixed variables. If naming collides, one overrides the other.

**Why it happens:** exem-ui uses `--color-text-primary`, `--color-border-primary`, etc. shadcn/ui (via `@theme inline`) uses `--color-foreground`, `--color-primary`, `--color-border`. These are DIFFERENT naming conventions -- no actual collision. But if someone tries to merge them naively, they may accidentally override.

**How to avoid:** Keep three distinct layers:
1. exem-ui primitives in `:root` -- these are low-level (`--color-gray-05`)
2. exem-ui semantics in `:root` / `.dark` -- these use exem naming (`--color-text-primary`)
3. shadcn bridge in `@theme inline` -- these use shadcn naming (`--color-foreground`)

The bridge layer references the semantic layer: `--color-foreground: var(--color-text-primary)`.

**Confidence:** HIGH -- verified both naming conventions; no collision exists.

### Pitfall 3: next-themes Class vs Attribute Mismatch

**What goes wrong:** exem-ui uses `[data-theme='dark']` selector. next-themes with `attribute="class"` adds `.dark` class. If the CSS only has `[data-theme='dark']` selectors, dark mode variables never activate.

**How to avoid:** When copying exem-ui dark tokens, change the selector:
```css
/* FROM (exem-ui original): */
:root[data-theme='dark'] { ... }

/* TO (our adaptation): */
.dark { ... }
```

**Confidence:** HIGH -- verified both systems.

### Pitfall 4: D3 Import Bloating Bundle

**What goes wrong:** Using `import * as d3 from "d3"` in every chart component pulls the full 250KB D3 bundle.

**How to avoid:** In chart utility files (`chart-utils.ts`, `chart-theme.ts`, `chart-tooltip.ts`), use selective imports:
```typescript
import { select, selectAll } from "d3-selection";
import { scaleLinear, scaleTime } from "d3-scale";
```

In individual chart components, import specific sub-modules. The full `d3` package is installed for version alignment, but imports should be selective.

**Exception:** `chart-tooltip.ts` and `chart-utils.ts` may reasonably use `import * as d3 from "d3"` since they are shared across all charts and loaded once.

**Confidence:** HIGH -- standard D3 optimization pattern.

### Pitfall 5: Supabase snake_case vs PRD camelCase Column Names

**What goes wrong:** The PRD Data Schema uses camelCase columns (`nodeCount`, `clusterId`, `queryText`). PostgreSQL convention (and Supabase default) is snake_case (`node_count`, `cluster_id`, `query_text`). If we use camelCase in SQL, every query needs double-quoting (`"nodeCount"`).

**How to avoid:** Use snake_case in Supabase tables. Define TypeScript types with camelCase. The Supabase client automatically maps snake_case to camelCase if you use `.select()` with column aliases, or handle it at the TypeScript level with a mapping utility.

**Recommendation:** Use snake_case in the database schema. The TypeScript types use camelCase. Create a simple mapping in the data layer.

**Confidence:** HIGH -- PostgreSQL convention is well-established.

### Pitfall 6: Chart Colors Not Updating on Theme Toggle

**What goes wrong:** D3 charts render with resolved color values. When theme toggles, CSS variables change but D3's already-rendered SVG attributes don't update.

**How to avoid:** Two strategies:
1. **For static attributes (fill, stroke):** Use CSS variables directly: `.attr('fill', 'var(--color-chart-1)')`. These respond to theme changes automatically.
2. **For D3 transitions (animated color changes):** Resolve CSS variables first with `getChartColors()`, then pass concrete values to D3's interpolation system.

When theme changes, re-render the chart. The D3 chart template pattern in ARCHITECTURE.md already supports this: add `theme` to the `useEffect` dependency array so charts re-render on toggle.

**Confidence:** HIGH -- verified against D3's interpolation behavior with CSS variables.

---

## Code Examples

### Example 1: globals.css Token Architecture

```css
@import "tailwindcss";
@import "tw-animate-css";

/* ================================================================
   Layer 1: exem-ui Primitive Tokens (verbatim from exem-ui global.css)
   ================================================================ */
:root {
  --color-mono-white: #ffffff;
  --color-mono-black: #000000;
  --color-gray-00: #f9fafb;
  --color-gray-01: #f3f4f6;
  /* ... full gray-00 through gray-10 scale ... */
  --color-gray-10: #030712;
  --color-blue-00: #eff6ff;
  --color-blue-01: #dbeafe;
  --color-blue-02: #bddaff;
  --color-blue-03: #8dc5ff;
  --color-blue-04: #50a2ff;
  --color-blue-05: #2b7fff;
  --color-blue-06: #155dfc;
  --color-blue-07: #1347e5;
  --color-blue-08: #193bb8;
  --color-blue-09: #1c398e;
  --color-blue-10: #162455;
  /* ... all other color scales (red, orange, amber, etc.) ... */

  /* ================================================================
     Layer 2: eXemble Semantic Tokens (blue accent identity)
     ================================================================ */
  --color-text-primary: var(--color-gray-10);
  --color-text-secondary: var(--color-gray-08);
  --color-text-tertiary: var(--color-gray-05);
  --color-text-disabled: var(--color-gray-04);
  --color-text-inverse: var(--color-mono-white);
  --color-text-accent: var(--color-blue-05);          /* ← BLUE (eXemble identity) */
  --color-text-link: var(--color-blue-05);
  --color-text-success: var(--color-green-05);
  --color-text-warning: var(--color-amber-05);
  --color-text-critical: var(--color-red-05);

  --color-border-primary: var(--color-gray-02);
  --color-border-secondary: var(--color-gray-03);
  --color-border-accent: var(--color-blue-05);
  /* ... other border semantics ... */

  --color-surface-accent-default: var(--color-blue-05);
  --color-surface-accent-hovered: var(--color-blue-06);
  /* ... other surface semantics ... */

  --color-elevation-elevation-0: var(--color-mono-white);
  --color-elevation-elevation-1: var(--color-gray-01);
  --color-elevation-elevation-2: var(--color-gray-02);
  /* ... other elevation semantics ... */

  --color-material-tooltip: var(--color-gray-09);

  /* Chart axis/grid tokens (from exem-ui) */
  --color-chart-axis-line: var(--color-gray-02);
  --color-chart-tick: var(--color-gray-01);
  --color-chart-label: var(--color-gray-05);

  /* ================================================================
     Layer 2b: Chart Series Colors (8 colors, blue-accent first)
     ================================================================ */
  --color-chart-1: var(--color-blue-05);               /* Primary blue (eXemble) */
  --color-chart-2: var(--color-emerald-05);             /* Emerald */
  --color-chart-3: var(--color-amber-05);               /* Amber */
  --color-chart-4: var(--color-violet-05);              /* Violet */
  --color-chart-5: var(--color-rose-05);                /* Rose */
  --color-chart-6: var(--color-cyan-05);                /* Cyan */
  --color-chart-7: var(--color-orange-05);              /* Orange */
  --color-chart-8: var(--color-lime-05);                /* Lime */

  /* ================================================================
     Layer 2c: RBAC / PII Tokens
     ================================================================ */
  --color-pii-plain: transparent;
  --color-pii-masked: var(--color-tint-background-amber);
  --color-pii-anonymized: var(--color-tint-background-red);
  --color-pii-denied: var(--color-elevation-critical);

  --color-role-super-admin: var(--color-red-05);
  --color-role-service-app: var(--color-blue-05);       /* Blue, not sky */
  --color-role-data-analyst: var(--color-gray-05);
  --color-role-auditor: var(--color-amber-05);

  /* ================================================================
     Layer 3: shadcn/ui Variable Bridge
     These variables use shadcn naming, referencing eXemble semantics
     ================================================================ */
  --background: var(--color-elevation-elevation-0);
  --foreground: var(--color-text-primary);
  --card: var(--color-elevation-elevation-0);
  --card-foreground: var(--color-text-primary);
  --popover: var(--color-elevation-elevation-0);
  --popover-foreground: var(--color-text-primary);
  --primary: var(--color-surface-accent-default);
  --primary-foreground: var(--color-text-inverse);
  --secondary: var(--color-elevation-elevation-1);
  --secondary-foreground: var(--color-text-primary);
  --muted: var(--color-elevation-elevation-1);
  --muted-foreground: var(--color-text-tertiary);
  --accent: var(--color-elevation-elevation-1);
  --accent-foreground: var(--color-text-primary);
  --destructive: var(--color-red-05);
  --destructive-foreground: var(--color-text-inverse);
  --border: var(--color-border-primary);
  --input: var(--color-border-primary);
  --ring: var(--color-blue-05);

  /* Radius */
  --radius-weak: 4px;
  --radius-medium: 6px;
  --radius-strong: 8px;
  --radius: 0.5rem;
}

/* ================================================================
   Dark Theme (adapted from exem-ui, blue accent)
   ================================================================ */
.dark {
  --color-text-primary: var(--color-mono-white);
  --color-text-secondary: var(--color-gray-03);
  --color-text-tertiary: var(--color-gray-05);
  --color-text-disabled: var(--color-gray-06);
  --color-text-inverse: var(--color-gray-10);
  --color-text-accent: var(--color-blue-04);
  --color-text-link: var(--color-blue-03);
  --color-text-success: var(--color-green-03);
  --color-text-warning: var(--color-amber-03);
  --color-text-critical: var(--color-red-03);

  --color-border-primary: var(--color-gray-08);
  --color-border-secondary: var(--color-gray-07);
  --color-border-accent: var(--color-blue-03);
  /* ... other dark border semantics ... */

  --color-surface-accent-default: var(--color-blue-05);
  --color-surface-accent-hovered: var(--color-blue-06);
  /* ... other dark surface semantics ... */

  --color-elevation-elevation-0: var(--color-gray-10);
  --color-elevation-elevation-1: var(--color-gray-09);
  --color-elevation-elevation-2: var(--color-gray-08);
  /* ... */

  --color-material-tooltip: var(--color-gray-08);
  --color-chart-axis-line: var(--color-gray-06);
  --color-chart-tick: var(--color-gray-07);
  --color-chart-label: var(--color-gray-04);

  /* Dark chart series (slightly lighter shades for dark backgrounds) */
  --color-chart-1: var(--color-blue-04);
  --color-chart-2: var(--color-emerald-04);
  --color-chart-3: var(--color-amber-04);
  --color-chart-4: var(--color-violet-04);
  --color-chart-5: var(--color-rose-04);
  --color-chart-6: var(--color-cyan-04);
  --color-chart-7: var(--color-orange-04);
  --color-chart-8: var(--color-lime-04);

  /* Dark PII tokens */
  --color-pii-masked: var(--color-amber-09);
  --color-pii-anonymized: var(--color-red-09);
  --color-pii-denied: var(--color-red-09);

  /* Dark shadcn bridge (auto-updates via semantic references) */
  /* Most shadcn vars already reference semantic vars which are overridden above */
  /* Only override what doesn't auto-cascade: */
  --ring: var(--color-blue-04);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --color-chart-1: var(--color-chart-1);
  --color-chart-2: var(--color-chart-2);
  --color-chart-3: var(--color-chart-3);
  --color-chart-4: var(--color-chart-4);
  --color-chart-5: var(--color-chart-5);
  --color-chart-6: var(--color-chart-6);
  --color-chart-7: var(--color-chart-7);
  --color-chart-8: var(--color-chart-8);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

### Example 2: ThemeProvider Setup

```typescript
// components/theme-provider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

```typescript
// app/layout.tsx (updated)
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "eXemble Ontology Platform",
  description: "Graph Database Visualization & Management System",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Key decisions:**
- `defaultTheme="dark"` -- locked user decision
- `enableSystem={false}` -- don't follow OS preference (user wants explicit dark default)
- `disableTransitionOnChange` -- prevents jarring flash when D3 charts re-render on theme toggle
- `suppressHydrationWarning` on `<html>` -- required by next-themes

### Example 3: TypeScript Type Definitions

```typescript
// types/index.ts

// ─── RBAC Types ───
export type Role = "super_admin" | "service_app" | "data_analyst" | "auditor";
export type PiiLevel = "highest" | "high" | "medium" | "low" | "none";

// ─── Cluster & Node Types ───
export type NodeType = "zero" | "alpha" | "shard";
export type NodeStatus = "healthy" | "warning" | "error";
export type ClusterStatus = "healthy" | "warning" | "error";

export interface Cluster {
  id: number;
  name: string;
  status: ClusterStatus;
  version: string;
  nodeCount: number;
  replicationFactor: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClusterNode {
  id: number;
  clusterId: number;
  name: string;
  type: NodeType;
  status: NodeStatus;
  host: string;
  port: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

// ─── GPU Types ───
export type GpuStatus = "healthy" | "warning" | "error";

export interface Gpu {
  id: number;
  nodeId: number;
  name: string;
  model: string;
  status: GpuStatus;
  utilization: number;
  memoryUsed: number;
  memoryTotal: number;
  temperature: number;
  powerUsage: number;
  powerLimit: number;
}

// ─── Ontology Types ───
export interface OntologyType {
  id: number;
  name: string;
  description: string;
  nodeCount: number;
  predicates: string[];
  relations: Array<{ name: string; target: string; direction: "outbound" | "inbound" }>;
}

// ─── Query Types ───
export type QueryType = "graphql" | "dql";
export type QueryStatus = "pending" | "completed" | "error";

export interface Query {
  id: number;
  userId: number;
  queryText: string;
  queryType: QueryType;
  status: QueryStatus;
  executionTime: number | null;
  resultCount: number | null;
  createdAt: string;
}

// ─── Alert Types ───
export type AlertSeverity = "error" | "warning" | "info";

export interface Alert {
  id: number;
  clusterId: number;
  nodeId: number | null;
  severity: AlertSeverity;
  title: string;
  message: string;
  resolved: boolean;
  resolvedAt: string | null;
}

// ─── User Types ───
export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  lastLogin: string | null;
  createdAt: string;
}

// ─── Metric Types ───
export interface Metric {
  id: number;
  clusterId?: number;
  nodeId?: number;
  gpuId?: number;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
}

// ─── PII Types ───
export interface PiiFieldConfig {
  field: string;
  level: PiiLevel;
  maskFn: Record<Role, (value: string) => string>;
}

// ─── Chart Data Types ───
export interface TimeSeriesPoint {
  time: Date;
  value: number;
}

export interface GaugeData {
  label: string;
  value: number;
  max: number;
  color: string;
}
```

### Example 4: Supabase SQL Migration (Recommendation)

```sql
-- supabase/migrations/20260219000000_initial_schema.sql
-- eXemble Ontology Platform - Initial Schema + Seed Data

-- ============================
-- Schema: 8 Tables
-- ============================

CREATE TABLE clusters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'healthy',
  version VARCHAR(50),
  node_count INTEGER DEFAULT 0,
  replication_factor INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE nodes (
  id SERIAL PRIMARY KEY,
  cluster_id INTEGER REFERENCES clusters(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,  -- zero | alpha | shard
  status VARCHAR(50) DEFAULT 'healthy',
  host VARCHAR(255),
  port INTEGER,
  cpu_usage REAL DEFAULT 0,
  memory_usage REAL DEFAULT 0,
  disk_usage REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE gpus (
  id SERIAL PRIMARY KEY,
  node_id INTEGER REFERENCES nodes(id),
  name VARCHAR(255) NOT NULL,
  model VARCHAR(255),
  status VARCHAR(50) DEFAULT 'healthy',
  utilization REAL DEFAULT 0,
  memory_used REAL DEFAULT 0,
  memory_total REAL DEFAULT 0,
  temperature REAL DEFAULT 0,
  power_usage REAL DEFAULT 0,
  power_limit REAL DEFAULT 0
);

CREATE TABLE metrics (
  id SERIAL PRIMARY KEY,
  cluster_id INTEGER REFERENCES clusters(id),
  node_id INTEGER REFERENCES nodes(id),
  gpu_id INTEGER REFERENCES gpus(id),
  type VARCHAR(100) NOT NULL,
  value REAL NOT NULL,
  unit VARCHAR(50),
  timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ontology_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  node_count INTEGER DEFAULT 0,
  predicates JSONB DEFAULT '[]',
  relations JSONB DEFAULT '[]'
);

CREATE TABLE queries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,  -- FK added after users table
  query_text TEXT NOT NULL,
  query_type VARCHAR(50) DEFAULT 'graphql',
  status VARCHAR(50) DEFAULT 'pending',
  execution_time INTEGER,
  result_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  cluster_id INTEGER REFERENCES clusters(id),
  node_id INTEGER REFERENCES nodes(id),
  severity VARCHAR(50) NOT NULL,  -- error | warning | info
  title VARCHAR(255) NOT NULL,
  message TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'data_analyst',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK for queries.user_id
ALTER TABLE queries ADD CONSTRAINT fk_queries_user FOREIGN KEY (user_id) REFERENCES users(id);

-- ============================
-- RLS: Enable but allow all (POC)
-- ============================
ALTER TABLE clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gpus ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ontology_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anon read access for POC (no real auth enforcement)
CREATE POLICY "Allow anon select" ON clusters FOR SELECT USING (true);
CREATE POLICY "Allow anon select" ON nodes FOR SELECT USING (true);
CREATE POLICY "Allow anon select" ON gpus FOR SELECT USING (true);
CREATE POLICY "Allow anon select" ON metrics FOR SELECT USING (true);
CREATE POLICY "Allow anon select" ON ontology_types FOR SELECT USING (true);
CREATE POLICY "Allow anon select" ON queries FOR SELECT USING (true);
CREATE POLICY "Allow anon select" ON alerts FOR SELECT USING (true);
CREATE POLICY "Allow anon select" ON users FOR SELECT USING (true);

-- ============================
-- Seed Data
-- ============================

-- Cluster
INSERT INTO clusters (name, status, version, node_count, replication_factor)
VALUES ('SKS-FAB1-PROD', 'healthy', '23.1.0', 12, 3);

-- Nodes (12)
INSERT INTO nodes (cluster_id, name, type, status, host, port, cpu_usage, memory_usage, disk_usage) VALUES
  (1, 'sks-zero-01', 'zero', 'healthy', '10.0.1.1', 5080, 15.2, 32.1, 28.5),
  (1, 'sks-zero-02', 'zero', 'healthy', '10.0.1.2', 5080, 12.8, 28.9, 25.3),
  (1, 'sks-zero-03', 'zero', 'healthy', '10.0.1.3', 5080, 18.1, 35.4, 30.1),
  (1, 'sks-alpha-01', 'alpha', 'healthy', '10.0.2.1', 7080, 45.3, 62.1, 55.8),
  (1, 'sks-alpha-02', 'alpha', 'healthy', '10.0.2.2', 7080, 52.1, 58.4, 48.2),
  (1, 'sks-alpha-03', 'alpha', 'warning', '10.0.2.3', 7080, 78.9, 85.2, 72.1),
  (1, 'sks-alpha-04', 'alpha', 'healthy', '10.0.2.4', 7080, 38.7, 54.3, 42.6),
  (1, 'sks-alpha-05', 'alpha', 'healthy', '10.0.2.5', 7080, 41.2, 49.8, 38.9),
  (1, 'sks-alpha-06', 'alpha', 'healthy', '10.0.2.6', 7080, 35.6, 52.7, 45.3),
  (1, 'sks-compute-01', 'alpha', 'healthy', '10.0.3.1', 7080, 65.4, 71.2, 58.4),
  (1, 'sks-compute-02', 'alpha', 'healthy', '10.0.3.2', 7080, 58.9, 68.5, 52.1),
  (1, 'sks-compute-03', 'alpha', 'error', '10.0.3.3', 7080, 92.1, 94.8, 88.5);

-- GPUs (4)
INSERT INTO gpus (node_id, name, model, status, utilization, memory_used, memory_total, temperature, power_usage, power_limit) VALUES
  (10, 'GPU-0', 'NVIDIA A100 80GB', 'healthy', 72.5, 48.2, 80.0, 67.0, 285.0, 400.0),
  (10, 'GPU-1', 'NVIDIA A100 80GB', 'healthy', 68.3, 45.1, 80.0, 64.0, 270.0, 400.0),
  (11, 'GPU-2', 'NVIDIA A100 40GB', 'warning', 85.1, 35.8, 40.0, 78.0, 245.0, 300.0),
  (11, 'GPU-3', 'NVIDIA A100 40GB', 'healthy', 55.7, 22.4, 40.0, 58.0, 180.0, 300.0);

-- Ontology Types (6)
INSERT INTO ontology_types (name, description, node_count, predicates, relations) VALUES
  ('Equipment', 'Semiconductor manufacturing equipment', 832,
   '["equipment_id", "name", "type", "manufacturer", "location", "status", "install_date"]',
   '[{"name": "runs", "target": "Process", "direction": "outbound"}, {"name": "located_at", "target": "Equipment", "direction": "outbound"}, {"name": "triggers", "target": "Alert", "direction": "outbound"}]'),
  ('Process', 'Manufacturing process steps', 24500,
   '["process_id", "name", "step_number", "duration", "temperature", "pressure"]',
   '[{"name": "produces", "target": "Wafer", "direction": "outbound"}, {"name": "uses", "target": "Recipe", "direction": "outbound"}]'),
  ('Wafer', 'Silicon wafer tracking', 156000,
   '["wafer_id", "lot_id", "diameter", "thickness", "grade", "status"]',
   '[{"name": "has_defect", "target": "Defect", "direction": "outbound"}]'),
  ('Recipe', 'Process recipes and parameters', 310,
   '["recipe_id", "name", "version", "parameters", "created_by"]',
   '[{"name": "applied_to", "target": "Process", "direction": "outbound"}]'),
  ('Defect', 'Wafer defect records', 48800,
   '["defect_id", "type", "location_x", "location_y", "size", "severity"]',
   '[{"name": "found_by", "target": "Equipment", "direction": "outbound"}]'),
  ('MaintenanceRecord', 'Equipment maintenance history', 3820,
   '["record_id", "type", "scheduled_date", "completed_date", "technician", "notes"]',
   '[{"name": "performed_on", "target": "Equipment", "direction": "outbound"}]');

-- Users (5)
INSERT INTO users (username, email, password, role) VALUES
  ('admin', 'admin@exem.com', '$2b$10$placeholder_hash_admin', 'super_admin'),
  ('api-server', 'api@sksiltron.com', '$2b$10$placeholder_hash_api', 'service_app'),
  ('analyst1', 'analyst1@sksiltron.com', '$2b$10$placeholder_hash_analyst', 'data_analyst'),
  ('auditor1', 'auditor1@sksiltron.com', '$2b$10$placeholder_hash_auditor', 'auditor'),
  ('operator1', 'op1@sksiltron.com', '$2b$10$placeholder_hash_operator', 'service_app');
```

**Seed data strategy recommendation (Discretion Area):** Use a single SQL migration file that includes both schema creation and seed data. For a POC, separating schema and seed into different files adds unnecessary complexity. Run this via the Supabase Dashboard SQL Editor (paste and execute) since the project doesn't use local Supabase CLI. Keep the SQL file in the project repo at `supabase/migrations/` for version control even if applied manually.

### Example 5: Loading/Empty State Components (Discretion Area)

```typescript
// components/charts/shared/ChartSkeleton.tsx
"use client";

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full h-full min-h-[200px] rounded-lg",
        "bg-muted animate-pulse",
        "flex items-center justify-center",
        className
      )}
      data-testid="chart-skeleton"
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <div className="h-8 w-8 rounded-full bg-muted-foreground/20 animate-pulse" />
        <span className="text-xs">Loading chart...</span>
      </div>
    </div>
  );
}

// components/charts/shared/ChartEmpty.tsx
"use client";

import { BarChart3 } from "lucide-react";

export function ChartEmpty({
  message = "No data available",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full h-full min-h-[200px] rounded-lg",
        "border border-dashed border-border",
        "flex items-center justify-center",
        className
      )}
      data-testid="chart-empty"
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <BarChart3 className="h-8 w-8 opacity-50" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwindcss-animate` | `tw-animate-css` | shadcn v4 update (2025) | Must use `@import "tw-animate-css"` instead of `@plugin` |
| `@layer base { :root { --bg: 0 0% 100% } }` + `@theme { --color-bg: hsl(var(--bg)) }` | `:root { --bg: hsl(0 0% 100%) }` + `@theme inline { --color-bg: var(--bg) }` | shadcn Tailwind v4 update | CSS variables are now full color values, not partial HSL |
| `tailwind.config.js` with `darkMode: 'class'` | No config file; `@theme inline` in CSS | Tailwind CSS 4.0 | Dark mode works via `.dark` class automatically when using CSS variables |
| `shadow-sm` = small shadow | `shadow-sm` = old `shadow`; `shadow-xs` = old `shadow-sm` | Tailwind CSS 4.0 | Must use new shadow scale names |
| `bg-[--var]` (bracket syntax) | `bg-(--var)` (parenthesis syntax) | Tailwind CSS 4.0 | Arbitrary value syntax changed |
| `React.forwardRef()` | Direct ref prop | React 19 + shadcn update | shadcn components removed forwardRef |
| `ring` = 3px | `ring` = 1px | Tailwind CSS 4.0 | Use `ring-3` for old behavior |

**Deprecated/outdated:**
- `tailwindcss-animate`: Replaced by `tw-animate-css` for Tailwind v4
- `@theme { }` (non-inline): Replaced by `@theme inline { }` in latest shadcn
- `forwardRef` in shadcn components: Removed in favor of direct ref prop (React 19)

---

## Open Questions

1. **shadcn/ui init exact behavior on this project**
   - What we know: The project has `@tailwindcss/postcss` in `postcss.config.mjs` and `@import "tailwindcss"` in `globals.css`. shadcn should detect Tailwind v4.
   - What's unclear: Whether shadcn CLI v4 generates OKLCH colors or hex. Whether it creates `components.json` with correct path aliases matching `@/*`.
   - Recommendation: Run `npx shadcn@latest init` and inspect output. If v3 mode, use `--style new-york` or manual configuration.

2. **Chart series color palette for dark mode**
   - What we know: Light mode uses `-05` shade, which is good contrast on white backgrounds.
   - What's unclear: Whether `-04` shade is optimal for dark backgrounds, or if some colors need different shade adjustments.
   - Recommendation: Start with `-04` for dark mode (one step lighter). Adjust visually after implementing the first test chart in Phase 2.

3. **Supabase migration application method**
   - What we know: The project has a remote Supabase project at `fvfotgzodvomsdtawslr.supabase.co`. No local Supabase CLI is configured.
   - What's unclear: Whether the team prefers Supabase CLI (`supabase db push`) or Dashboard SQL Editor for applying migrations.
   - Recommendation: Use the Supabase Dashboard SQL Editor for the POC. Keep migration SQL files in `supabase/migrations/` in the repo for reference. This avoids needing to install/configure the Supabase CLI locally.

---

## Sources

### Primary (HIGH confidence)
- Existing codebase: `/Users/chs/Desktop/Claude/Ontology/` -- package.json, tsconfig.json, globals.css, postcss.config.mjs, Supabase client utilities
- exem-ui design system: `/Users/chs/Downloads/exem-ui-main/packages/design-system/stylesheet/src/global.css` -- complete primitive + semantic + dark theme tokens
- PRD Data Schema v1.3: `/Users/chs/Downloads/exemble-ontology-docs-v1.3/02_Data-Schema.md` -- 8 tables, seed data, PII masking specs
- PRD Implementation Guide v1.1: `/Users/chs/Downloads/exemble-ontology-docs-v1.3/04_Implementation-Guide.md` -- file structure, color tokens, component list
- D3 Visualization Spec v1.2: `/Users/chs/Downloads/exemble-ontology-docs-v1.3/03_D3-Visualization-Spec.md` -- chart utilities, tooltip pattern, cleanup pattern
- Prior research: STACK.md, ARCHITECTURE.md, PITFALLS.md in `.planning/research/`
- shadcn/ui Tailwind v4 docs: https://ui.shadcn.com/docs/tailwind-v4
- shadcn/ui dark mode docs: https://ui.shadcn.com/docs/dark-mode/next

### Secondary (MEDIUM confidence)
- shadcn/ui init behavior with Tailwind v4: WebSearch + official docs (not tested on this specific project)
- Supabase migration workflow: https://supabase.com/docs/guides/deployment/database-migrations
- `@types/d3` v7.4.3 compatibility: https://www.npmjs.com/package/@types/d3
- `tw-animate-css` as replacement for `tailwindcss-animate`: https://www.npmjs.com/package/tw-animate-css

### Tertiary (LOW confidence)
- None -- all findings verified against primary or secondary sources.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- verified against existing codebase and official package docs
- Architecture (CSS tokens): HIGH -- verified against exem-ui source code and shadcn/ui v4 docs
- Architecture (D3 utilities): HIGH -- derived from D3 Viz Spec + ARCHITECTURE.md patterns
- Supabase schema: HIGH -- adapted from PRD Data Schema with PostgreSQL conventions
- Pitfalls: HIGH -- verified against PITFALLS.md + official Tailwind v4 upgrade guide
- shadcn + Tailwind v4 compatibility: MEDIUM -- documented support but not yet validated on this specific project

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (30 days -- stable stack, no fast-moving dependencies)
