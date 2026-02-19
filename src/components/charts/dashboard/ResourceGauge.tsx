"use client";

import { useEffect, useId, useRef } from "react";
import { useTheme } from "next-themes";
import { arc as d3Arc } from "d3-shape";
import { select } from "d3-selection";

import type { GaugeData } from "@/types";
import { cleanupD3Svg, createDebouncedResizeObserver } from "@/components/charts/shared/chart-utils";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { ChartEmpty } from "@/components/charts/shared/ChartEmpty";

interface ResourceGaugeProps {
  data: GaugeData;
  className?: string;
}

export function ResourceGauge({ data, className }: ResourceGaugeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const uniqueId = useId();

  // Generate a DOM-safe filter ID from React useId()
  const filterId = `gauge-glow-${uniqueId.replace(/:/g, "")}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;

    function render() {
      if (destroyed || !container) return;

      cleanupD3Svg(container);

      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      const colors = getChartColors();

      // Resolve the data.color CSS variable
      // data.color is like "var(--color-chart-1)" — extract the variable name
      const cssVarMatch = data.color.match(/var\((.+)\)/);
      const cssVarName = cssVarMatch ? cssVarMatch[1] : data.color;
      const resolvedColor = getComputedStyle(document.documentElement)
        .getPropertyValue(cssVarName)
        .trim();

      // Arc dimensions
      const outerRadius = Math.min(width, height) * 0.4;
      const innerRadius = outerRadius * 0.75;

      // 270-degree arc: gap at bottom (6 o'clock)
      const startAngle = (-3 * Math.PI) / 4; // -135 degrees
      const endAngle = (3 * Math.PI) / 4;    // +135 degrees
      const totalAngle = endAngle - startAngle; // 270 degrees

      // Value angle proportional to data.value / data.max
      const ratio = Math.min(data.value / data.max, 1);
      const valueAngle = startAngle + totalAngle * ratio;

      // Is above threshold?
      const isAboveThreshold = ratio >= 0.8;

      const svg = select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`);

      // Defs for glow filter
      const defs = svg.append("defs");
      const filter = defs
        .append("filter")
        .attr("id", filterId)
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");

      filter
        .append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", 3.5)
        .attr("result", "blur");

      filter
        .append("feComposite")
        .attr("in", "SourceGraphic")
        .attr("in2", "blur")
        .attr("operator", "over");

      const g = svg
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      // Arc generator for background track
      const arcGenerator = d3Arc<unknown>()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .cornerRadius(4);

      // Background track arc (full 270 degrees)
      g.append("path")
        .attr(
          "d",
          arcGenerator({
            startAngle,
            endAngle,
            innerRadius,
            outerRadius,
          })
        )
        .attr("fill", colors.gridLine)
        .attr("opacity", 0.3);

      // Value arc
      const valuePath = g
        .append("path")
        .attr(
          "d",
          arcGenerator({
            startAngle,
            endAngle: valueAngle,
            innerRadius,
            outerRadius,
          })
        )
        .attr("fill", resolvedColor);

      // Apply glow filter only above threshold
      if (isAboveThreshold) {
        valuePath.attr("filter", `url(#${filterId})`);
      }

      // Center text: value with "%" suffix
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.1em")
        .attr("fill", colors.text)
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text(`${Math.round(data.value)}%`);

      // Label below
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1.5em")
        .attr("fill", colors.textSecondary)
        .attr("font-size", "12px")
        .text(data.label);
    }

    render();

    const observer = createDebouncedResizeObserver(() => {
      if (!destroyed) render();
    });
    observer.observe(container);

    return () => {
      destroyed = true;
      observer.disconnect();
      cleanupD3Svg(container);
    };
  }, [data, resolvedTheme, filterId]);

  if (!data || data.value == null) {
    return <ChartEmpty message="No gauge data available" className={className} />;
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%", minHeight: "200px" }}
      data-testid={`resource-gauge-${data.label.toLowerCase()}`}
    />
  );
}
