"use client";

import { useRef, useEffect, useId } from "react";
import { select } from "d3-selection";
import { scaleTime, scaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { axisBottom, axisLeft } from "d3-axis";
import { timeFormat } from "d3-time-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cleanupD3Svg, createDebouncedResizeObserver } from "@/components/charts/shared/chart-utils";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import "d3-transition";

interface ThresholdDataPoint {
  time: string;
  value: number;
}

interface ThresholdWidgetProps {
  label: string;
  data: ThresholdDataPoint[];
  warningThreshold: number;
  criticalThreshold: number;
}

export default function ThresholdWidget({
  label,
  data,
  warningThreshold,
  criticalThreshold,
}: ThresholdWidgetProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  useEffect(() => {
    function draw() {
      const svg = svgRef.current;
      const container = containerRef.current;
      if (!svg || !container) return;

      const { width, height } = container.getBoundingClientRect();
      if (height < 20 || width < 40) return;

      cleanupD3Svg(svg as unknown as HTMLElement);

      const colors = getChartColors();
      const margin = { top: 8, right: 12, bottom: 24, left: 36 };
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;

      const parsedData = data.map((d) => ({
        time: new Date(d.time),
        value: d.value,
      }));

      const sel = select(svg).attr("width", width).attr("height", height);

      const g = sel.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const xScale = scaleTime()
        .domain([parsedData[0].time, parsedData[parsedData.length - 1].time])
        .range([0, innerW]);

      const yMax = Math.max(
        criticalThreshold * 1.3,
        ...parsedData.map((d) => d.value)
      );
      const yScale = scaleLinear().domain([0, yMax]).range([innerH, 0]);

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

      // Warning threshold line
      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerW)
        .attr("y1", yScale(warningThreshold))
        .attr("y2", yScale(warningThreshold))
        .attr("stroke", "#f59e0b")
        .attr("stroke-dasharray", "4,3")
        .attr("stroke-width", 1);

      // Critical threshold line
      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerW)
        .attr("y1", yScale(criticalThreshold))
        .attr("y2", yScale(criticalThreshold))
        .attr("stroke", "#ef4444")
        .attr("stroke-dasharray", "4,3")
        .attr("stroke-width", 1);

      // Data line
      const lineGen = line<{ time: Date; value: number }>()
        .x((d) => xScale(d.time))
        .y((d) => yScale(d.value));

      g.append("path")
        .datum(parsedData)
        .attr("fill", "none")
        .attr("stroke", colors.chart1)
        .attr("stroke-width", 1.5)
        .attr("d", lineGen);
    }

    draw();

    const observer = createDebouncedResizeObserver(() => draw(), 200);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [data, warningThreshold, criticalThreshold]);

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
