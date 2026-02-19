# Phase 5: GPU Monitoring - Research

**Researched:** 2026-02-19
**Domain:** D3.js v7 multi-line, heatmap, ridgeline, grouped bar charts; GPU status cards; health/process tables; React client component patterns
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- GPU 카드 배치: 1행 4열 (가로 일렬) 배치
- GPU Summary 헤더 위에 총 GPU 수 + 평균 사용률 표시
- 각 카드: GPU 이름, 모델, 상태, 온도, 사용률, 전력
- 히트맵/리즈라인 전환: 같은 영역에서 토글로 전환 (히트맵 <-> 리즈라인)
- 히트맵: GPU x Time 매트릭스, sequential color scale, 호버 시 상세 값
- 리즈라인: 4 GPU 밀도 패턴, 수직 오프셋으로 비교
- Health Issues + Processes 배치: 하단 2컬럼 나란히 배치
- 좌측: Health Issues 목록 (severity 배지 + 메시지)
- 우측: GPU Processes 테이블 (PID, GPU, Memory, Name)

### Claude's Discretion
- GPU 카드 내부 디자인 (미니 게이지, 아이콘, 색상 코딩)
- 성능 트렌드 멀티라인 차트의 탭(Utilization/Temperature/Power/Memory) UI 스타일
- 히트맵 color scale 선택 (sequential warm/cool)
- 리즈라인 오프셋 간격과 그래디언트 스타일
- 비교 바 차트 디자인
- Health Issues 목록 최대 표시 건수
- Processes 테이블 컬럼 구성

### Deferred Ideas (OUT OF SCOPE)
없음
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GPU-01 | GPU 서머리 헤더 (총 GPU 수, 평균 사용률) | Architecture Patterns: summary header computed from `getGpuCards()` data, status-colored average badge |
| GPU-02 | GPU 카드 4장 (A100 80GB x 2 + A100 40GB x 2, 상태/온도/사용률) | Architecture Patterns: 1x4 grid layout, card design with mini gauges; Code Examples: GpuCard component using shadcn Card + Badge |
| GPU-03 | D3 성능 트렌드 멀티라인 (Utilization/Temperature/Power/Memory 탭, 범례 토글) | Code Examples: D3 multi-line chart with `d3.line()`, Tabs for metric switching, clickable legend to toggle series visibility |
| GPU-04 | D3 히트맵 (GPU x Time, sequential color scale) | Code Examples: D3 heatmap with `d3.scaleSequential(d3.interpolateYlOrRd)`, rect grid, hover tooltip |
| GPU-05 | D3 리즈라인 차트 (4 GPU 밀도 패턴 비교, 수직 오프셋) | Code Examples: D3 ridgeline with kernel density estimation, `d3.scaleBand()` for vertical offset, `d3.area()` for density curves |
| GPU-06 | D3 GPU 비교 바 차트 (Grouped bars, 4 GPU 나란히) | Code Examples: D3 grouped bar chart with `d3.scaleBand()` for groups and sub-groups, 4 metric categories |
| GPU-07 | Health Issues 목록 + Processes 테이블 | Architecture Patterns: data functions to add to gpu-data.ts; Code Examples: health issues list with severity Badge, processes table with shadcn Table |
</phase_requirements>

---

## Summary

Phase 5 builds the GPU Monitoring page at `/monitoring/gpu`, displaying 4 NVIDIA A100 GPUs with status cards, 4 D3 chart visualizations, and data tables. The page is data-visualization-heavy with 4 distinct D3 chart types (multi-line, heatmap, ridgeline, grouped bar) plus standard React components for cards and tables.

The data layer (`gpu-data.ts`) is already substantially built from Phase 1, providing `getGpuCards()`, `getGpuTimeSeries()`, `getGpuHeatmap()`, and `getGpuComparison()`. However, it is **missing** health issues and processes data needed for GPU-07 -- these must be added as `getGpuHealthIssues()` and `getGpuProcesses()` with corresponding TypeScript interfaces. All other data functions are ready to consume.

The most technically challenging component is the ridgeline chart (GPU-05), which requires kernel density estimation from the time series data. The heatmap-ridgeline toggle is a key UX decision: both charts occupy the same area and switch via a toggle. All D3 charts follow the established pattern from Phase 1: `useRef` for SVG container, `useEffect` for D3 rendering, `cleanupD3Svg()` for cleanup, `createDebouncedResizeObserver()` for responsiveness, `createTooltip()` for hover interactions, and `getChartColors()` for theme-aware colors.

**Primary recommendation:** Build the page top-down: summary header and GPU cards first (pure React, fastest to validate layout), then the 4 D3 charts in order of complexity (multi-line > grouped bar > heatmap > ridgeline), finally the bottom tables. Add missing data functions to `gpu-data.ts` before starting UI components.

---

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Verified |
|---------|---------|---------|----------|
| D3.js | ^7.9.0 | All chart rendering (multi-line, heatmap, ridgeline, grouped bar) | `package.json` |
| @types/d3 | ^7.4.3 | TypeScript definitions | `package.json` devDeps |
| React | 19.2.3 | Component framework | `package.json` |
| Next.js | 16.1.6 | App Router, page routing | `package.json` |
| Tailwind CSS | ^4 | Styling (cards, layout, grid) | `package.json` devDeps |

### Existing Utilities (from Phase 1)

| Utility | File | Purpose |
|---------|------|---------|
| `cleanupD3Svg()` | `chart-utils.ts` | Safe SVG cleanup with transition interruption |
| `createDebouncedResizeObserver()` | `chart-utils.ts` | Responsive chart resizing |
| `formatNumber()` | `chart-utils.ts` | Axis label formatting (1.5K, 2.5M) |
| `addJitter()` | `chart-utils.ts` | Data variation for "living" feel |
| `getChartColors()` | `chart-theme.ts` | Resolve CSS variables to concrete colors |
| `resolveColor()` | `chart-theme.ts` | Resolve single CSS variable |
| `createTooltip()` | `chart-tooltip.ts` | Body-appended tooltip with positioning |
| `ChartSkeleton` | `ChartSkeleton.tsx` | Loading state placeholder |
| `ChartEmpty` | `ChartEmpty.tsx` | Empty data state placeholder |

### shadcn/ui Components Used

| Component | File | Purpose |
|-----------|------|---------|
| `Card`, `CardHeader`, `CardContent` | `ui/card.tsx` | GPU card containers, chart containers |
| `Badge` | `ui/badge.tsx` | GPU status badges, severity badges |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `ui/tabs.tsx` | Multi-line chart metric switching |
| `Switch` | `ui/switch.tsx` | Heatmap/ridgeline toggle |
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | `ui/table.tsx` | Processes table |
| `Tooltip` | `ui/tooltip.tsx` | GPU card info tooltips |

### D3 Sub-modules Used

| Module | Import | Purpose |
|--------|--------|---------|
| `d3-scale` | `scaleLinear`, `scaleTime`, `scaleBand`, `scaleSequential` | All chart scales |
| `d3-scale-chromatic` | `interpolateYlOrRd` | Heatmap sequential color |
| `d3-shape` | `line`, `area`, `curveMonotoneX`, `curveBasis` | Multi-line curves, ridgeline area fills |
| `d3-axis` | `axisBottom`, `axisLeft` | Chart axes |
| `d3-selection` | `select` | DOM manipulation |
| `d3-time-format` | `timeFormat` | Time axis labels |
| `d3-array` | `extent`, `max`, `min`, `mean`, `range` | Data domain calculations |
| `d3-transition` | (implicit) | Animated transitions |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `d3.scaleSequential(interpolateYlOrRd)` for heatmap | `d3.scaleQuantize` with discrete colors | Sequential provides smooth gradient, better for continuous utilization data |
| Kernel density estimation for ridgeline | Raw histogram bins | KDE produces smoother, more visually appealing density curves |
| shadcn Tabs for metric switching | Custom button group | Tabs component handles ARIA, keyboard nav, active state styling automatically |

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   └── monitoring/
│       └── gpu/
│           └── page.tsx                    # GPU Monitoring page (server component)
│
├── components/
│   └── gpu/
│       ├── GpuSummaryHeader.tsx            # GPU-01: summary header
│       ├── GpuCard.tsx                     # GPU-02: individual GPU card
│       ├── GpuCardGrid.tsx                 # GPU-02: 1x4 card grid container
│       ├── GpuPerformanceTrend.tsx         # GPU-03: multi-line chart + tabs
│       ├── GpuHeatmap.tsx                  # GPU-04: heatmap chart
│       ├── GpuRidgeline.tsx               # GPU-05: ridgeline density chart
│       ├── GpuHeatmapRidgelineToggle.tsx   # GPU-04/05: container with toggle switch
│       ├── GpuComparisonBar.tsx            # GPU-06: grouped bar chart
│       ├── GpuHealthIssues.tsx             # GPU-07: health issues list
│       └── GpuProcessesTable.tsx           # GPU-07: processes table
│
├── data/
│   └── gpu-data.ts                        # UPDATE: add getGpuHealthIssues(), getGpuProcesses()
│
└── types/
    └── index.ts                           # UPDATE: add GpuHealthIssue, GpuProcess interfaces
```

### Pattern 1: Page Layout Grid

**What:** The GPU monitoring page uses a vertical stack of sections.

**Layout structure:**
```
[Summary Header] ─────────────────────────── full width
[GPU-0] [GPU-1] [GPU-2] [GPU-3] ─────────── 4-column grid
[Performance Trend Multi-line (tabbed)] ──── full width
[Heatmap/Ridgeline (toggle)] ──────────────── full width
[Comparison Bar Chart] ───────────────────── full width
[Health Issues] [Processes Table] ─────────── 2-column grid
```

**Implementation:**
```tsx
<div className="flex flex-col gap-6 p-6">
  <GpuSummaryHeader gpus={gpuCards} />
  <GpuCardGrid gpus={gpuCards} />
  <GpuPerformanceTrend series={timeSeries} />
  <GpuHeatmapRidgelineToggle heatmapData={heatmap} timeSeriesData={timeSeries} />
  <GpuComparisonBar data={comparison} />
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <GpuHealthIssues issues={healthIssues} />
    <GpuProcessesTable processes={processes} />
  </div>
</div>
```

### Pattern 2: D3 Chart Component Template

**What:** The standard pattern for all D3 chart components in this project.

**When to use:** Every D3 chart (multi-line, heatmap, ridgeline, grouped bar).

**Example:**
```typescript
"use client";

import { useRef, useEffect, useState } from "react";
import { select } from "d3-selection";
import { cleanupD3Svg, createDebouncedResizeObserver } from "@/components/charts/shared/chart-utils";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import { ChartSkeleton } from "@/components/charts/shared/ChartSkeleton";

interface Props {
  data: SomeDataType[];
}

export function SomeD3Chart({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const colors = getChartColors();
    const tooltip = createTooltip();

    function draw() {
      cleanupD3Svg(container);
      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      const margin = { top: 20, right: 20, bottom: 40, left: 50 };
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;

      const svg = select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // ... scales, axes, data bindings ...
    }

    draw();

    const observer = createDebouncedResizeObserver(() => draw());
    observer.observe(container);

    return () => {
      observer.disconnect();
      tooltip.destroy();
      cleanupD3Svg(container);
    };
  }, [isClient, data]);

  if (!isClient) return <ChartSkeleton />;

  return (
    <div
      ref={containerRef}
      className="w-full h-[300px]"
      data-testid="some-d3-chart"
    />
  );
}
```

### Pattern 3: Multi-line Chart with Tab Switching and Legend Toggle

**What:** A single chart area showing 4 GPU lines, with tabs to switch between metrics and a clickable legend to toggle individual line visibility.

**How it works:**
1. Tab state (`activeMetric`) filters `getGpuTimeSeries()` to show only one metric type at a time
2. Legend state (`visibleGpus`) is a `Set<string>` tracking which GPU lines are visible
3. Clicking a legend item toggles it in/out of the set
4. The chart re-renders when either state changes

**Scale considerations by metric:**
| Metric | Y-axis unit | Typical range |
|--------|------------|---------------|
| Utilization | % | 0-100 |
| Temperature | C | 40-90 |
| Power | W | 100-400 |
| Memory | GB | 0-80 |

### Pattern 4: Heatmap/Ridgeline Toggle Container

**What:** A single container area that shows either a heatmap or ridgeline chart, controlled by a Switch toggle.

**Implementation:**
```tsx
"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function GpuHeatmapRidgelineToggle({ heatmapData, timeSeriesData }) {
  const [showRidgeline, setShowRidgeline] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3>{showRidgeline ? "GPU Utilization Density" : "GPU Utilization Heatmap"}</h3>
        <div className="flex items-center gap-2 text-sm">
          <span>Heatmap</span>
          <Switch
            checked={showRidgeline}
            onCheckedChange={setShowRidgeline}
          />
          <span>Ridgeline</span>
        </div>
      </CardHeader>
      <CardContent>
        {showRidgeline ? (
          <GpuRidgeline data={timeSeriesData} />
        ) : (
          <GpuHeatmap data={heatmapData} />
        )}
      </CardContent>
    </Card>
  );
}
```

### Pattern 5: Ridgeline with Kernel Density Estimation

**What:** Ridgeline plot showing utilization distribution for each of the 4 GPUs, stacked vertically with overlap.

**How it works:**
1. Transform time series data into density distributions using KDE
2. Use `d3.scaleBand()` for vertical GPU positioning
3. Use `d3.scaleLinear()` for horizontal (utilization value) and vertical (density) axes
4. Draw each GPU's density as a filled `d3.area()` with semi-transparent gradient fill
5. Offset each density curve vertically so they overlap slightly for the ridgeline effect

**Kernel Density Estimation function:**
```typescript
function kernelDensityEstimator(
  kernel: (v: number) => number,
  X: number[]
) {
  return function (V: number[]) {
    return X.map((x) => [x, mean(V, (v) => kernel(x - v)) ?? 0] as [number, number]);
  };
}

function kernelEpanechnikov(k: number) {
  return function (v: number) {
    v = v / k;
    return Math.abs(v) <= 1 ? (0.75 * (1 - v * v)) / k : 0;
  };
}
```

### Anti-Patterns to Avoid

- **Don't create separate pages for heatmap and ridgeline.** They share the same container area with a toggle. Mounting/unmounting the D3 chart on toggle is correct; trying to hide one with CSS `display:none` leaves orphaned D3 elements.
- **Don't use `d3.interpolateRgb` for heatmap colors.** Use `d3.scaleSequential` with a perceptually uniform color scheme from `d3-scale-chromatic`. `interpolateYlOrRd` (yellow-orange-red) is standard for "heat" visualization.
- **Don't compute kernel density on every render.** The KDE computation is CPU-intensive for large datasets. Compute it once when data changes, then memoize with `useMemo`. For 4 GPUs x 24 points, it is fast, but the pattern should be correct.
- **Don't use CSS variables directly in D3 transitions.** D3's interpolation system cannot interpolate CSS variable strings. For animated transitions, resolve colors with `getChartColors()` first. For static `fill`/`stroke` attributes without transitions, CSS variables like `var(--chart-1)` are fine.
- **Don't forget to call `tooltip.destroy()` in cleanup.** Each D3 chart creates a tooltip instance. If not destroyed, orphaned tooltip divs accumulate in `document.body`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sequential color interpolation | Custom color lerp function | `d3.scaleSequential(d3.interpolateYlOrRd)` | Perceptually uniform, handles edge cases, colorblind-friendly options available |
| Kernel density estimation | Custom statistics function | `kernelDensityEstimator` with `kernelEpanechnikov` (standard D3 pattern) | Mathematically correct bandwidth handling, reusable across chart instances |
| Tab UI with keyboard nav | Custom tab buttons | shadcn `Tabs` component | Handles ARIA roles, arrow key navigation, focus management |
| Toggle switch | Custom checkbox styled as toggle | shadcn `Switch` component | Accessible, consistent styling, Radix UI primitive |
| Data table with headers | Custom `<div>` table | shadcn `Table` component | Semantic HTML, consistent styling, responsive |
| Responsive chart sizing | `window.addEventListener('resize')` | `createDebouncedResizeObserver()` | Element-level observation, debounced, handles CSS grid changes |
| Tooltip positioning | Custom mouse offset math | `createTooltip()` from chart-tooltip.ts | Viewport boundary correction, theme-aware styling |

**Key insight:** All 4 D3 chart types follow the same lifecycle pattern (ref -> useEffect -> draw -> observer -> cleanup). The differentiator is the scale types, data bindings, and SVG elements inside the `draw()` function. Do not create different lifecycle patterns for different chart types.

---

## Common Pitfalls

### Pitfall 1: Heatmap Rect Sizing with Non-uniform GPU Names

**What goes wrong:** Using `d3.scaleBand()` for GPU names but calculating rect height/width from band.bandwidth() returns 0 if the scale range is too small or padding is too large.

**Why it happens:** With only 4 GPUs, the band height is very sensitive to padding settings. Default `paddingInner(0.1)` works, but `paddingInner(0.5)` would shrink cells too much.

**How to avoid:** Use `paddingInner(0.05)` for heatmap bands. With 4 rows and 24 columns, cells should be wide and tall enough to be clearly visible. Test with the actual container height (300px recommended for heatmap area).

**Warning signs:** Heatmap cells appear as thin lines or disappear entirely.

### Pitfall 2: Ridgeline Density Curves Extending Beyond Data Range

**What goes wrong:** KDE produces density values that extend beyond the actual data range (e.g., negative utilization or >100%), creating misleading curves that go off-chart.

**Why it happens:** The Epanechnikov kernel has a finite bandwidth. If the bandwidth is too large relative to the data range, the density "leaks" beyond boundaries.

**How to avoid:** Clamp the KDE evaluation domain to [0, 100] for utilization. Set bandwidth to ~5-10 for a 0-100 range. After computing density, clip values outside the valid range.

**Warning signs:** Density curves showing negative values or values beyond 100%.

### Pitfall 3: Multi-line Chart Legend Toggling Causes Scale Jump

**What goes wrong:** When toggling a GPU line off, the Y-axis domain recalculates to fit only visible lines. This causes a jarring jump in the axis scale.

**Why it happens:** `d3.extent()` is computed from only the visible series. Removing the highest-value GPU shrinks the scale.

**How to avoid:** Keep the Y-axis domain fixed based on ALL data, not just visible data. The domain should be stable regardless of which lines are toggled. Use `d3.extent()` on the full dataset once, not on the filtered subset.

**Warning signs:** Y-axis labels change when clicking legend items.

### Pitfall 4: SSR Hydration Mismatch with D3 Charts

**What goes wrong:** D3 charts try to access `document` or `window` during SSR, causing hydration errors.

**Why it happens:** D3's `select()`, `getComputedStyle()`, and `createTooltip()` all require DOM access. Next.js App Router server-renders components by default.

**How to avoid:** All D3 chart components must be `"use client"` components. Use `useState(false)` + `useEffect(() => setIsClient(true))` guard. Only render the chart SVG container when `isClient` is true. Show `<ChartSkeleton />` during SSR.

**Warning signs:** "document is not defined" or hydration mismatch warnings in console.

### Pitfall 5: Missing Data for GPU-07

**What goes wrong:** `gpu-data.ts` currently has no health issues or processes data. Building GPU-07 components will fail without data.

**Why it happens:** Phase 1 data layer did not include these specific data exports.

**How to avoid:** Add `getGpuHealthIssues()` and `getGpuProcesses()` functions to `gpu-data.ts` BEFORE building UI components. Also add `GpuHealthIssue` and `GpuProcess` interfaces to `types/index.ts`.

### Pitfall 6: Chart Colors Not Following Theme

**What goes wrong:** D3 charts render with hardcoded colors that don't match the current theme (light/dark).

**Why it happens:** Using hex colors directly instead of CSS variables or resolved theme colors.

**How to avoid:** For static fills (no animation), use CSS variables: `.attr('fill', 'var(--chart-1)')`. For gradients and interpolated colors (heatmap), resolve colors once at the start of `draw()` using `getChartColors()`. The chart re-renders on theme change because `draw()` is called by ResizeObserver or re-mount.

**Note:** For the heatmap specifically, `d3.interpolateYlOrRd` is a fixed color scheme that works on both light and dark backgrounds. No theme adaptation needed for the heatmap color scale itself -- just ensure axis labels and grid lines use theme tokens.

---

## Code Examples

### Example 1: Data Layer Additions (gpu-data.ts)

```typescript
// ── GPU Health Issues ────────────────────────────────────────────────────────

export interface GpuHealthIssue {
  id: number;
  gpuName: string;
  severity: "error" | "warning" | "info";
  message: string;
  timestamp: Date;
}

export function getGpuHealthIssues(): GpuHealthIssue[] {
  const now = new Date();
  return [
    {
      id: 1,
      gpuName: "GPU-2",
      severity: "warning",
      message: "Temperature approaching threshold (78C / 83C limit)",
      timestamp: new Date(now.getTime() - 5 * 60 * 1000),
    },
    {
      id: 2,
      gpuName: "GPU-2",
      severity: "warning",
      message: "Memory utilization above 89% for 15 minutes",
      timestamp: new Date(now.getTime() - 12 * 60 * 1000),
    },
    {
      id: 3,
      gpuName: "GPU-0",
      severity: "info",
      message: "ECC single-bit error corrected",
      timestamp: new Date(now.getTime() - 45 * 60 * 1000),
    },
    {
      id: 4,
      gpuName: "GPU-3",
      severity: "info",
      message: "Driver version update available (535.129.03)",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      id: 5,
      gpuName: "GPU-1",
      severity: "info",
      message: "PCIe bandwidth utilization nominal",
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    },
  ];
}

// ── GPU Processes ────────────────────────────────────────────────────────────

export interface GpuProcess {
  pid: number;
  gpuName: string;
  processName: string;
  memoryUsed: number; // in MB
  gpuUtilization: number; // percentage
  type: "C" | "G"; // Compute or Graphics
}

export function getGpuProcesses(): GpuProcess[] {
  return [
    { pid: 12847, gpuName: "GPU-0", processName: "python3 train_model.py", memoryUsed: round(addJitter(24560, 3), 0), gpuUtilization: round(addJitter(65, 5), 1), type: "C" },
    { pid: 12848, gpuName: "GPU-0", processName: "python3 data_loader.py", memoryUsed: round(addJitter(8200, 3), 0), gpuUtilization: round(addJitter(12, 5), 1), type: "C" },
    { pid: 13201, gpuName: "GPU-1", processName: "python3 inference.py", memoryUsed: round(addJitter(18400, 3), 0), gpuUtilization: round(addJitter(58, 5), 1), type: "C" },
    { pid: 13450, gpuName: "GPU-2", processName: "python3 fine_tune.py", memoryUsed: round(addJitter(32100, 3), 0), gpuUtilization: round(addJitter(82, 5), 1), type: "C" },
    { pid: 13451, gpuName: "GPU-2", processName: "tensorboard", memoryUsed: round(addJitter(1200, 3), 0), gpuUtilization: round(addJitter(3, 5), 1), type: "G" },
    { pid: 14002, gpuName: "GPU-3", processName: "python3 preprocess.py", memoryUsed: round(addJitter(12800, 3), 0), gpuUtilization: round(addJitter(45, 5), 1), type: "C" },
    { pid: 14100, gpuName: "GPU-3", processName: "nvidia-smi monitor", memoryUsed: round(addJitter(256, 3), 0), gpuUtilization: round(addJitter(1, 5), 1), type: "G" },
  ];
}
```

### Example 2: Type Definitions to Add (types/index.ts)

```typescript
// ─── GPU Extended Types ──────────────────────────────────────────────────────

export interface GpuHealthIssue {
  id: number;
  gpuName: string;
  severity: "error" | "warning" | "info";
  message: string;
  timestamp: Date;
}

export interface GpuProcess {
  pid: number;
  gpuName: string;
  processName: string;
  memoryUsed: number;
  gpuUtilization: number;
  type: "C" | "G";
}
```

### Example 3: GPU Card Component Design

```tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Gpu } from "@/types";
import { Thermometer, Zap, Cpu, HardDrive } from "lucide-react";

const statusConfig = {
  healthy: { label: "Healthy", className: "bg-green-500/10 text-green-500 border-green-500/20" },
  warning: { label: "Warning", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  error:   { label: "Error",   className: "bg-red-500/10 text-red-500 border-red-500/20" },
};

export function GpuCard({ gpu }: { gpu: Gpu }) {
  const status = statusConfig[gpu.status];
  const memPercent = ((gpu.memoryUsed / gpu.memoryTotal) * 100).toFixed(1);
  const powerPercent = ((gpu.powerUsage / gpu.powerLimit) * 100).toFixed(1);

  return (
    <Card data-testid={`gpu-card-${gpu.id}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{gpu.name}</p>
            <p className="text-xs text-muted-foreground">{gpu.model}</p>
          </div>
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
        </div>
        {/* Mini metric bars for temperature, utilization, memory, power */}
        <div className="space-y-2">
          <MetricBar icon={<Cpu className="h-3 w-3" />} label="Util" value={gpu.utilization} max={100} unit="%" />
          <MetricBar icon={<Thermometer className="h-3 w-3" />} label="Temp" value={gpu.temperature} max={90} unit="C" />
          <MetricBar icon={<HardDrive className="h-3 w-3" />} label="Mem" value={Number(memPercent)} max={100} unit="%" />
          <MetricBar icon={<Zap className="h-3 w-3" />} label="Power" value={Number(powerPercent)} max={100} unit="%" />
        </div>
      </CardContent>
    </Card>
  );
}

function MetricBar({ icon, label, value, max, unit }: {
  icon: React.ReactNode; label: string; value: number; max: number; unit: string;
}) {
  const percent = Math.min((value / max) * 100, 100);
  const barColor = value > 80 ? "bg-red-500" : value > 60 ? "bg-amber-500" : "bg-blue-500";

  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-xs w-10 text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs w-12 text-right tabular-nums">{value}{unit}</span>
    </div>
  );
}
```

### Example 4: D3 Multi-line Chart with Legend

```typescript
// Key D3 patterns for the multi-line performance trend chart

// Scales
const xScale = scaleTime()
  .domain(extent(allData, d => d.time) as [Date, Date])
  .range([0, innerW]);

const yScale = scaleLinear()
  .domain([0, max(allData, d => d.value) ?? 100])
  .nice()
  .range([innerH, 0]);

// Line generator
const lineGen = line<TimeSeriesPoint>()
  .x(d => xScale(d.time))
  .y(d => yScale(d.value))
  .curve(curveMonotoneX);

// Draw lines per GPU (filtered by activeMetric)
const gpuSeries = timeSeries
  .filter(s => s.metric === activeMetric)
  .filter(s => visibleGpus.has(s.gpuName));

gpuSeries.forEach((series, i) => {
  g.append("path")
    .datum(series.data)
    .attr("fill", "none")
    .attr("stroke", `var(--chart-${i + 1})`)
    .attr("stroke-width", 2)
    .attr("d", lineGen);
});

// Legend (clickable to toggle visibility)
const legend = svg.append("g")
  .attr("transform", `translate(${margin.left + 10}, ${margin.top - 5})`);

allGpuNames.forEach((name, i) => {
  const item = legend.append("g")
    .attr("transform", `translate(${i * 80}, 0)`)
    .style("cursor", "pointer")
    .style("opacity", visibleGpus.has(name) ? 1 : 0.3)
    .on("click", () => toggleGpu(name));

  item.append("line")
    .attr("x1", 0).attr("x2", 16).attr("y1", 5).attr("y2", 5)
    .attr("stroke", `var(--chart-${i + 1})`).attr("stroke-width", 2);

  item.append("text")
    .attr("x", 20).attr("y", 9)
    .attr("fill", colors.text)
    .style("font-size", "11px")
    .text(name);
});
```

### Example 5: D3 Heatmap

```typescript
// Key D3 patterns for GPU x Time heatmap

const gpuNames = ["GPU-0", "GPU-1", "GPU-2", "GPU-3"];
const timeIndices = range(0, 24);

// Scales
const xScale = scaleBand<number>()
  .domain(timeIndices)
  .range([0, innerW])
  .padding(0.02);

const yScale = scaleBand<string>()
  .domain(gpuNames)
  .range([0, innerH])
  .padding(0.05);

const colorScale = scaleSequential(interpolateYlOrRd)
  .domain([0, 100]); // utilization 0-100%

// Draw cells
g.selectAll("rect")
  .data(heatmapData)
  .join("rect")
  .attr("x", d => xScale(d.timeIndex)!)
  .attr("y", d => yScale(d.gpuName)!)
  .attr("width", xScale.bandwidth())
  .attr("height", yScale.bandwidth())
  .attr("fill", d => colorScale(d.utilization))
  .attr("rx", 2)
  .on("mouseover", (event, d) => {
    tooltip.show(
      `<strong>${d.gpuName}</strong><br/>` +
      `Time: ${timeFormat("%H:%M")(d.time)}<br/>` +
      `Utilization: ${d.utilization}%`,
      event
    );
  })
  .on("mouseout", () => tooltip.hide());
```

### Example 6: D3 Ridgeline Chart

```typescript
// Key D3 patterns for GPU ridgeline density chart

// 1. Extract utilization values per GPU from time series
const gpuUtilData: Record<string, number[]> = {};
timeSeriesData
  .filter(s => s.metric === "utilization")
  .forEach(s => {
    gpuUtilData[s.gpuName] = s.data.map(d => d.value);
  });

// 2. Set up scales
const xScale = scaleLinear().domain([0, 100]).range([0, innerW]);
const yScale = scaleBand<string>()
  .domain(gpuNames)
  .range([0, innerH])
  .paddingInner(0.4); // overlap amount

// 3. Kernel density estimation
const kde = kernelDensityEstimator(
  kernelEpanechnikov(7), // bandwidth = 7
  xScale.ticks(50)       // evaluation points
);

// 4. Compute densities
const densities = gpuNames.map(name => ({
  name,
  density: kde(gpuUtilData[name] || []),
}));

// 5. Density scale (shared across all GPUs for fair comparison)
const maxDensity = max(densities.flatMap(d => d.density.map(p => p[1]))) ?? 0;
const densityScale = scaleLinear()
  .domain([0, maxDensity])
  .range([0, -yScale.bandwidth() * 1.5]); // negative = upward from baseline

// 6. Area generator
const areaGen = area<[number, number]>()
  .x(d => xScale(d[0]))
  .y0(0)
  .y1(d => densityScale(d[1]))
  .curve(curveBasis);

// 7. Draw ridgelines
densities.forEach((gpu, i) => {
  const yOffset = yScale(gpu.name)! + yScale.bandwidth();

  g.append("path")
    .datum(gpu.density)
    .attr("transform", `translate(0, ${yOffset})`)
    .attr("fill", `var(--chart-${i + 1})`)
    .attr("fill-opacity", 0.6)
    .attr("stroke", `var(--chart-${i + 1})`)
    .attr("stroke-width", 1.5)
    .attr("d", areaGen);
});
```

### Example 7: D3 Grouped Bar Chart

```typescript
// Key D3 patterns for GPU comparison grouped bar chart

const metrics = ["utilization", "memoryPercent", "temperature", "powerPercent"];
const metricLabels = ["Utilization %", "Memory %", "Temp (norm)", "Power %"];

// Scales
const x0 = scaleBand<string>()
  .domain(gpuNames)
  .range([0, innerW])
  .paddingInner(0.2);

const x1 = scaleBand<string>()
  .domain(metrics)
  .range([0, x0.bandwidth()])
  .padding(0.05);

const yScale = scaleLinear()
  .domain([0, 100])
  .range([innerH, 0]);

// Draw grouped bars
comparisonData.forEach(gpu => {
  const gpuGroup = g.append("g")
    .attr("transform", `translate(${x0(gpu.gpuName)}, 0)`);

  metrics.forEach((metric, i) => {
    let value = gpu[metric as keyof GpuComparisonItem] as number;
    // Normalize temperature to 0-100 scale for comparison
    if (metric === "temperature") value = (value / 90) * 100;

    gpuGroup.append("rect")
      .attr("x", x1(metric)!)
      .attr("y", yScale(value))
      .attr("width", x1.bandwidth())
      .attr("height", innerH - yScale(value))
      .attr("fill", `var(--chart-${i + 1})`)
      .attr("rx", 2);
  });
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| D3 v6 `selection.enter().append()` | D3 v7 `selection.join()` | D3 v7 (2021+) | Simpler enter/update/exit pattern |
| `d3.csv()` for data loading | Hardcoded TypeScript data functions | Project decision (POC) | No async data loading needed |
| Separate `d3-scale-chromatic` install | Bundled with `d3` package | D3 v7 | `interpolateYlOrRd` available via `import { interpolateYlOrRd } from "d3-scale-chromatic"` |
| Class components for D3 | `useRef` + `useEffect` hooks | React 16.8+ | Standard pattern for D3 in React |
| `forwardRef` for component refs | Direct ref prop | React 19 | Simpler component API |

**Deprecated/outdated:**
- `d3.event` (removed in D3 v7): Event is passed as first argument to event handlers
- `selection.enter().append().merge(update)`: Use `selection.join()` instead
- `d3-tip` (tooltip library): Not maintained; use custom tooltip (our `createTooltip()` pattern)

---

## Open Questions

1. **Ridgeline bandwidth parameter tuning**
   - What we know: The Epanechnikov kernel with bandwidth=7 works for data in the 0-100 range with ~24 data points per GPU.
   - What's unclear: Whether 24 data points produces a visually appealing density curve or if it will look too spiky/flat.
   - Recommendation: Start with bandwidth=7, adjust visually. If density looks too flat, decrease to 4-5. If too spiky, increase to 10-12. The bandwidth parameter can be exposed as a constant at the top of the component for easy tuning.

2. **Heatmap color scale choice**
   - What we know: `interpolateYlOrRd` (yellow-orange-red) is a standard "heat" palette. It works on both light and dark backgrounds.
   - What's unclear: Whether a "cool" palette (e.g., `interpolateYlGnBu`) might better match the blue accent of the eXemble design system.
   - Recommendation: Use `interpolateYlOrRd` as the default (matches GPU "heat" metaphor). This is a discretion area -- the planner can adjust if the blue palette feels more cohesive.

3. **GPU page route availability**
   - What we know: No `/monitoring/gpu` route exists yet. Phase 2 (Layout Shell) is responsible for creating routes (AUTH-06).
   - What's unclear: Whether Phase 2 will be complete before Phase 5 starts.
   - Recommendation: Create the page file at `src/app/monitoring/gpu/page.tsx` as part of this phase. If Phase 2's layout shell exists, the page will integrate automatically. If not, the page still works as a standalone route.

---

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/data/gpu-data.ts` -- verified all data functions and interfaces
- Existing codebase: `src/types/index.ts` -- verified Gpu, GpuStatus types
- Existing codebase: `src/components/charts/shared/chart-utils.ts` -- verified cleanupD3Svg, createDebouncedResizeObserver APIs
- Existing codebase: `src/components/charts/shared/chart-theme.ts` -- verified getChartColors, resolveColor APIs
- Existing codebase: `src/components/charts/shared/chart-tooltip.ts` -- verified createTooltip API
- Existing codebase: `src/components/ui/*.tsx` -- verified shadcn Card, Badge, Tabs, Switch, Table components
- Existing codebase: `src/app/globals.css` -- verified CSS token system, chart series colors
- Phase 1 research: `.planning/phases/01-foundation-data-layer/01-RESEARCH.md` -- D3 patterns, token architecture
- D3 v7 official docs: [d3js.org](https://d3js.org/) -- scale, shape, axis APIs
- D3 sequential color schemes: [d3-scale-chromatic](https://d3js.org/d3-scale-chromatic/sequential)

### Secondary (MEDIUM confidence)
- D3 Graph Gallery ridgeline tutorial: [d3-graph-gallery.com/ridgeline](https://d3-graph-gallery.com/ridgeline.html) -- KDE implementation pattern
- D3 Graph Gallery heatmap tutorial: [d3-graph-gallery.com/heatmap](https://d3-graph-gallery.com/heatmap) -- rect grid pattern
- React Graph Gallery ridgeline: [react-graph-gallery.com/ridgeline](https://www.react-graph-gallery.com/ridgeline) -- React + D3 integration pattern

### Tertiary (LOW confidence)
- None -- all findings verified against primary or secondary sources.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and verified in package.json
- Architecture (page layout): HIGH -- follows locked decisions from CONTEXT.md
- Architecture (D3 chart patterns): HIGH -- reuses verified Phase 1 patterns (chart-utils, chart-theme, chart-tooltip)
- Data layer: HIGH -- verified existing gpu-data.ts functions, identified gaps (health/processes)
- Multi-line chart: HIGH -- standard D3 pattern, well-documented
- Heatmap: HIGH -- standard D3 pattern with scaleSequential
- Ridgeline: MEDIUM -- KDE implementation requires bandwidth tuning; pattern is standard but visual quality depends on data density
- Grouped bar: HIGH -- standard D3 pattern with nested scaleBand
- Pitfalls: HIGH -- based on direct codebase analysis and known D3 gotchas

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (30 days -- stable stack, D3 v7 API is mature)
