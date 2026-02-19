# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-19)

**Core value:** 반도체 FAB의 그래프 DB 운영, 온톨로지 관계, 인프라를 통합 대시보드에서 D3.js로 시각화하고, RBAC 기반 PII 데이터 거버넌스를 시연한다.
**Current focus:** Phase 4 - DGraph Monitoring (In Progress)

## Current Position

Phase: 4 of 7 (DGraph Monitoring) - IN PROGRESS
Plan: 2 of 3 in current phase
Status: Plan 04-02 Complete
Last activity: 2026-02-19 — Completed 04-02-PLAN.md

Progress: [████████████] 55%

## Performance Metrics

**Velocity:**
- Total plans completed: 12
- Average duration: 3min
- Total execution time: 0.5 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-data-layer | 4/4 | 12min | 3min |
| 02-layout-shell | 2/2 | 4min | 2min |
| 03-ontology-dashboard | 4/4 | 14min | 3.5min |
| 04-dgraph-monitoring | 2/3 | 6min | 3min |

**Recent Trend:**
- Last 5 plans: 04-02 (3min), 04-01 (3min), 03-04 (4min), 03-03 (4min), 03-02 (4min)
- Trend: Stable

*Updated after each plan completion*
| Phase 04 P01 | 3min | 2 tasks | 2 files |
| Phase 04 P02 | 3min | 2 tasks | 2 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: 7 phases derived. Phases 4-6 independent (parallelizable). Query Console + RBAC combined as killer demo phase.
- [Research]: shadcn/ui + Tailwind v4.2.0 compatibility must be validated first action in Phase 1.
- [01-01]: shadcn v3.8.5 uses @import "shadcn/tailwind.css" + @custom-variant dark (newer format than research predicted)
- [01-01]: Chart vars use --chart-N naming, mapped to --color-chart-N in @theme inline
- [01-01]: exem-ui blue accent (blue-05) for eXemble identity, dark mode uses -04 shades
- [01-02]: OntologyRelation extracted as named interface for reusability
- [01-02]: Single migration file combines schema + seed for POC simplicity
- [01-02]: snake_case in DB, camelCase in TS; mapping deferred to data layer
- [01-03]: chart-theme resolves --chart-N (not --color-chart-N) since globals.css defines chart series at --chart-N level
- [01-03]: tooltip uses CSS variables directly for automatic theme responsiveness
- [01-03]: chart-utils imports only d3-selection (selective import) to minimize bundle impact
- [01-04]: Inline addJitter per data file (chart-utils not imported to avoid dependency on 01-03)
- [01-04]: PII config uses PiiAction string enum with getMaskFn resolver (serializable config)
- [01-04]: FAB PII: 8 fields, General PII: 6 fields, both with 4-role action matrices
- [02-01]: eXemble logo as styled text for POC (no external SVG asset needed)
- [02-01]: D3 graph uses CSS variable colors for automatic theme integration
- [02-01]: Deleted root page.tsx to avoid conflict with (authenticated) route group
- [02-01]: Auth guard renders null during redirect to prevent FOUC
- [02-02]: useSidebar().state for collapse detection instead of CSS-only approach
- [02-02]: Welcome popup uses onOpenChange for any-dismissal tracking (Escape + overlay + button)
- [02-02]: Command palette Actions group with theme toggle alongside navigation groups
- [03-01]: MetricCard uses lucide TrendingUp/Down/Minus icons with green/red/muted colors for trend indication
- [03-01]: Warning badge uses custom amber styling since shadcn Badge lacks a warning variant
- [03-01]: Dashboard data functions called at module scope for static generation compatibility
- [03-01]: Severity badge mapping: error=destructive, warning=custom-amber, info=secondary
- [03-02]: ResourceGauge resolves var(--color-chart-N) via regex extraction + getComputedStyle for D3 fill
- [03-02]: Gauge glow uses feGaussianBlur stdDeviation=3.5 + feComposite with useId() for unique filter IDs
- [03-02]: DualLineChart uses simple toggle buttons instead of shadcn Tabs (not installed)
- [03-02]: D3 arc gauge pattern: startAngle=-3PI/4, endAngle=3PI/4 for 270-degree bottom-gap arc
- [03-03]: SVG glow filter uses feGaussianBlur(stdDeviation=4) + feMerge applied to ALL scatter circles
- [03-03]: Scatter status colors: healthy=chart1, warning=chart4, error=chart8
- [03-03]: Bar chart forEach over d3.stack() series avoids TypeScript parentNode issues with EnterElement
- [03-03]: Stacked/Grouped toggle uses full re-render for POC simplicity
- [03-04]: Force Graph as default view per user decision
- [03-04]: Sankey-only direction filter (Chord/Force have none) per user decision
- [03-04]: OntologyRelationChart wraps its own Card for self-contained layout with toggle
- [03-04]: ChartSkeleton import removed from page.tsx since all placeholders replaced
- [04-02]: SVGSVGElement cast to HTMLElement for cleanupD3Svg (D3 select works on both element types)
- [04-02]: Legend rendered in JSX (not SVG) for better theme CSS variable integration
- [04-02]: ShardBarChart colorScale uses CSS var() references in legend for SSR-safe rendering
- [04-02]: Brush overlay behind dots with pointer-events:all on dots for hover interactivity

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 1: shadcn/ui CLI + Tailwind CSS 4.2.0 호환성 런타임 검증 완료 (RESOLVED - Plan 01-01)
- Phase 4: Force simulation 50+ 노드 성능 React 19 strict mode에서 경험적 테스트 필요

## Session Continuity

Last session: 2026-02-19
Stopped at: Completed 04-02-PLAN.md
Resume file: .planning/phases/04-dgraph-monitoring/04-02-SUMMARY.md
