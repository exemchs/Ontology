# System Resource Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** GPU Monitoring의 System Resources 섹션을 180° 반원 게이지 + 서버별 트렌드 Area 차트로 재구성

**Architecture:** 데이터 레이어(`system-resource-data.ts`)에서 서버 5개의 리소스 정보를 생성하고, D3 기반 `HalfGauge` 컴포넌트와 `ResourceTrendChart` 컴포넌트를 `SystemResourcePanel` 래퍼로 조합. GPU 페이지에서 기존 `CollapsibleResourcePanel`을 교체.

**Tech Stack:** D3.js (d3-shape arc, d3-scale, d3-axis, d3-selection), Next.js, TypeScript, Tailwind CSS

---

### Task 1: 데이터 레이어 — system-resource-data.ts

**Files:**
- Create: `src/data/system-resource-data.ts`

**Step 1: 타입 정의 및 서버 시드 데이터 작성**

서버 5개(Server-A~E)의 총 리소스와 현재 사용량 시드 데이터를 정의한다.

```typescript
// src/data/system-resource-data.ts

import type { TimeSeriesPoint } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SystemResourceGauge {
  label: string;          // "CPU", "Memory", "Disk"
  percent: number;        // 0-100
  used: number;           // 현재 사용량 (실제 단위)
  total: number;          // 전체 용량 (실제 단위)
  unit: string;           // "Cores", "GB", "GB"
  color: string;          // CSS variable
}

export interface ServerResourceTrend {
  serverName: string;
  color: string;
  data: TimeSeriesPoint[];
}

export interface SystemResourceTrends {
  cpu: ServerResourceTrend[];
  memory: ServerResourceTrend[];
  disk: ServerResourceTrend[];
}

// ── Jitter Utility ─────────────────────────────────────────────────────────

function addJitter(value: number, percent: number = 5): number {
  const range = value * (percent / 100);
  return value + (Math.random() - 0.5) * 2 * range;
}

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ── Server Definitions ─────────────────────────────────────────────────────

interface ServerSeed {
  name: string;
  cpuTotal: number;      // Cores
  cpuUsed: number;       // Cores
  memoryTotal: number;   // GB
  memoryUsed: number;    // GB
  diskTotal: number;     // GB
  diskUsed: number;      // GB
}

const serverSeeds: ServerSeed[] = [
  { name: "Server-A", cpuTotal: 8, cpuUsed: 0.12, memoryTotal: 32, memoryUsed: 16.5, diskTotal: 500, diskUsed: 1.2 },
  { name: "Server-B", cpuTotal: 8, cpuUsed: 0.10, memoryTotal: 32, memoryUsed: 14.2, diskTotal: 500, diskUsed: 1.0 },
  { name: "Server-C", cpuTotal: 8, cpuUsed: 0.08, memoryTotal: 16, memoryUsed: 9.8, diskTotal: 250, diskUsed: 0.8 },
  { name: "Server-D", cpuTotal: 4, cpuUsed: 0.06, memoryTotal: 16, memoryUsed: 11.0, diskTotal: 250, diskUsed: 0.6 },
  { name: "Server-E", cpuTotal: 4, cpuUsed: 0.04, memoryTotal: 16, memoryUsed: 8.5, diskTotal: 200, diskUsed: 0.4 },
];

const serverColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

// ── Gauge Data (Aggregated) ────────────────────────────────────────────────

export function getSystemResourceGauges(): SystemResourceGauge[] {
  const totalCpu = serverSeeds.reduce((sum, s) => sum + s.cpuTotal, 0);
  const usedCpu = serverSeeds.reduce((sum, s) => sum + s.cpuUsed, 0);
  const totalMem = serverSeeds.reduce((sum, s) => sum + s.memoryTotal, 0);
  const usedMem = serverSeeds.reduce((sum, s) => sum + s.memoryUsed, 0);
  const totalDisk = serverSeeds.reduce((sum, s) => sum + s.diskTotal, 0);
  const usedDisk = serverSeeds.reduce((sum, s) => sum + s.diskUsed, 0);

  return [
    {
      label: "CPU",
      percent: round((usedCpu / totalCpu) * 100, 1),
      used: round(addJitter(usedCpu, 5), 2),
      total: totalCpu,
      unit: "Cores",
      color: "var(--color-chart-1)",
    },
    {
      label: "Memory",
      percent: round((usedMem / totalMem) * 100, 1),
      used: round(addJitter(usedMem, 5), 1),
      total: totalMem,
      unit: "GB",
      color: "var(--color-chart-2)",
    },
    {
      label: "Disk",
      percent: round((usedDisk / totalDisk) * 100, 1),
      used: round(addJitter(usedDisk, 5), 1),
      total: totalDisk,
      unit: "GB",
      color: "var(--color-chart-3)",
    },
  ];
}

// ── Trend Time Series (per-server) ─────────────────────────────────────────

function generateServerTimeSeries(
  baseValue: number,
  points: number,
  intervalMinutes: number = 1
): TimeSeriesPoint[] {
  const now = new Date();
  return Array.from({ length: points }, (_, i) => {
    const time = new Date(now.getTime() - (points - 1 - i) * intervalMinutes * 60 * 1000);
    const drift = Math.sin((i / points) * Math.PI * 3) * baseValue * 0.08;
    const value = round(Math.max(0, addJitter(baseValue + drift, 5)), 3);
    return { time, value };
  });
}

export function getSystemResourceTrends(): SystemResourceTrends {
  const points = 8; // 7분 범위 (0~7), 1분 간격

  return {
    cpu: serverSeeds.map((s, i) => ({
      serverName: s.name,
      color: serverColors[i],
      data: generateServerTimeSeries(s.cpuUsed, points, 1),
    })),
    memory: serverSeeds.map((s, i) => ({
      serverName: s.name,
      color: serverColors[i],
      data: generateServerTimeSeries(s.memoryUsed, points, 1),
    })),
    disk: serverSeeds.map((s, i) => ({
      serverName: s.name,
      color: serverColors[i],
      data: generateServerTimeSeries(s.diskUsed, points, 1),
    })),
  };
}
```

**Step 2: 커밋**

```bash
git add src/data/system-resource-data.ts
git commit -m "기능(데이터): 시스템 리소스 데이터 레이어 추가 — 서버 5개 게이지 + 트렌드 시계열"
```

---

### Task 2: HalfGauge 컴포넌트 — D3 180° 반원 게이지

**Files:**
- Create: `src/components/charts/shared/HalfGauge.tsx`

**Step 1: D3 기반 180° 반원 게이지 컴포넌트 구현**

기존 프로젝트 D3 패턴(useRef + useEffect + isClient + ResizeObserver + cleanupD3Svg + theme-aware)을 따른다.

```typescript
// src/components/charts/shared/HalfGauge.tsx
"use client";

import { useRef, useEffect, useState, useId } from "react";
import { select } from "d3-selection";
import { arc as d3Arc } from "d3-shape";
import { useTheme } from "next-themes";
import { cleanupD3Svg } from "./chart-utils";
import { getChartColors, resolveColor } from "./chart-theme";
import type { SystemResourceGauge } from "@/data/system-resource-data";

interface HalfGaugeProps {
  data: SystemResourceGauge;
  className?: string;
}

export function HalfGauge({ data, className }: HalfGaugeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const filterId = useId();
  const { theme } = useTheme();

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    const container = containerRef.current;
    cleanupD3Svg(container as unknown as HTMLElement);

    const width = container.clientWidth;
    const height = width * 0.6; // 반원은 높이가 폭의 약 60%
    const colors = getChartColors();

    // 게이지 색상 결정 (임계값 기반)
    function getGaugeColor(pct: number): string {
      if (pct > 85) return resolveColor("--status-critical");
      if (pct > 70) return resolveColor("--status-warning");
      return resolveColor("--status-healthy");
    }

    const svg = select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "100%");

    const cx = width / 2;
    const cy = height * 0.85;
    const outerR = Math.min(cx, cy) * 0.9;
    const innerR = outerR * 0.72;
    const gaugeColor = getGaugeColor(data.percent);
    const needGlow = data.percent >= 80;

    // Glow filter (80%+ 일 때만 적용)
    if (needGlow) {
      const defs = svg.append("defs");
      const filter = defs.append("filter").attr("id", `glow-${filterId}`);
      filter
        .append("feGaussianBlur")
        .attr("stdDeviation", 3.5)
        .attr("result", "coloredBlur");
      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "coloredBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    }

    const g = svg.append("g").attr("transform", `translate(${cx},${cy})`);

    // Background arc (전체 180°)
    const bgArcGen = d3Arc<unknown>()
      .innerRadius(innerR)
      .outerRadius(outerR)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2)
      .cornerRadius(4);

    g.append("path")
      .attr("d", bgArcGen as unknown as string)
      .attr("fill", colors.gridLine)
      .attr("opacity", 0.3);

    // Value arc (현재 %)
    const valueAngle = -Math.PI / 2 + (data.percent / 100) * Math.PI;
    const valueArcGen = d3Arc<unknown>()
      .innerRadius(innerR)
      .outerRadius(outerR)
      .startAngle(-Math.PI / 2)
      .endAngle(valueAngle)
      .cornerRadius(4);

    g.append("path")
      .attr("d", valueArcGen as unknown as string)
      .attr("fill", gaugeColor)
      .attr("filter", needGlow ? `url(#glow-${filterId})` : null);

    // 중앙 % 텍스트
    g.append("text")
      .attr("x", 0)
      .attr("y", -outerR * 0.25)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", colors.text)
      .attr("font-size", `${outerR * 0.28}px`)
      .attr("font-weight", "bold")
      .text(`${Math.round(data.percent)}%`);

    // 라벨 (CPU, Memory, Disk)
    g.append("text")
      .attr("x", 0)
      .attr("y", -outerR * 0.05)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", colors.textSecondary)
      .attr("font-size", `${outerR * 0.14}px`)
      .text(data.label);

    // 실제 수치 (아래)
    g.append("text")
      .attr("x", 0)
      .attr("y", outerR * 0.22)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", colors.textSecondary)
      .attr("font-size", `${outerR * 0.13}px`)
      .text(`${data.used} / ${data.total} ${data.unit}`);

    return () => cleanupD3Svg(container as unknown as HTMLElement);
  }, [isClient, data, theme, filterId]);

  if (!isClient) return <div className={className} />;

  return <div ref={containerRef} className={className} />;
}
```

**핵심 패턴:**
- `startAngle=-PI/2`, `endAngle=PI/2` → 180° 반원 (12시 위치에서 좌→우)
- valueAngle = `-PI/2 + (percent/100) * PI`
- `innerRadius * 0.72` → 두께감 있는 도넛
- 80% 이상 glow (feGaussianBlur stdDeviation=3.5)
- 임계값: healthy(green) ≤70%, warning(amber) >70%, critical(red) >85%

**Step 2: 커밋**

```bash
git add src/components/charts/shared/HalfGauge.tsx
git commit -m "기능(차트): HalfGauge 180° 반원 게이지 컴포넌트 추가"
```

---

### Task 3: ResourceTrendChart 컴포넌트 — D3 Stacked Area

**Files:**
- Create: `src/components/charts/shared/ResourceTrendChart.tsx`

**Step 1: D3 기반 Stacked Area 차트 구현**

서버별 area 영역을 겹쳐서 표시하는 컴포넌트. 스크린샷 참조 레이아웃에 맞게 CPU/Memory/Disk 각각 하나씩 렌더링.

```typescript
// src/components/charts/shared/ResourceTrendChart.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { select } from "d3-selection";
import { scaleLinear, scaleTime } from "d3-scale";
import { area, curveMonotoneX } from "d3-shape";
import { axisBottom, axisLeft } from "d3-axis";
import { timeFormat } from "d3-time-format";
import { useTheme } from "next-themes";
import { cleanupD3Svg, createDebouncedResizeObserver } from "./chart-utils";
import { getChartColors, resolveColor } from "./chart-theme";
import type { ServerResourceTrend } from "@/data/system-resource-data";

interface ResourceTrendChartProps {
  title: string;
  series: ServerResourceTrend[];
  unit: string;           // "Cores", "GB"
  className?: string;
}

export function ResourceTrendChart({
  title,
  series,
  unit,
  className,
}: ResourceTrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const { theme } = useTheme();

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!isClient || !containerRef.current || series.length === 0) return;

    const container = containerRef.current;

    function draw() {
      cleanupD3Svg(container as unknown as HTMLElement);

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height || 120;
      const margin = { top: 20, right: 8, bottom: 24, left: 36 };
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;
      const colors = getChartColors();

      if (innerW <= 0 || innerH <= 0) return;

      // 시간/값 범위 계산
      const allTimes = series.flatMap((s) => s.data.map((d) => d.time));
      const allValues = series.flatMap((s) => s.data.map((d) => d.value));
      const maxVal = Math.max(...allValues) * 1.2;

      const xScale = scaleTime()
        .domain([Math.min(...allTimes.map((t) => t.getTime())), Math.max(...allTimes.map((t) => t.getTime()))])
        .range([0, innerW]);

      const yScale = scaleLinear().domain([0, maxVal]).range([innerH, 0]);

      const svg = select(container)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", "100%");

      // Title
      svg
        .append("text")
        .attr("x", margin.left)
        .attr("y", 14)
        .attr("fill", colors.text)
        .attr("font-size", "11px")
        .attr("font-weight", "500")
        .text(title);

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Grid lines
      g.append("g")
        .attr("class", "grid")
        .call(
          axisLeft(yScale)
            .ticks(4)
            .tickSize(-innerW)
            .tickFormat(() => "")
        )
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g.selectAll(".tick line").attr("stroke", colors.gridLine).attr("stroke-opacity", 0.3)
        );

      // Area generator
      const areaGen = area<{ time: Date; value: number }>()
        .x((d) => xScale(d.time))
        .y0(innerH)
        .y1((d) => yScale(d.value))
        .curve(curveMonotoneX);

      // 서버별 area (뒤에서 앞으로 — 마지막 서버가 맨 위)
      for (let i = series.length - 1; i >= 0; i--) {
        const s = series[i];
        const resolved = resolveColor(s.color.replace("var(", "").replace(")", ""));

        g.append("path")
          .datum(s.data)
          .attr("d", areaGen)
          .attr("fill", resolved)
          .attr("fill-opacity", 0.5)
          .attr("stroke", resolved)
          .attr("stroke-width", 1.5);

        // 각 라인에 점 표시
        g.selectAll(`.dot-${i}`)
          .data(s.data)
          .enter()
          .append("circle")
          .attr("cx", (d) => xScale(d.time))
          .attr("cy", (d) => yScale(d.value))
          .attr("r", 2.5)
          .attr("fill", resolved)
          .attr("stroke", "none");
      }

      // X축
      g.append("g")
        .attr("transform", `translate(0,${innerH})`)
        .call(
          axisBottom(xScale)
            .ticks(4)
            .tickFormat((d) => timeFormat("%H:%M")(d as Date))
        )
        .call((g) => g.select(".domain").attr("stroke", colors.gridLine))
        .call((g) => g.selectAll(".tick text").attr("fill", colors.textSecondary).attr("font-size", "9px"))
        .call((g) => g.selectAll(".tick line").attr("stroke", colors.gridLine));

      // Y축
      g.append("g")
        .call(axisLeft(yScale).ticks(4).tickFormat((d) => `${d}`))
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick text").attr("fill", colors.textSecondary).attr("font-size", "9px"))
        .call((g) => g.selectAll(".tick line").remove());
    }

    draw();

    const observer = createDebouncedResizeObserver(() => draw(), 150);
    observer.observe(container);

    return () => {
      observer.disconnect();
      cleanupD3Svg(container as unknown as HTMLElement);
    };
  }, [isClient, series, title, unit, theme]);

  if (!isClient) return <div className={className} />;

  return <div ref={containerRef} className={className} style={{ minHeight: 120 }} />;
}
```

**핵심 패턴:**
- `area()` + `curveMonotoneX` → 부드러운 곡선 area
- 서버 5개가 겹쳐 보이도록 `fill-opacity: 0.5`
- 각 area 위에 작은 점(circle r=2.5) → 스크린샷 참조
- ResizeObserver로 반응형
- theme 변경 시 자동 재렌더

**Step 2: 커밋**

```bash
git add src/components/charts/shared/ResourceTrendChart.tsx
git commit -m "기능(차트): ResourceTrendChart 서버별 Area 트렌드 컴포넌트 추가"
```

---

### Task 4: SystemResourcePanel 래퍼 컴포넌트

**Files:**
- Create: `src/components/ds/SystemResourcePanel.tsx`

**Step 1: 왼쪽 게이지 + 오른쪽 트렌드 통합 래퍼 구현**

```typescript
// src/components/ds/SystemResourcePanel.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HalfGauge } from "@/components/charts/shared/HalfGauge";
import { ResourceTrendChart } from "@/components/charts/shared/ResourceTrendChart";
import type { SystemResourceGauge, SystemResourceTrends } from "@/data/system-resource-data";

interface SystemResourcePanelProps {
  gauges: SystemResourceGauge[];
  trends: SystemResourceTrends;
}

export function SystemResourcePanel({ gauges, trends }: SystemResourcePanelProps) {
  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">System Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[minmax(160px,1fr)_3fr] gap-4">
          {/* 왼쪽: 반원 게이지 3개 세로 배치 */}
          <div className="flex flex-col gap-1">
            {gauges.map((gauge) => (
              <HalfGauge key={gauge.label} data={gauge} className="w-full" />
            ))}
          </div>

          {/* 오른쪽: 트렌드 차트 3개 가로 배치 */}
          <div className="grid grid-cols-3 gap-2">
            <ResourceTrendChart
              title="CPU"
              series={trends.cpu}
              unit="Cores"
              className="w-full h-[140px]"
            />
            <ResourceTrendChart
              title="Memory"
              series={trends.memory}
              unit="GB"
              className="w-full h-[140px]"
            />
            <ResourceTrendChart
              title="Disk"
              series={trends.disk}
              unit="GB"
              className="w-full h-[140px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**핵심:**
- `grid-cols-[minmax(160px,1fr)_3fr]` → 왼쪽 ~25%, 오른쪽 ~75%
- 왼쪽: `flex flex-col` 세로 3줄
- 오른쪽: `grid grid-cols-3` 가로 3개 차트

**Step 2: 커밋**

```bash
git add src/components/ds/SystemResourcePanel.tsx
git commit -m "기능(UI): SystemResourcePanel 래퍼 컴포넌트 — 게이지 + 트렌드 통합"
```

---

### Task 5: GPU 페이지에 통합

**Files:**
- Modify: `src/app/(authenticated)/monitoring/gpu/page.tsx`

**Step 1: import 교체 및 데이터 연결**

GPU 페이지에서 `CollapsibleResourcePanel`을 `SystemResourcePanel`로 교체한다.

변경 사항:
1. import 제거: `CollapsibleResourcePanel`, `getDashboardGauges`
2. import 추가: `SystemResourcePanel`, `getSystemResourceGauges`, `getSystemResourceTrends`
3. `systemGauges` 변수를 `getSystemResourceGauges()`로 교체
4. `systemTrends` 변수 추가: `getSystemResourceTrends()`
5. JSX에서 `<CollapsibleResourcePanel>` → `<SystemResourcePanel>` 교체

**구체적 변경:**

```diff
- import { CollapsibleResourcePanel } from "@/components/ds/CollapsibleResourcePanel";
- import { getDashboardGauges } from "@/data/dashboard-data";
+ import { SystemResourcePanel } from "@/components/ds/SystemResourcePanel";
+ import { getSystemResourceGauges, getSystemResourceTrends } from "@/data/system-resource-data";
```

```diff
- const systemGauges = useMemo(() => getDashboardGauges(), []);
+ const systemGauges = useMemo(() => getSystemResourceGauges(), []);
+ const systemTrends = useMemo(() => getSystemResourceTrends(), []);
```

```diff
- <CollapsibleResourcePanel
-   gauges={systemGauges}
-   storageKey="gpu-resource-collapsed"
- />
+ <SystemResourcePanel gauges={systemGauges} trends={systemTrends} />
```

**Step 2: 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공, 에러 없음

**Step 3: 커밋**

```bash
git add src/app/(authenticated)/monitoring/gpu/page.tsx
git commit -m "개선(GPU): System Resources 섹션 반원 게이지 + 트렌드 차트로 교체"
```

---

### Task 6: 시각적 확인 및 미세 조정

**Step 1: 개발 서버에서 확인**

브라우저에서 http://localhost:3000/monitoring/gpu 접속하여 확인:
- [ ] 왼쪽에 CPU/Memory/Disk 반원 게이지 3개 세로 배치
- [ ] 각 게이지에 % 표시 + 실제 수치 (Cores, GB) 표시
- [ ] 오른쪽에 CPU/Memory/Disk Area 트렌드 차트 3개 가로 배치
- [ ] 서버별 area 영역이 겹쳐서 보이는지
- [ ] 다크/라이트 테마 전환 시 색상 정상 반영
- [ ] 반응형 리사이즈 정상 동작

**Step 2: 필요한 미세 조정 적용 후 커밋**

```bash
git add -A
git commit -m "개선(GPU): System Resources 패널 시각적 미세 조정"
```
