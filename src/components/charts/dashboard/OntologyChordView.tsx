"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { select } from "d3-selection";
import { chord as d3Chord, ribbon as d3Ribbon } from "d3-chord";
import { arc as d3Arc } from "d3-shape";
import { descending } from "d3-array";

import type { ChordData } from "@/lib/ontology-relation-data";
import { resolveColor, getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import { cleanupD3Svg } from "@/components/charts/shared/chart-utils";

interface OntologyChordViewProps {
  data: ChordData;
  width: number;
  height: number;
}

export function OntologyChordView({ data, width, height }: OntologyChordViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || width === 0 || height === 0) return;

    cleanupD3Svg(container);
    const tooltip = createTooltip();
    const colors = getChartColors();

    // Resolve chord colors from CSS variables
    const resolvedColors = data.colors.map((c) => {
      const match = c.match(/var\((.+)\)/);
      return match ? resolveColor(match[1]) : resolveColor(c);
    });

    const outerRadius = Math.min(width, height) * 0.4;
    const innerRadius = outerRadius - 20;

    const svg = select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Chord layout
    const chordLayout = d3Chord()
      .padAngle(0.05)
      .sortSubgroups(descending);

    const chords = chordLayout(data.matrix);

    // Arc generator for groups (outer arcs)
    const arcGenerator = d3Arc<d3.ChordGroup>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    // Ribbon generator for connections
    const ribbonGenerator = d3Ribbon<d3.Chord, d3.ChordSubgroup>()
      .radius(innerRadius);

    // Draw outer arcs (groups)
    g.append("g")
      .selectAll("path")
      .data(chords.groups)
      .join("path")
      .attr("d", arcGenerator as never)
      .attr("fill", (d) => resolvedColors[d.index] ?? colors.chart1)
      .attr("stroke", colors.background)
      .attr("stroke-width", 1);

    // Draw labels along outer arcs
    g.append("g")
      .selectAll("text")
      .data(chords.groups)
      .join("text")
      .each(function (d) {
        const angle = (d.startAngle + d.endAngle) / 2;
        const flip = angle > Math.PI;
        select(this)
          .attr(
            "transform",
            `rotate(${(angle * 180) / Math.PI - 90}) translate(${outerRadius + 8}) ${flip ? "rotate(180)" : ""}`
          )
          .attr("text-anchor", flip ? "end" : "start")
          .attr("alignment-baseline", "middle");
      })
      .attr("fill", colors.text)
      .style("font-size", "11px")
      .text((d) => data.names[d.index] ?? "");

    // Draw ribbons (connections)
    const ribbons = g
      .append("g")
      .selectAll("path")
      .data(chords)
      .join("path")
      .attr("d", ribbonGenerator as never)
      .attr("fill", (d) => resolvedColors[d.source.index] ?? colors.chart1)
      .attr("opacity", 0.6)
      .attr("stroke", "none");

    // Hover interaction
    ribbons
      .on("mouseenter", function (event: MouseEvent, d) {
        // Dim all ribbons
        ribbons.attr("opacity", 0.1);
        // Highlight hovered
        select(this).attr("opacity", 0.8);

        const sourceName = data.names[d.source.index] ?? "?";
        const targetName = data.names[d.target.index] ?? "?";
        const value = d.source.value;

        tooltip.show(
          `<strong>${sourceName}</strong> &rarr; <strong>${targetName}</strong><br/>Relations: ${value}`,
          event
        );
      })
      .on("mouseleave", function () {
        // Restore all ribbons
        ribbons.attr("opacity", 0.6);
        tooltip.hide();
      });

    return () => {
      tooltip.destroy();
      cleanupD3Svg(container);
    };
  }, [data, width, height, resolvedTheme]);

  return <div ref={containerRef} style={{ width, height }} />;
}
