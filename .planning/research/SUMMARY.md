# Research Summary: eXemble Ontology Platform Stack

**Domain:** Graph DB Monitoring Dashboard (semiconductor FAB POC)
**Researched:** 2026-02-19
**Overall confidence:** MEDIUM-HIGH
**Research mode:** Brownfield stack augmentation
**Alignment:** All research files (STACK.md, ARCHITECTURE.md, FEATURES.md, PITFALLS.md) are internally consistent.

## Executive Summary

The eXemble Ontology Platform builds a D3.js-heavy monitoring dashboard on an existing Next.js 16.1.6 + Supabase + Tailwind CSS 4.2.0 foundation. The core technical challenge is integrating D3.js v7's imperative DOM manipulation with React 19's declarative rendering inside Next.js App Router's server/client component split.

The stack additions are deliberately minimal: **D3.js v7 for visualization and shadcn/ui for UI components.** That's it for production dependencies. No React Query, no Zustand, no date-fns. This restraint is driven by the POC's actual data architecture: 17 of 19 charts consume hardcoded data from `src/data/*.ts` files (direct imports, no API calls), and only 2 pages make Supabase calls (users, queries) -- simple enough for `useEffect` + `useState`.

The D3 integration uses a full imperative pattern (D3 creates and manages SVG inside a ref-contained container) rather than the hybrid "D3 for math, React for rendering" pattern. This is the correct choice because: all 6 pages are client components, the force simulations and particle animations require imperative DOM access, and the shared utility system (`cleanupD3Svg`, `destroyedRef`, `ResizeObserver` pattern) provides consistent lifecycle management across all 19 charts.

The UI layer uses shadcn/ui (17 components) which copies Radix UI + Tailwind CSS source code directly into the project. This gives full ownership and customization while maintaining accessibility. The highest-risk integration point is shadcn/ui's compatibility with Tailwind CSS 4.2.0 -- this must be validated by running `npx shadcn@latest init` as the first Phase 1 action.

## Key Findings

**Stack:** D3.js v7 + shadcn/ui (17 components) on existing Next.js 16/React 19/Supabase/Tailwind v4 foundation. No additional state management or data fetching libraries.
**Architecture:** All D3 components are fully imperative client components. Shared utilities (`chart-utils.ts`, `chart-theme.ts`, `chart-tooltip.ts`) prevent pattern duplication across 19 charts. Data flows through 3 lanes: hardcoded imports, Supabase useEffect+useState, React Context+useState.
**Critical pitfall:** D3 useEffect cleanup (memory leaks from unstopped simulations/timers) and SSR hydration (D3 charts must use `next/dynamic` with `ssr: false`).

## Implications for Roadmap

Based on research, the ARCHITECTURE.md establishes a 10-phase build order:

1. **Foundation (Phase 1)** - shadcn/ui init, CSS token system, ThemeProvider, types, cn utility
   - Addresses: Design system, Tailwind v4 validation
   - Avoids: Building components before the design system is confirmed working

2. **Layout Shell (Phase 2)** - PasswordGate, AppSidebar, HeaderBar, CommandPalette, WelcomePopup
   - Addresses: App chrome that all pages depend on
   - Avoids: Rebuilding layout after pages are built

3. **Chart Infrastructure (Phase 3)** - chart-utils.ts, chart-theme.ts, chart-tooltip.ts
   - Addresses: Shared D3 patterns used by all 19 charts
   - Avoids: Duplicating cleanup/theme/tooltip logic across 19 components

4. **Dashboard Page (Phase 4)** - 5 D3 charts (gauges, dual line, chord, scatter, bars)
   - Addresses: First page, validates chart pattern on simpler visualizations
   - Avoids: Starting with the hardest chart (cluster topology)

5. **DGraph Monitoring (Phase 5)** - 3 D3 charts including D3ClusterTopology (most complex)
   - Addresses: Hero visualization with force simulation + particle animation
   - Avoids: Deferring highest-risk component to the end

6-10. **Remaining pages** - GPU Monitoring, Ontology Studio, Query Console + RBAC, User Management, Data Seeding

**Phase ordering rationale:**
- Phase 1 must validate shadcn/ui + Tailwind v4.2.0 compatibility (highest-risk unknown)
- Chart infrastructure (Phase 3) prevents technical debt across 19 chart implementations
- Dashboard (Phase 4) before DGraph (Phase 5) validates the chart pattern on simpler charts first
- DGraph (Phase 5) is front-loaded because it's highest-risk (force simulation + particles + drag + zoom + 2 layout modes)
- RBAC/PII masking can be built independently of other pages
- Pages 4-9 have zero cross-dependencies and can be parallelized

**Critical path:** Phase 1 -> Phase 2 -> Phase 3 -> Phase 5 (DGraph)

**Research flags for phases:**
- Phase 1: MUST validate `npx shadcn@latest init` with Tailwind 4.2.0
- Phase 3: Standard D3 patterns, well-documented, low research risk
- Phase 5: Force simulation performance with node count needs empirical testing
- Phase 8: PII masking is well-specified in PRD but client-side only (see PITFALLS.md #15)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Existing stack versions | HIGH | Verified from node_modules package.json files |
| D3.js v7 as visualization library | HIGH | Unambiguously the right choice for 19 diverse chart types |
| D3 imperative pattern | HIGH | Established by PRD, consistent with official D3 React guidance |
| shadcn/ui + Tailwind v4 | MEDIUM | Training data says supported; needs runtime validation |
| No React Query / Zustand | HIGH | Justified by data architecture (hardcoded data, 2 simple fetches) |
| Bundle size estimates | LOW | Approximate, based on training data |
| shadcn component list (17) | HIGH | Derived from PRD and ARCHITECTURE.md analysis |

## Gaps to Address

- Exact latest D3.js version (stated v7.9.0, may have patches since training cutoff)
- shadcn/ui CLI behavior with Tailwind CSS 4.2.0 specifically (must validate by running init)
- `@types/d3` compatibility with latest D3 v7.x (DefinitelyTyped can lag)
- Force simulation performance with 50+ nodes in React 19 strict mode (empirical test in Phase 5)
- D3 sub-module tree-shaking effectiveness with Next.js Turbopack bundler
- Korean text rendering in D3 SVG (font metrics, line breaking for node labels)

---

*Research summary: 2026-02-19*
