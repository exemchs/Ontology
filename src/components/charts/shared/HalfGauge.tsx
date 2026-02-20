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
