"use client";

import { useRef, useEffect } from "react";
import { select } from "d3-selection";
import { scaleTime, scaleLinear } from "d3-scale";
import { area, line } from "d3-shape";
import { axisBottom, axisLeft } from "d3-axis";
import { timeFormat } from "d3-time-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cleanupD3Svg, createDebouncedResizeObserver } from "@/components/charts/shared/chart-utils";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import "d3-transition";

interface TrendDataPoint {
  time: string;
  value: number;
}

interface TrendSeries {
  name: string;
  data: TrendDataPoint[];
}

interface TrendChartWidgetProps {
  label: string;
  series: TrendSeries[];
}

export default function TrendChartWidget({ label, series }: TrendChartWidgetProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function draw() {
      const svg = svgRef.current;
      const container = containerRef.current;
      if (!svg || !container) return;

      const { width, height } = container.getBoundingClientRect();
      if (height < 20 || width < 40) return;

      cleanupD3Svg(svg as unknown as HTMLElement);

      const colors = getChartColors();
      const seriesColors = [colors.chart1, colors.chart2, colors.chart3];
      const margin = { top: 8, right: 12, bottom: 24, left: 36 };
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;

      const parsedSeries = series.map((s) => ({
        name: s.name,
        data: s.data.map((d) => ({ time: new Date(d.time), value: d.value })),
      }));

      const allTimes = parsedSeries.flatMap((s) => s.data.map((d) => d.time));
      const allValues = parsedSeries.flatMap((s) => s.data.map((d) => d.value));

      const sel = select(svg).attr("width", width).attr("height", height);
      const g = sel.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const xScale = scaleTime()
        .domain([Math.min(...allTimes.map((t) => t.getTime())), Math.max(...allTimes.map((t) => t.getTime()))])
        .range([0, innerW]);

      const yScale = scaleLinear()
        .domain([0, Math.max(...allValues) * 1.1])
        .range([innerH, 0]);

      // Axes
      const formatTime = timeFormat("%H:%M");
      g.append("g")
        .attr("transform", `translate(0,${innerH})`)
        .call(axisBottom(xScale).ticks(4).tickFormat(formatTime as (d: Date | { valueOf(): number }) => string))
        .call((g) => g.selectAll("text").attr("fill", colors.textSecondary).style("font-size", "9px"))
        .call((g) => g.selectAll("line,path").attr("stroke", colors.gridLine));

      g.append("g")
        .call(axisLeft(yScale).ticks(4))
        .call((g) => g.selectAll("text").attr("fill", colors.textSecondary).style("font-size", "9px"))
        .call((g) => g.selectAll("line,path").attr("stroke", colors.gridLine));

      // Draw each series
      parsedSeries.forEach((s, idx) => {
        const color = seriesColors[idx % seriesColors.length];

        // Area fill
        const areaGen = area<{ time: Date; value: number }>()
          .x((d) => xScale(d.time))
          .y0(innerH)
          .y1((d) => yScale(d.value));

        g.append("path")
          .datum(s.data)
          .attr("fill", color)
          .attr("fill-opacity", 0.15)
          .attr("d", areaGen);

        // Line
        const lineGen = line<{ time: Date; value: number }>()
          .x((d) => xScale(d.time))
          .y((d) => yScale(d.value));

        g.append("path")
          .datum(s.data)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 1.5)
          .attr("d", lineGen);
      });

      // Legend
      const legend = g
        .append("g")
        .attr("transform", `translate(${innerW - 10}, 4)`);

      parsedSeries.forEach((s, idx) => {
        const color = seriesColors[idx % seriesColors.length];
        const ly = idx * 14;
        legend
          .append("rect")
          .attr("x", -60)
          .attr("y", ly)
          .attr("width", 8)
          .attr("height", 8)
          .attr("rx", 2)
          .attr("fill", color);
        legend
          .append("text")
          .attr("x", -48)
          .attr("y", ly + 8)
          .attr("fill", colors.textSecondary)
          .style("font-size", "8px")
          .text(s.name);
      });
    }

    draw();

    const observer = createDebouncedResizeObserver(() => draw(), 200);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [series]);

  return (
    <Card className="h-full py-2">
      <CardHeader className="px-3 py-1">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-2 flex-1 min-h-0">
        <div ref={containerRef} className="w-full h-full min-h-[60px]">
          <svg ref={svgRef} className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  );
}
