"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { stack } from "d3-shape";
import { axisBottom, axisLeft } from "d3-axis";
import { max } from "d3-array";
import "d3-transition";

import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import {
  cleanupD3Svg,
  createDebouncedResizeObserver,
} from "@/components/charts/shared/chart-utils";

// ── Types ───────────────────────────────────────────────────────────────────

interface DistributionViewProps {
  data: Record<string, unknown>[];
}

type DistMode = "stacked" | "grouped";

interface DistRow {
  location: string;
  [type: string]: string | number;
}

// ── Component ───────────────────────────────────────────────────────────────

export function DistributionView({ data }: DistributionViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [mode, setMode] = useState<DistMode>("stacked");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;
    const tooltip = createTooltip();

    function render() {
      if (destroyed || !container) return;
      cleanupD3Svg(container as unknown as HTMLElement);

      const colors = getChartColors();
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = (rect.height || 350) - 40; // Reserve space for toggle + legend

      if (width <= 0 || height <= 0) return;

      const margin = { top: 10, right: 20, bottom: 50, left: 50 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (innerWidth <= 0 || innerHeight <= 0) return;

      // ── Data transformation: location x type counts ──
      const locationTypeMap = new Map<string, Map<string, number>>();
      const allTypes = new Set<string>();

      data.forEach((row) => {
        const location = String(row.location ?? "Unknown");
        const type = String(row.type ?? "Unknown");
        allTypes.add(type);

        if (!locationTypeMap.has(location)) {
          locationTypeMap.set(location, new Map());
        }
        const typeMap = locationTypeMap.get(location)!;
        typeMap.set(type, (typeMap.get(type) ?? 0) + 1);
      });

      const types = Array.from(allTypes);
      const locations = Array.from(locationTypeMap.keys());

      if (locations.length === 0 || types.length === 0) return;

      const distData: DistRow[] = locations.map((loc) => {
        const row: DistRow = { location: loc };
        const typeMap = locationTypeMap.get(loc)!;
        types.forEach((t) => {
          row[t] = typeMap.get(t) ?? 0;
        });
        return row;
      });

      // ── Color scale ──
      const colorScale = scaleOrdinal<string>()
        .domain(types)
        .range([colors.chart1, colors.chart2, colors.chart3, colors.chart4, colors.chart5, colors.chart6]);

      // ── Scales ──
      const xScale = scaleBand<string>()
        .domain(locations)
        .range([0, innerWidth])
        .padding(0.2);

      let yMax: number;
      if (mode === "stacked") {
        yMax =
          max(distData, (d) => {
            let sum = 0;
            types.forEach((t) => {
              sum += (d[t] as number) ?? 0;
            });
            return sum;
          }) ?? 1;
      } else {
        yMax =
          max(distData, (d) =>
            max(types, (t) => (d[t] as number) ?? 0)
          ) ?? 1;
      }

      const yScale = scaleLinear()
        .domain([0, yMax * 1.1])
        .range([innerHeight, 0]);

      // ── SVG ──
      const svg = select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // ── Draw bars ──
      if (mode === "stacked") {
        const stackGen = stack<DistRow>().keys(types);
        const series = stackGen(distData);

        series.forEach((s) => {
          g.selectAll<SVGRectElement, typeof s[0]>(`.bar-${s.key}`)
            .data(s)
            .join("rect")
            .attr("class", `bar-${s.key}`)
            .attr("x", (d) => xScale(d.data.location as string) ?? 0)
            .attr("y", (d) => yScale(d[1]))
            .attr("height", (d) => Math.max(0, yScale(d[0]) - yScale(d[1])))
            .attr("width", xScale.bandwidth())
            .attr("fill", colorScale(s.key))
            .attr("rx", 1)
            .style("cursor", "pointer")
            .on("mouseenter", function (event: MouseEvent, d) {
              select(this).attr("opacity", 0.8);
              const val = d[1] - d[0];
              tooltip.show(
                `<strong>${d.data.location}</strong><br/>${s.key}: ${val}`,
                event
              );
            })
            .on("mouseleave", function () {
              select(this).attr("opacity", 1);
              tooltip.hide();
            });
        });
      } else {
        // Grouped mode
        const xSub = scaleBand<string>()
          .domain(types)
          .range([0, xScale.bandwidth()])
          .padding(0.05);

        distData.forEach((row) => {
          types.forEach((t) => {
            const val = (row[t] as number) ?? 0;
            g.append("rect")
              .attr(
                "x",
                (xScale(row.location as string) ?? 0) + (xSub(t) ?? 0)
              )
              .attr("y", yScale(val))
              .attr("width", xSub.bandwidth())
              .attr("height", Math.max(0, innerHeight - yScale(val)))
              .attr("fill", colorScale(t))
              .attr("rx", 1)
              .style("cursor", "pointer")
              .on("mouseenter", function (event: MouseEvent) {
                select(this).attr("opacity", 0.8);
                tooltip.show(
                  `<strong>${row.location}</strong><br/>${t}: ${val}`,
                  event
                );
              })
              .on("mouseleave", function () {
                select(this).attr("opacity", 1);
                tooltip.hide();
              });
          });
        });
      }

      // ── X Axis ──
      const xAxisGen = axisBottom(xScale);
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxisGen)
        .call((sel) => {
          sel
            .selectAll("text")
            .attr("fill", colors.text)
            .style("font-size", "9px")
            .attr("transform", "rotate(-20)")
            .attr("text-anchor", "end");
          sel.selectAll("line").attr("stroke", colors.tickLine);
          sel.select(".domain").attr("stroke", colors.axisLine);
        });

      // ── Y Axis ──
      const yAxisGen = axisLeft(yScale).ticks(5);
      g.append("g")
        .call(yAxisGen)
        .call((sel) => {
          sel.selectAll("text").attr("fill", colors.text).style("font-size", "11px");
          sel.selectAll("line").attr("stroke", colors.tickLine);
          sel.select(".domain").attr("stroke", colors.axisLine);
        });

      // ── Legend (bottom) ──
      const legendG = svg
        .append("g")
        .attr(
          "transform",
          `translate(${margin.left},${height - 15})`
        );

      types.forEach((t, i) => {
        const xOff = i * 80;
        legendG
          .append("rect")
          .attr("x", xOff)
          .attr("y", 0)
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", colorScale(t))
          .attr("rx", 2);

        legendG
          .append("text")
          .attr("x", xOff + 14)
          .attr("y", 9)
          .attr("fill", colors.text)
          .style("font-size", "10px")
          .text(t);
      });
    }

    render();

    const observer = createDebouncedResizeObserver(() => {
      if (!destroyed) render();
    });
    observer.observe(container);

    return () => {
      destroyed = true;
      observer.disconnect();
      tooltip.destroy();
      cleanupD3Svg(container as unknown as HTMLElement);
    };
  }, [resolvedTheme, data, mode]);

  return (
    <div className="flex flex-col h-full">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 px-2 py-1">
        <button
          onClick={() => setMode("stacked")}
          className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
            mode === "stacked"
              ? "bg-primary text-primary-foreground font-medium"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Stacked
        </button>
        <button
          onClick={() => setMode("grouped")}
          className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
            mode === "grouped"
              ? "bg-primary text-primary-foreground font-medium"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Grouped
        </button>
      </div>
      <div
        ref={containerRef}
        data-testid="distribution-view"
        className="flex-1 min-h-[310px] w-full"
      />
    </div>
  );
}
