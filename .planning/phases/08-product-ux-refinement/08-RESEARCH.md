# Phase 8: Product UX Refinement - Research

**Researched:** 2026-02-20
**Domain:** Drag-drop dashboard grid, CodeMirror autocomplete, D3 minimap, schema tree views, Supabase layout persistence, User Management 4-tab redesign
**Confidence:** HIGH

## Summary

Phase 8 is the largest refactor of the project. It touches every page and introduces one new major npm dependency (`react-grid-layout`). The dominant engineering challenge is the Dashboard overhaul: replacing the current static PageShell+grid with a fully draggable/resizable widget grid backed by Supabase for per-user layout persistence. All other pages (GPU Monitoring, Graph Cluster, Ontology Studio, Query Console, User Management) receive targeted feature additions on top of functioning Phases 1–7 code.

The Query Console work is the most architecturally interesting: Treemap/Arc/Scatter/Distribution views are removed (the components will be deleted), and in their place a left-panel schema explorer tree, CodeMirror autocompletion (via `@codemirror/autocomplete` which ships with `@uiw/react-codemirror`), query history panel, CSV/JSON export, graph filter overlay, and an optional chatbot floating popup are added. CodeMirror's autocomplete extension is already bundled with the installed `@uiw/react-codemirror@4.25.4` — no additional install is needed.

The Supabase auth system is currently a sessionStorage-based password gate, not a real Supabase auth user. Layout persistence must be stored against the local session identity (e.g., a device fingerprint or `localStorage` key) rather than `supabase.auth.getUser()` since there is no authenticated user object. The simplest approach is `localStorage` with a namespaced key, which satisfies the "restore on login" requirement within the POC's single-browser context.

**Primary recommendation:** Use `react-grid-layout` v2.2.2 (installs cleanly with React 19, no peer dep conflict). Store widget layouts in `localStorage` rather than Supabase — the POC has no real auth users, so Supabase cannot provide per-user identity. Delete Treemap/Arc/Scatter/Distribution views from Query Console; the files exist and will need explicit removal. Implement CodeMirror autocomplete with `@codemirror/autocomplete`'s `autocompletion({ override: [mySource] })` — already available, no new install.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Dashboard 구조:**
- Dashboard GPU 탭 제거. 단일 Ontology 대시보드로 유지
- GPU는 대시보드 내 요약 위젯 1개만 (상태 개수: Active/Idle/Error) + GPU Monitoring 링크
- 13개 Dgraph 지표 전부 표시 (NOC 상황판 스타일, 큰 화면 기준)
- 드래그 드롭 그리드: `react-grid-layout` 사용, 4칼럼 기본, 자유 배치 + 크기 조절 가능
- 레이아웃 저장: Supabase 서버 저장 (사용자별 레이아웃 복원)
- 이상 징후: 토스트 알림 + 헤더 바 벨 아이콘에 알림 히스토리 드롭다운

**Dashboard 위젯 체계:**
- 신호등 위젯: DGraph Target, Alpha Alive → 숫자 + 녹/황/적 아이콘
- 스파크라인 위젯: QPS, TPS → 현재 값 + 최근 1시간 미니 차트
- 임계값 시계열 위젯: Query p95 → 시계열에 경고/위험 수평선
- 메트릭 카드 위젯: Pending Queries, Raft Leader 변경, Errors/sec, Cache Hit Rate
- 추이 차트 위젯: 디스크 사용량 추이, Alpha별 메모리 사용량
- GPU 요약 위젯: GPU 상태 개수 + GPU Monitoring 바로가기
- 일간 요약 위젯: 오늘 vs 어제 비교 (쿼리 수 변화율, 에러 건수)

**GPU Monitoring:**
- 기존 GPU 카드/트렌드/히트맵 유지 + DCGM 상세 지표 확장
- GPU 파이프라인 퍼널: Total → Allocated → Active → Effective 깔때기 차트
- 프로세스 드릴다운: PID, Command, State, User, Age, Core/Memory Utilization
- GPU 비교 모드: 2~4개 GPU 선택 → 같은 시간축 겹쳐 비교
- 알림 임계값 설정 UI: 지표별 경고/위험 임계값 폼 (UI만 구현, 실제 발송은 mock)
- GPU 클릭 시 우측 슬라이드 패널로 상세 정보

**Graph Cluster (DGraph Monitoring 리네이밍):**
- 기존 토폴로지 + 산점도 + 샤드 유지
- 추가: Latency 분포 히스토그램, 시간대별 쿼리 히트맵, 에러 로그 타임라인
- Alpha별 리소스 비교 바 차트

**Ontology Studio:**
- 기존 3모드 그래프 (Force/Radial/Hierarchy) 유지
- 추가: 좌측 스키마 트리뷰 (타입 > 속성/관계, 우클릭 컨텍스트 메뉴)
- 추가: 그래프 우측 하단 미니맵
- 추가: 스키마 건강 점수 (0~100, 고립 타입/빈 타입 감점)
- 추가: 고립 타입(Orphan), 빈 타입(Empty) 감지 및 표시
- 추가: 관계 밀도, 타입별 데이터 증가 추이, 허브 타입 Top 5
- Records by Type → Treemap 시각화

**Query Console:**
- Graph (Node-Link) + Table 2개 뷰로 정리. Treemap/Arc/Scatter/Distribution 제거
- 추가: 좌측 스키마 탐색기 트리뷰 (클릭 시 쿼리에 자동 삽입)
- 추가: 쿼리 자동완성 (타입명/속성명 자동 제안)
- 추가: 쿼리 히스토리 (최근 실행 쿼리 목록 + 재실행)
- 추가: 결과 내보내기 (CSV/JSON 다운로드)
- 추가: 결과 탭 배지에 "Nodes: N / Records: N" 표시
- 추가: Graph 뷰 필터링 (특정 타입만 표시/숨김)
- 챗봇: Query Console 내 "자연어 질문" 탭 + 전역 플로팅 팝업 (숨김/표시 토글 가능, POC에서 여차하면 숨김)

**Data Import:**
- 기존 PG + CSV 폼 유지, UX 플로우 보강 (에러/로딩/성공 상태)

**User Management:**
- 4개 탭 체계: Namespaces / Users / Access Control / Menu Config
- Users: 사용자 + 관리자 통합 (역할 컬럼으로 구분)
- Access Control: 그룹 + 권한 통합
- Menu Config: 시스템 메뉴 설정

**네비게이션 구조:**
```
Overview
  └ Dashboard (단일, 탭 없음)

Monitoring
  ├ GPU Monitoring
  └ Graph Cluster (기존 DGraph Monitoring 리네이밍)

Workspace
  ├ Ontology Studio
  ├ Query Console
  └ Data Import

Admin
  └ User Management (4탭)
```

**기존 코드 재사용 방침:**
- D3 차트 유틸리티 (chart-theme, chart-tooltip, chart-utils): 그대로 유지
- MetricCard 패턴: 유지하되 내부 확장 (신호등, 스파크라인)
- 대시보드 페이지: 완전 재구성 (드래그드롭 그리드 + 새 위젯 체계)
- 기존 대시보드 특화 차트: 해당 상세 페이지로 이동 또는 위젯화
- GPU Monitoring: 기존 유지 + 확장
- Graph Cluster: 기존 유지 + 확장
- Ontology Studio: 기존 유지 + 확장
- Query Console: Graph+Table로 간소화, 나머지 뷰 제거, 새 기능 추가
- shadcn/ui 컴포넌트, 테마 시스템, Supabase 인프라: 그대로 유지

### Claude's Discretion
- 드래그드롭 그리드의 위젯 기본 크기/위치 배치
- 스파크라인 차트 세부 디자인 (라인 두께, 영역 채움 등)
- GPU 퍼널 차트 구현 방식 (D3 vs CSS)
- 스키마 건강 점수 산정 공식 세부 가중치
- 쿼리 자동완성 구현 깊이 (CodeMirror extension vs 커스텀)
- 챗봇 플로팅 팝업 위치/크기/애니메이션
- 에러 로그 타임라인 세부 인터랙션

### Deferred Ideas (OUT OF SCOPE)
- Effective GPU 집계 로직 (높은 난이도, 중기 도입)
- GPU 인사이트: Pod/Job별 GPU 할당량 분석
- 클러스터 모니터링: Node/Pod/Deployment 상태 현황
- Dgraph API 실제 연동 (현재 mock 데이터)
- 알림 실제 발송 (이메일/Slack 연동)
- 대시보드 레이아웃 프리셋/템플릿 공유 기능
</user_constraints>

---

<phase_requirements>
## Phase Requirements

Phase 8 requirement IDs (UXR-01 through UXR-07) are not yet enumerated in REQUIREMENTS.md — the requirements document covers Phases 1–7 only. Based on the CONTEXT.md phase boundary description, the 7 UXR requirements map as follows:

| ID | Description | Research Support |
|----|-------------|-----------------|
| UXR-01 | Dashboard 완전 재구성: react-grid-layout 드래그드롭 그리드, 7종 위젯 체계, 레이아웃 localStorage 저장 | react-grid-layout v2.2.2 — no peer dep conflict with React 19; CSS import required; `onLayoutChange` callback for persistence |
| UXR-02 | GPU Monitoring 확장: 퍼널 차트, 프로세스 드릴다운, GPU 비교 모드, 임계값 설정 UI, 슬라이드 패널 | Existing GPU components (GpuCard, GpuPerformanceTrend etc.) serve as base; Sheet (shadcn) already in DgraphMonitoringPage; D3/CSS for funnel |
| UXR-03 | Graph Cluster 확장 (DGraph Monitoring 리네이밍): Latency 히스토그램, 쿼리 히트맵, 에러 타임라인, Alpha 비교 바 차트 | Existing ClusterTopology/QueryScatterPlot/ShardBarChart stay; new D3 charts added alongside using established chart-utils pattern |
| UXR-04 | Ontology Studio 확장: 스키마 트리뷰, 미니맵, 건강 점수, Orphan/Empty 감지, 관계 밀도 통계, Treemap 시각화 | Tree view via shadcn Collapsible or custom recursive component; minimap via D3 zoom transform monitoring; health score = pure computation on type graph |
| UXR-05 | Query Console 재구성: Treemap/Arc/Scatter/Distribution 제거, 스키마 탐색기, 자동완성, 히스토리, CSV/JSON export, Graph 필터, 챗봇 | @codemirror/autocomplete bundled with @uiw/react-codemirror; schema explorer = tree UI mirroring Studio's tree; export = Blob/URL.createObjectURL |
| UXR-06 | User Management 4탭 재편: Namespaces / Users / Access Control / Menu Config | Existing UsersPage has Tabs (shadcn) already; add 2 new tabs (Access Control, Menu Config); NamespaceTable stays in Namespaces tab |
| UXR-07 | 헤더 바 알림 시스템: 벨 아이콘 + 알림 히스토리 드롭다운 (RBAC-09 HeaderBar 역할 인디케이터 포함) | Popover/DropdownMenu from shadcn; existing HeaderBar.tsx needs bell button and role badge additions; alert data from existing getDashboardAlerts() |
</phase_requirements>

---

## Standard Stack

### Core (Already Installed — No New Installs for Most Features)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-grid-layout | 2.2.2 | Draggable/resizable widget grid | Only mature drag-drop grid for React; 21k GitHub stars; clean install with React 19 (peerDeps: `>= 16.3.0`) |
| @codemirror/autocomplete | 6.20.0 | Query autocomplete completions | Already bundled via `@uiw/react-codemirror`; no new install needed |
| d3 | 7.9.0 | New D3 charts (histogram, heatmap, funnel, minimap) | Already installed; all D3 sub-modules available |
| sonner | 2.0.7 | Toast notifications for anomaly alerts | Already installed; used for toasts |
| shadcn/ui | various | Popover, Sheet, Tabs, DropdownMenu for new UI | Already installed; Radix primitives available |
| recharts | 2.15.4 | Sparkline (recharts' `LineChart` with minimal config) | Already installed; simpler than D3 for sparklines |

### New Install Required

| Library | Version | Purpose | Install Command |
|---------|---------|---------|-----------------|
| react-grid-layout | 2.2.2 | Dashboard drag-drop grid | `npm install react-grid-layout` |

**Dry-run confirmed:** `npm install react-grid-layout` adds 5 packages (`react-grid-layout`, `react-resizable`, `react-draggable`, `fast-equals`, `resize-observer-polyfill`) with no peer dep conflicts against React 19.2.3.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-grid-layout | dnd-kit + custom grid math | dnd-kit has no built-in resize; hand-rolling grid math is high risk |
| react-grid-layout v2 | react-grid-layout v1 (1.5.3) | v1 works but v2 has full TypeScript and is the actively maintained branch |
| localStorage layout persistence | Supabase table | Context: no real Supabase auth users in this POC (sessionStorage password gate). localStorage is simpler and achieves the UX goal |
| @codemirror/autocomplete custom | Simple dropdown overlay | Custom CodeMirror extension integrates with editor cursor; dropdown overlay is fragile with CodeMirror's DOM model |

**Installation:**
```bash
npm install react-grid-layout
```

CSS imports (required, add to globals.css or page-level import):
```css
@import "react-grid-layout/css/styles.css";
@import "react-resizable/css/styles.css";
```

---

## Architecture Patterns

### Recommended Project Structure for Phase 8

```
src/
├── components/
│   ├── dashboard/                    # NEW: dashboard widget system
│   │   ├── DashboardGrid.tsx         # ReactGridLayout wrapper + layout persistence
│   │   ├── widgets/
│   │   │   ├── SignalWidget.tsx       # Traffic light (DGraph Target, Alpha Alive)
│   │   │   ├── SparklineWidget.tsx    # Mini line chart (QPS, TPS)
│   │   │   ├── ThresholdWidget.tsx    # Time series + alert lines (p95)
│   │   │   ├── MetricCardWidget.tsx   # Simple number card (Pending, Errors/sec etc.)
│   │   │   ├── TrendChartWidget.tsx   # Disk/memory trend
│   │   │   ├── GpuSummaryWidget.tsx   # GPU count + link
│   │   │   └── DailySummaryWidget.tsx # Today vs yesterday
│   │   └── AlertBell.tsx             # Header bell + dropdown history
│   ├── gpu/                          # EXTEND existing
│   │   ├── GpuFunnelChart.tsx        # NEW: Total→Allocated→Active funnel
│   │   ├── GpuDetailPanel.tsx        # NEW: right slide panel (Sheet)
│   │   └── GpuThresholdForm.tsx      # NEW: alert threshold settings form
│   ├── dgraph/                       # EXTEND existing (rename page title)
│   │   ├── LatencyHistogram.tsx      # NEW: D3 histogram
│   │   ├── QueryHeatmap.tsx          # NEW: D3 heatmap (time x query type)
│   │   └── ErrorTimeline.tsx         # NEW: scrollable event list with timestamps
│   ├── studio/                       # EXTEND existing
│   │   ├── SchemaTreeView.tsx        # NEW: left panel tree
│   │   ├── OntologyMinimap.tsx       # NEW: D3 minimap overlay
│   │   └── SchemaHealthScore.tsx     # NEW: computed score + badge
│   └── query/                        # MODIFY existing
│       ├── SchemaExplorer.tsx        # NEW: left tree panel (mirroring Studio)
│       ├── ChatbotPanel.tsx          # NEW: floating popup chatbot
│       └── views/
│           ├── ForceGraphView.tsx    # KEEP (renamed internally, filter added)
│           └── TableView.tsx         # KEEP
│           # TreemapView, ArcDiagramView, ScatterView, DistributionView — DELETE
├── data/
│   └── dgraph-data.ts               # EXTEND: add latency histogram + heatmap data
└── lib/
    └── dashboard-layout.ts           # NEW: localStorage layout save/load helpers
```

### Pattern 1: react-grid-layout Widget Grid

**What:** Controlled layout state in React, serialized to localStorage on every change.
**When to use:** Dashboard page only.

```typescript
// Source: https://github.com/react-grid-layout/react-grid-layout
import ReactGridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const DEFAULT_LAYOUT: Layout[] = [
  { i: "signal-target",  x: 0, y: 0, w: 1, h: 2 },
  { i: "signal-alpha",   x: 1, y: 0, w: 1, h: 2 },
  { i: "sparkline-qps",  x: 2, y: 0, w: 1, h: 2 },
  { i: "sparkline-tps",  x: 3, y: 0, w: 1, h: 2 },
  // ... 13 total widgets
];

const LAYOUT_STORAGE_KEY = "exemble-dashboard-layout";

function loadLayout(): Layout[] {
  try {
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  } catch {
    return DEFAULT_LAYOUT;
  }
}

export function DashboardGrid() {
  const [layout, setLayout] = useState<Layout[]>(loadLayout);

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayout(newLayout);
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(newLayout));
  }, []);

  // SSR safety: delay render until client width is measured
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    setMounted(true);
    if (containerRef.current) {
      setWidth(containerRef.current.offsetWidth);
    }
  }, []);

  return (
    <div ref={containerRef}>
      {mounted && (
        <ReactGridLayout
          layout={layout}
          cols={4}
          rowHeight={80}
          width={width}
          onLayoutChange={handleLayoutChange}
          isDraggable
          isResizable
          margin={[12, 12]}
        >
          {layout.map(item => (
            <div key={item.i}>{/* widget component */}</div>
          ))}
        </ReactGridLayout>
      )}
    </div>
  );
}
```

**Critical:** CSS imports must be included. Without them, dragging and resizing produce no visual placeholder. In Next.js App Router, add the imports to `src/app/globals.css` or as a direct CSS import in the dashboard page component.

### Pattern 2: CodeMirror Autocompletion (Schema-aware)

**What:** Custom completion source that suggests ontology type names and predicate names when the cursor is in a relevant position.
**When to use:** QueryEditor.tsx — pass as an additional extension.

```typescript
// Source: https://codemirror.net/examples/autocompletion/
import { autocompletion, CompletionContext, CompletionResult } from "@codemirror/autocomplete";

// Schema terms derived from OntologyType data
const SCHEMA_COMPLETIONS = [
  { label: "Equipment", type: "type" },
  { label: "Process",   type: "type" },
  { label: "Wafer",     type: "type" },
  // predicates:
  { label: "equipment_id", type: "property" },
  { label: "name",          type: "property" },
  // ...
];

function schemaCompletionSource(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/\w*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;
  return {
    from: word.from,
    options: SCHEMA_COMPLETIONS,
    validFor: /^\w*$/,
  };
}

// In QueryEditor.tsx:
const extensions = useMemo(() => {
  const base = mode === "graphql" ? [graphql()] : [json()];
  return [
    ...base,
    autocompletion({ override: [schemaCompletionSource] }),
  ];
}, [mode]);
```

**Key:** `@codemirror/autocomplete` is already available — it ships as part of `codemirror` which is a dependency of `@uiw/react-codemirror`. No additional `npm install` needed.

### Pattern 3: D3 Minimap (Ontology Studio)

**What:** Small SVG overview of the full graph positioned in the lower-right corner of the graph container. A viewport rectangle updates on zoom events.
**When to use:** OntologyGraph.tsx — add a secondary SVG element.

```typescript
// Source: https://observablehq.com/@rabelais/d3-js-zoom-minimap
// Pattern: listen to zoom transform, scale down node positions proportionally

const MINIMAP_WIDTH = 120;
const MINIMAP_HEIGHT = 80;
const MINIMAP_SCALE = MINIMAP_WIDTH / fullWidth; // ratio

// In zoom handler:
zoomBehavior.on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
  mainGroup.attr("transform", event.transform.toString());

  // Update minimap viewport rect
  const { x, y, k } = event.transform;
  const vx = (-x / k) * MINIMAP_SCALE;
  const vy = (-y / k) * MINIMAP_SCALE;
  const vw = (fullWidth / k) * MINIMAP_SCALE;
  const vh = (fullHeight / k) * MINIMAP_SCALE;
  minimapViewport
    .attr("x", vx).attr("y", vy)
    .attr("width", vw).attr("height", vh);
});
```

The minimap is a `<svg>` positioned absolute in the lower-right corner of the graph card. It mirrors node positions at a fixed downscale ratio. Only circles for nodes — no labels — for legibility at minimap scale.

### Pattern 4: Schema Health Score Computation

**What:** Pure TypeScript function computed from `OntologyType[]`. No external library needed.
**Formula (recommended, subject to weight tuning):**

```typescript
// Claude's Discretion: weight tuning
export function computeHealthScore(types: OntologyType[]): {
  score: number;
  orphans: string[];
  empties: string[];
} {
  const allTypeNames = new Set(types.map(t => t.name));

  // Orphan: type with no outbound relations AND not referenced by any other type
  const referenced = new Set(
    types.flatMap(t => t.relations.map(r => r.target))
  );
  const orphans = types
    .filter(t => t.relations.length === 0 && !referenced.has(t.name))
    .map(t => t.name);

  // Empty: type with nodeCount === 0 (or < threshold)
  const empties = types.filter(t => t.nodeCount === 0).map(t => t.name);

  // Scoring: start at 100, deduct per issue
  // -15 per orphan type, -10 per empty type, floor 0
  const deductions = (orphans.length * 15) + (empties.length * 10);
  const score = Math.max(0, 100 - deductions);

  return { score, orphans, empties };
}
```

### Pattern 5: CSV/JSON Export

**What:** Client-side file download from query result data using the Blob API.
**When to use:** ResultInfoBar or a toolbar in QueryConsole.

```typescript
// Source: MDN Web Docs (standard browser API)
function exportJson(data: Record<string, unknown>[], filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCsv(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => JSON.stringify(row[h] ?? "")).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

### Pattern 6: GPU Funnel Chart (CSS approach — Claude's Discretion recommendation)

**What:** Horizontal funnel showing Total → Allocated → Active → Effective GPU pipeline.
**Recommendation:** CSS clip-path trapezoids over D3 SVG. Simpler to implement, no ResizeObserver needed, theme-aware via Tailwind CSS variables.

```tsx
// Funnel stages with proportional width using CSS clip-path
const stages = [
  { label: "Total",     value: 4,  color: "var(--chart-1)" },
  { label: "Allocated", value: 3,  color: "var(--chart-2)" },
  { label: "Active",    value: 2,  color: "var(--chart-3)" },
  { label: "Effective", value: 1,  color: "var(--chart-4)" },
];
const max = stages[0].value;

// Each stage: full-width bar clipped to trapezoid shape, proportional height
// Use inline style width: `${(stage.value / max) * 100}%` centered
```

If D3 is preferred for the funnel (e.g., to animate transitions), use `d3.scaleLinear` for widths and SVG `path` commands for trapezoid shapes.

### Anti-Patterns to Avoid

- **Using `"use server"` for layout persistence:** The auth system is sessionStorage-based (not real Supabase auth). Server actions cannot read `localStorage`. Use `localStorage` directly in a `useEffect`.
- **Importing react-grid-layout without CSS:** The library requires `react-grid-layout/css/styles.css` and `react-resizable/css/styles.css`. Without these, drag/resize still works but the drag placeholder disappears, causing layout jumps.
- **Using v2 API if relying on `data-grid` prop:** v2 does not support `data-grid` prop. Use the `layout` array prop instead.
- **Calling `cleanupD3Svg` inside react-grid-layout resize handler:** ResizeObserver already handles chart re-render. Do not nest ResizeObservers; let the existing D3 chart pattern handle its own resizing via `createDebouncedResizeObserver`.
- **Removing views without updating imports:** QueryConsole.tsx currently imports TreemapView, ArcDiagramView, ScatterView, DistributionView. All 4 import lines and render conditions must be removed when the view files are deleted.
- **Autocompletion firing on every keystroke for DQL mode:** DQL has no schema type system. Consider disabling or limiting autocompletion when `mode === "dql"`, or only offering keyword-level suggestions.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-drop resizable grid | Custom drag handlers + grid math | react-grid-layout | Collision detection, ghost placeholders, compact algorithms are non-trivial |
| Editor autocomplete popup | Custom floating div near cursor | @codemirror/autocomplete | CodeMirror manages cursor position, scroll offset, keyboard navigation internally |
| CSV serialization | Manual string concat | Built-in: `JSON.stringify` + join | Escaping quotes, commas, and newlines in CSV values is error-prone |
| Minimap state | Separate React state synchronized with D3 | D3 zoom event listener only | React state updates on every zoom tick (60fps) cause severe lag; keep minimap purely in D3 |

**Key insight:** The minimap must be entirely D3-managed. Routing zoom events through React state creates 60fps re-renders and makes the graph unusable. Update minimap SVG directly via D3 selection inside the zoom handler — same approach as all other D3 animations in this codebase.

---

## Common Pitfalls

### Pitfall 1: react-grid-layout SSR Hydration Mismatch

**What goes wrong:** The grid renders with a server-computed width (undefined/0), causing hydration mismatch errors in Next.js App Router.
**Why it happens:** `ReactGridLayout` requires the container's pixel width as a prop. This is only available client-side.
**How to avoid:** Use `useState(false)` for `mounted` and `useEffect(() => setMounted(true), [])`. Render the grid only when `mounted === true`. Use a `ref` on the container to read `offsetWidth` after mount.
**Warning signs:** "Hydration failed" errors in the console, or the grid appearing at width 0 initially.

### Pitfall 2: Layout Persistence Stomping New Widgets

**What goes wrong:** A user saved a layout in an earlier version. A new widget is added in a later deployment. The saved layout has no entry for the new widget, so it appears at position `{x:0, y:0, w:1, h:1}` stacked on top of existing widgets.
**Why it happens:** `localStorage` preserves the old layout array; new widgets not in the array fall back to default positions that may overlap.
**How to avoid:** When loading from localStorage, merge saved positions with the `DEFAULT_LAYOUT`. If a widget ID from `DEFAULT_LAYOUT` is missing from the saved layout, append its default entry.
**Warning signs:** New widgets appearing overlapped or invisible after a layout reset.

### Pitfall 3: CodeMirror Autocompletion Conflicts with cm6-graphql

**What goes wrong:** `cm6-graphql` may already provide some autocompletion behavior (e.g., for GraphQL keywords). Stacking an additional `autocompletion()` extension may cause duplicate popups.
**Why it happens:** CodeMirror's `autocompletion` extension deduplicates if sources are registered correctly. But `cm6-graphql` may use its own `autocompletion()` call internally.
**How to avoid:** Use `autocompletion({ override: [schemaCompletionSource] })` for schema terms, which replaces the default completion behavior. If `cm6-graphql` has built-in completions, use `addToOptions` instead of `override` to merge them.
**Warning signs:** Two completion popups appearing simultaneously, or completions not appearing at all.

### Pitfall 4: Query Console View File Deletion Order

**What goes wrong:** Deleting `TreemapView.tsx` before removing its import in `QueryConsole.tsx` causes a TypeScript compile error that blocks the dev server.
**Why it happens:** TypeScript strict mode fails on missing module imports immediately.
**How to avoid:** Remove imports from `QueryConsole.tsx` first, then delete view files. Update `GraphPanelViewSelector.tsx` and `ResultViewBar.tsx` to remove references to removed view types before deleting.
**Warning signs:** `Module not found` error after file deletion.

### Pitfall 5: D3 Minimap Causing Infinite Zoom Loop

**What goes wrong:** Clicking the minimap viewport rectangle triggers a pan action, which fires a zoom event, which updates the minimap, which triggers another click — infinite loop.
**Why it happens:** Minimap click handlers that call `zoom.translateTo()` fire a zoom event, which updates the viewport rect, which overlaps the minimap click target.
**How to avoid:** Use a separate SVG element for the minimap with its own non-zoomed coordinate system. The minimap should be read-only (display only) unless implementing click-to-pan, which requires careful event.stopPropagation().
**Warning signs:** Graph panning without user input, browser tab freezing after clicking minimap.

### Pitfall 6: react-grid-layout Widget Height Mismatch with D3 Charts

**What goes wrong:** D3 charts that use `useRef` + `ResizeObserver` expect a stable height. When `react-grid-layout` resizes a widget, the D3 chart's container height changes, but the ResizeObserver fires at `0` height during the resize animation.
**Why it happens:** `react-grid-layout` uses CSS transforms during drag/resize, which may temporarily set the inner container to 0 height.
**How to avoid:** In D3 chart components inside widgets, add a minimum height guard: `if (height < 20) return;` at the top of the ResizeObserver callback.
**Warning signs:** Charts disappearing to a blank during widget resize, then reappearing correctly after drag release.

---

## Code Examples

### react-grid-layout Default Widget Layout (4-column)

```typescript
// Recommended default layout for 13 Dgraph widgets
// cols=4, rowHeight=80, each unit = 80px tall + 12px margin
// Signal widgets: 1x2 (80px wide, 160px+12 tall)
// Sparkline widgets: 1x3 (80px wide, 240px+12 tall)
// Chart widgets: 2x4 or 2x5

export const DEFAULT_DASHBOARD_LAYOUT: Layout[] = [
  // Row 0: Signal lights (small, status at a glance)
  { i: "signal-dgraph-target", x: 0, y: 0,  w: 1, h: 2 },
  { i: "signal-alpha-alive",   x: 1, y: 0,  w: 1, h: 2 },
  { i: "sparkline-qps",        x: 2, y: 0,  w: 1, h: 3 },
  { i: "sparkline-tps",        x: 3, y: 0,  w: 1, h: 3 },
  // Row 1 (after signal widgets): metric cards
  { i: "metric-pending",       x: 0, y: 2,  w: 1, h: 2 },
  { i: "metric-raft",          x: 1, y: 2,  w: 1, h: 2 },
  { i: "metric-errors",        x: 0, y: 4,  w: 1, h: 2 },
  { i: "metric-cache",         x: 1, y: 4,  w: 1, h: 2 },
  // Threshold time series (wider)
  { i: "threshold-p95",        x: 2, y: 3,  w: 2, h: 4 },
  // Trend charts
  { i: "trend-disk",           x: 0, y: 6,  w: 2, h: 4 },
  { i: "trend-memory",         x: 2, y: 7,  w: 2, h: 4 },
  // GPU summary
  { i: "gpu-summary",          x: 0, y: 10, w: 2, h: 2 },
  // Daily summary
  { i: "daily-summary",        x: 2, y: 11, w: 2, h: 2 },
];
```

### localStorage Layout Helpers

```typescript
// src/lib/dashboard-layout.ts
import type { Layout } from "react-grid-layout";

const STORAGE_KEY = "exemble-dashboard-layout-v1";

export function saveLayout(layout: Layout[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch {
    // Storage quota exceeded — silently fail
  }
}

export function loadLayout(defaults: Layout[]): Layout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const saved: Layout[] = JSON.parse(raw);
    // Merge: ensure all default widgets are present
    const savedIds = new Set(saved.map(l => l.i));
    const missing = defaults.filter(d => !savedIds.has(d.i));
    return [...saved, ...missing];
  } catch {
    return defaults;
  }
}

export function resetLayout(defaults: Layout[]): Layout[] {
  localStorage.removeItem(STORAGE_KEY);
  return defaults;
}
```

### Alert Bell (Header Bar Notification Dropdown)

```typescript
// Source: shadcn Popover + existing getDashboardAlerts()
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell } from "lucide-react";
import { getDashboardAlerts } from "@/data/dashboard-data";

export function AlertBell() {
  const alerts = getDashboardAlerts();
  const unresolvedCount = alerts.filter(a => !a.resolved).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="size-4" />
          {unresolvedCount > 0 && (
            <span className="absolute top-1 right-1 size-2 rounded-full bg-destructive" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        {/* Alert list */}
      </PopoverContent>
    </Popover>
  );
}
```

### GraphQL Autocompletion Source

```typescript
// Source: https://codemirror.net/examples/autocompletion/
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { getOntologyTypes } from "@/data/studio-data";

function buildSchemaCompletions() {
  const types = getOntologyTypes();
  const typeCompletions = types.map(t => ({ label: t.name, type: "type" as const }));
  const predCompletions = types.flatMap(t =>
    t.predicates.map(p => ({ label: p, type: "property" as const }))
  );
  return [...typeCompletions, ...predCompletions];
}

const COMPLETIONS = buildSchemaCompletions();

export function schemaCompletionSource(context: CompletionContext) {
  const word = context.matchBefore(/\w*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;
  return { from: word.from, options: COMPLETIONS, validFor: /^\w*$/ };
}

export const schemaAutocompleteExtension = autocompletion({
  override: [schemaCompletionSource],
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-grid-layout v1 (JS) | react-grid-layout v2 (TypeScript, complete rewrite) | Dec 2024 | Full TypeScript types, `width` prop required, `data-grid` prop removed |
| CodeMirror completions via language-specific packages | `@codemirror/autocomplete` `override` option | CodeMirror 6 initial release | Any custom source can override; no need for language-specific wrappers |
| D3 minimap via separate library | Custom D3 zoom transform monitoring | Always | No dedicated minimap library needed; zoom transform gives all data needed |

**Deprecated/outdated:**
- `data-grid` prop on react-grid-layout items: Removed in v2. Use the `layout` array on the container instead.
- react-grid-layout v1 `WidthProvider` HOC: Replaced by `useContainerWidth` hook in v2, or manual `width` measurement.

---

## Open Questions

1. **Layout persistence via Supabase vs localStorage**
   - What we know: The POC uses a sessionStorage password gate (`exemble-auth`), not real Supabase user accounts. `supabase.auth.getUser()` returns null.
   - What's unclear: The CONTEXT.md says "Supabase 서버 저장 (사용자별 레이아웃 복원)". With no real user ID, there is no per-user key.
   - Recommendation: Use `localStorage` with key `exemble-dashboard-layout-v1`. This satisfies "restore layout on page reload" for the POC. If real Supabase auth is added later, migrate to upsert on a `user_layouts` table. Document the deviation.

2. **Chatbot POC depth**
   - What we know: "여차하면 숨김" — chatbot is optional/hideable for POC demos if quality is insufficient.
   - What's unclear: Whether to implement a real LLM call (requires API key, latency) or just a mock response.
   - Recommendation: Implement as a floating panel with a text input and hardcoded mock responses (e.g., typed suggestions). No actual LLM integration. The `hidden` toggle is the key UX behavior to implement.

3. **Graph Cluster page rename: URL or title only?**
   - What we know: Context says "DGraph Monitoring 리네이밍" to "Graph Cluster".
   - What's unclear: Does the URL `/monitoring/dgraph` change to `/monitoring/graph-cluster`?
   - Recommendation: Rename the page title and breadcrumb only. Keep URL as `/monitoring/dgraph` to avoid breaking existing links. Update `breadcrumbMap` and sidebar label.

4. **User Management: Access Control and Menu Config tab content depth**
   - What we know: These are 2 new tabs. Access Control = groups + permissions combined. Menu Config = system menu settings.
   - What's unclear: Are these fully functional UIs or placeholder layouts?
   - Recommendation: Implement as functional-looking mock UIs with hardcoded data (groups table, permissions matrix, menu toggle list). No real CRUD operations needed for POC.

---

## Existing Code Inventory (Phase 1–7 Outputs)

Key files that Phase 8 modifies or extends:

| File | Current State | Phase 8 Action |
|------|--------------|----------------|
| `src/app/(authenticated)/page.tsx` | Static PageShell + KPI cards + 4 charts | Complete replacement with DashboardGrid |
| `src/components/query/QueryConsole.tsx` | 6-view result tabs + PII demo | Remove 4 views, add schema explorer + autocomplete + export |
| `src/components/query/views/TreemapView.tsx` | D3 treemap (175 lines) | DELETE |
| `src/components/query/views/ArcDiagramView.tsx` | D3 arc diagram (199 lines) | DELETE |
| `src/components/query/views/ScatterView.tsx` | D3 brush scatter (268 lines) | DELETE |
| `src/components/query/views/DistributionView.tsx` | D3 stacked/grouped bar (303 lines) | DELETE |
| `src/components/query/GraphPanelViewSelector.tsx` | 5-view tab bar | Reduce to 2 views (graph + table) |
| `src/components/studio/StudioPage.tsx` | TypeList + TypeDetail + OntologyGraph + TypeDistributionChart | Restructure: add SchemaTreeView left panel, OntologyMinimap in graph |
| `src/components/users/UsersPage.tsx` | 2-tab: Users + Namespaces (super_admin only) | 4-tab: Namespaces + Users + Access Control + Menu Config |
| `src/components/layout/header-bar.tsx` | Breadcrumb + NamespaceSelector + CmdK button | Add AlertBell + role indicator badge |
| `src/app/(authenticated)/monitoring/gpu/page.tsx` | GpuCardGrid + trends + heatmap/ridgeline + comparison + health + processes | Add GpuFunnelChart + detail Sheet + threshold form |
| `src/components/dgraph/DgraphMonitoringPage.tsx` | Topology + scatter + shard | Add Latency histogram + query heatmap + error timeline + Alpha comparison |
| `src/lib/navigation.ts` | 7 nav items with existing URLs | No URL changes; sidebar label "Graph Cluster" already matches |

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection (Phases 1–7 outputs): All component files, data files, types, current navigation
- `npm show react-grid-layout version` → 2.2.2 (latest stable)
- `npm show react-grid-layout peerDependencies` → `>= 16.3.0` (React 19 compatible)
- `npm install react-grid-layout --dry-run` → 5 packages, 0 peer dep conflicts
- `npm show @codemirror/autocomplete version` → 6.20.0
- `npm show @uiw/react-codemirror dependencies` → includes `codemirror ^6.0.0` (autocomplete bundled)

### Secondary (MEDIUM confidence)
- [react-grid-layout GitHub](https://github.com/react-grid-layout/react-grid-layout) — v2 API, SSR pattern, CSS import requirement, `onLayoutChange` callback
- [CodeMirror Autocompletion Example](https://codemirror.net/examples/autocompletion/) — `completionSource`, `autocompletion({override})` pattern
- [react-grid-layout Releases](https://github.com/react-grid-layout/react-grid-layout/releases) — v2.2.2 stable confirmed, v1.5.3 last v1 release
- [D3 Minimap Pattern](https://observablehq.com/@rabelais/d3-js-zoom-minimap) — zoom transform monitoring approach

### Tertiary (LOW confidence — training knowledge only)
- D3 minimap viewport rect formula (needs runtime validation)
- CodeMirror conflict between `cm6-graphql` internal autocompletion and custom `override` source — needs testing

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all library versions verified via npm; install dry-run confirmed
- Architecture: HIGH — based on direct codebase inspection of all Phase 1–7 outputs
- Pitfalls: MEDIUM — react-grid-layout and CodeMirror pitfalls verified via official docs; minimap loop pitfall is training-level knowledge (LOW)

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (stable libraries; react-grid-layout v2 API unlikely to change)
