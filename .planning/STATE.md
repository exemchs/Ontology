# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-19)

**Core value:** 반도체 FAB의 그래프 DB 운영, 온톨로지 관계, 인프라를 통합 대시보드에서 D3.js로 시각화하고, RBAC 기반 PII 데이터 거버넌스를 시연한다.
**Current focus:** Phase 8 - Product UX Refinement

## Current Position

Phase: 8 of 8 (Product UX Refinement)
Plan: 7 of 8 in current phase (08-07 done)
Status: Executing Phase 08
Last activity: 2026-02-20 — Completed 08-03-PLAN.md

Progress: [████████████████████████░░░░] 87%

## Performance Metrics

**Velocity:**
- Total plans completed: 22
- Average duration: 3min
- Total execution time: 1.1 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-data-layer | 4/4 | 12min | 3min |
| 02-layout-shell | 2/2 | 4min | 2min |
| 03-ontology-dashboard | 4/4 | 14min | 3.5min |
| 04-dgraph-monitoring | 3/3 | 9min | 3min |
| 05-gpu-monitoring | 3/3 | 7min | 2.3min |
| 06-ontology-studio-user-mgmt | 3/3 | 9min | 3min |
| 07-query-console-rbac | 3/3 | 9min | 3min |
| 08-product-ux-refinement | 7/8 | 14min | 2min |

**Recent Trend:**
- Last 5 plans: 08-07 (2min), 08-06 (2min), 08-05 (2min), 08-04 (2min), 08-03 (2min)
- Trend: Stable

*Updated after each plan completion*
| Phase 04 P01 | 3min | 2 tasks | 2 files |
| Phase 04 P02 | 3min | 2 tasks | 2 files |
| Phase 04 P03 | 3min | 2 tasks | 5 files |
| Phase 04 P01 | 4min | 2 tasks | 3 files |
| Phase 05 P01 | 3min | 3 tasks | 13 files |
| Phase 05 P02 | 3min | 2 tasks | 2 files |
| Phase 05 P03 | 2min | 2 tasks | 2 files |
| Phase 06 P01 | 3min | 3 tasks | 6 files |
| Phase 06 P02 | 3min | 1 tasks | 1 files |
| Phase 06 P03 | 3min | 3 tasks | 8 files |
| Phase 07 P01 | 3min | 2 tasks | 9 files |
| Phase 07 P02 | 3min | 2 tasks | 7 files |
| Phase 07 P03 | 3min | 2 tasks | 5 files |
| Phase 08 P02 | 2min | 2 tasks | 3 files |
| Phase 08 P07 | 2min | 2 tasks | 4 files |
| Phase 08 P03 | 3min | 2 tasks | 7 files |

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
- [04-01]: DgraphNode extends ClusterNode locally in dgraph-data.ts (not modifying types/index.ts)
- [04-01]: Layout toggle swaps forces on existing simulation (no destroy/recreate) for smooth transitions
- [04-01]: Particle rAF loop runs continuously; toggle hides group via display:none for instant re-enable
- [04-01]: Status ring pulse uses SVG-injected CSS @keyframes for component encapsulation
- [04-01]: cleanupD3Svg cast to HTMLElement via `as unknown as HTMLElement` for SVG elements
- [04-02]: SVGSVGElement cast to HTMLElement for cleanupD3Svg (D3 select works on both element types)
- [04-02]: Legend rendered in JSX (not SVG) for better theme CSS variable integration
- [04-02]: ShardBarChart colorScale uses CSS var() references in legend for SSR-safe rendering
- [04-02]: Brush overlay behind dots with pointer-events:all on dots for hover interactivity
- [04-03]: Custom fixed-position div for popover (SVG triggers incompatible with Radix Popover)
- [04-03]: NodeDetailPanel renders inside Sheet managed by parent (content/container separation)
- [04-03]: Route at (authenticated)/monitoring/dgraph/page.tsx (existing route group, not top-level)
- [04-03]: DgraphMonitoringPage uses useCallback for all handlers to prevent re-render cascades
- [05-01]: Status badge colors use variant=outline with custom className (bg-color/15 + text/border)
- [05-01]: MetricBar temperature percentage normalized against 90C ceiling for visual bar
- [05-01]: Health issue relative time formatter: minutes/hours/days display
- [05-01]: Process memory formatted as GB when >= 1024 MB, else raw MB
- [05-01]: D3 stub props use underscore prefix (_series, _data) to suppress unused warnings
- [05-02]: Fixed Y-axis domain computed from ALL metric series, not just visible ones, to prevent scale jumping
- [05-02]: Temperature normalized against 90C ceiling for grouped bar comparison
- [05-02]: Legend allows toggling all but one GPU (minimum 1 visible to prevent empty chart)
- [05-02]: Tab-controlled D3 chart via shadcn Tabs setting React state that D3 useEffect depends on
- [05-03]: Heatmap color legend uses SVG linearGradient with 10-stop YlOrRd sampling
- [05-03]: Ridgeline KDE bandwidth=7 with 50 evaluation points for smooth density curves
- [05-03]: Ridgeline fill-opacity 0.6 with chart series CSS variables for theme integration
- [05-03]: isClient useState pattern for SSR guard instead of bare ref check
- [06-01]: RoleContext defaults to super_admin for full-access demo start
- [06-01]: Inbound relations derived by scanning all types for edges targeting selected type
- [06-01]: Route updated at (authenticated)/workspace/studio (existing route group, not top-level)
- [06-01]: TypeEditDialog save closes without persistence (POC)
- [06-02]: Drag only in Force mode (disabled in Radial/Hierarchy where positions are fixed)
- [06-02]: Arc sweep alternates by link index (idx % 2) for bidirectional edge visual separation
- [06-02]: SVGSVGElement cast for d3-selection to avoid null-union TS errors
- [06-02]: Mode ref pattern: modeRef synced from state for D3 callback access without effect re-run
- [06-02]: Node radius: sqrt(nodeCount) * 0.15 + 15, clamped 15-40px
- [06-03]: TypeDistributionChart uses full re-render on mode toggle (stacked/grouped) for POC simplicity
- [06-03]: UserTable role change updates both local array state and global RoleContext for cross-page role simulation
- [06-03]: TooltipProvider added to root layout for global tooltip support
- [06-03]: Role badge color mapping: red=super_admin, blue=service_app, gray=data_analyst, outline=auditor
- [07-01]: CodeMirror 6 via @uiw/react-codemirror for React integration with 'use client' SSR guard
- [07-01]: cm6-graphql for GraphQL syntax, @codemirror/lang-json for DQL syntax highlighting
- [07-01]: Mock execution uses 200-800ms random delay to simulate network latency
- [07-01]: ResultTab stores data[] inline for self-contained tab state
- [07-01]: Custom div-based tab bar (not shadcn Tabs) for close button and badge support
- [07-01]: FIFO eviction: oldest tab removed when exceeding 5 tab limit
- [07-02]: SVGSVGElement cast to HTMLElement for cleanupD3Svg (established pattern from Phase 04/06)
- [07-02]: d3-brush any-cast for TypeScript generic mismatch with d3-selection
- [07-02]: Scatter complexity derived from row data fields for varied point distribution
- [07-02]: Distribution full re-render on stacked/grouped toggle (POC simplicity, same as 06-03)
- [07-02]: Arc sweep direction based on x1 < x2 comparison for consistent curve rendering
- [07-03]: PiiDemo section placed below results area (Method A - always visible, query-independent)
- [07-03]: PII level badge variants: highest/high=destructive, medium=default, low=secondary, none=outline
- [07-03]: Role banner colors: emerald(super_admin), blue(service_app), amber(data_analyst), red(auditor)
- [07-03]: useMemo for role-dependent masking recomputation in PiiTable
- [08-02]: Installed shadcn Popover component as new UI dependency for notification dropdown
- [08-02]: Warning severity badge uses custom amber styling (consistent with Phase 3 pattern)
- [08-02]: Role badge color mapping: destructive=super_admin, blue=service_app, secondary=data_analyst, outline=auditor
- [08-07]: AdminGate component for non-admin role restriction on Access Control and Menu Config tabs
- [08-07]: All 4 tabs visible to all roles; admin-only tabs show access restriction message for non-super_admin
- [08-07]: UserTable sorts super_admin users to top with subtle bg-primary highlight
- [08-03]: CSS clip-path trapezoid approach for funnel chart (simpler than D3 SVG, per research)
- [08-03]: GpuCard extended with onClick + checkbox for dual interaction (detail vs comparison)
- [08-03]: Comparison filtering: when 2+ GPUs selected, GpuComparisonBar filters to selected subset
- [08-03]: GpuDetailPanel renders DCGM extended metrics from getGpuDetailData

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 1: shadcn/ui CLI + Tailwind CSS 4.2.0 호환성 런타임 검증 완료 (RESOLVED - Plan 01-01)
- Phase 4: Force simulation 50+ 노드 성능 React 19 strict mode에서 경험적 테스트 필요

## Session Continuity

Last session: 2026-02-20
Stopped at: Completed 08-03-PLAN.md
Resume file: .planning/phases/08-product-ux-refinement/08-03-SUMMARY.md
