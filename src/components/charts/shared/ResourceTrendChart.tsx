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
