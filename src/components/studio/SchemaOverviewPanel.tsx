"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  Info,
  Activity,
  Network,
  ChevronRight,
} from "lucide-react";
import { select } from "d3-selection";
import {
  hierarchy,
  treemap,
  treemapSquarify,
  type HierarchyRectangularNode,
} from "d3-hierarchy";
import { scaleOrdinal } from "d3-scale";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  cleanupD3Svg,
  createDebouncedResizeObserver,
} from "@/components/charts/shared/chart-utils";
import { getChartColors } from "@/components/charts/shared/chart-theme";
import { createTooltip } from "@/components/charts/shared/chart-tooltip";
import { computeHealthScore } from "@/components/studio/SchemaHealthScore";
import type { OntologyType } from "@/types";

interface SchemaOverviewPanelProps {
  types: OntologyType[];
}

const STORAGE_KEY = "schema-overview-panel";

function getScoreColor(score: number): string {
  if (score >= 80) return "text-[var(--status-healthy)]";
  if (score >= 50) return "text-[var(--status-warning)]";
  return "text-[var(--status-critical)]";
}

function getScoreLabel(
  score: number
): { text: string; variant: "default" | "secondary" | "destructive" } {
  if (score >= 80) return { text: "Healthy", variant: "default" };
  if (score >= 50) return { text: "Warning", variant: "secondary" };
  return { text: "Critical", variant: "destructive" };
}

export function SchemaOverviewPanel({ types }: SchemaOverviewPanelProps) {
  const health = useMemo(() => computeHealthScore(types), [types]);
  const label = getScoreLabel(health.score);
  const totalRecords = useMemo(
    () => types.reduce((sum, t) => sum + t.nodeCount, 0),
    [types]
  );

  const [open, setOpen] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "closed") setOpen(false);
  }, []);

  function handleToggle(next: boolean) {
    setOpen(next);
    localStorage.setItem(STORAGE_KEY, next ? "open" : "closed");
  }

  // Treemap refs
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const destroyedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const svgEl = svgRef.current;
    const containerEl = containerRef.current;
    if (!svgEl || !containerEl) return;

    destroyedRef.current = false;
    let cleanupFn: (() => void) | null = null;

    const resizeObserver = createDebouncedResizeObserver((w, h) => {
      if (destroyedRef.current || w === 0 || h === 0) return;
      renderTreemap(w, h);
    }, 100);

    resizeObserver.observe(containerEl);

    function renderTreemap(width: number, height: number) {
      cleanupD3Svg(svgEl as unknown as HTMLElement);

      const colors = getChartColors();
      const tooltip = createTooltip();

      const colorValues = [
        colors.chart1,
        colors.chart2,
        colors.chart3,
        colors.chart4,
        colors.chart5,
        colors.chart6,
      ];
      const colorScale = scaleOrdinal<string>()
        .domain(types.map((t) => t.name))
        .range(colorValues);

      const rootData = {
        name: "Schema",
        children: types.map((t) => ({
          name: t.name,
          value: t.nodeCount,
          predicateCount: t.predicates.length,
        })),
      };

      type TreeNode = typeof rootData;

      const root = hierarchy<TreeNode>(rootData)
        .sum((d) => (d as { value?: number }).value ?? 0)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

      const treemapLayout = treemap<TreeNode>()
        .size([width, height])
        .padding(2)
        .round(true)
        .tile(treemapSquarify);

      const treemapRoot = treemapLayout(root);

      const svg = select(svgEl as SVGSVGElement)
        .attr("width", width)
        .attr("height", height);

      const leaves =
        treemapRoot.leaves() as HierarchyRectangularNode<TreeNode>[];

      const cells = svg
        .selectAll<SVGGElement, HierarchyRectangularNode<TreeNode>>("g")
        .data(leaves)
        .join("g")
        .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

      cells
        .append("rect")
        .attr("width", (d) => Math.max(0, d.x1 - d.x0))
        .attr("height", (d) => Math.max(0, d.y1 - d.y0))
        .attr("fill", (d) => colorScale(d.data.name))
        .attr("fill-opacity", 0.8)
        .attr("rx", 3)
        .attr("stroke", colors.background)
        .attr("stroke-width", 1)
        .style("cursor", "pointer")
        .on("mouseenter", function (event: MouseEvent, d) {
          select(this).attr("fill-opacity", 1);
          const child = d.data as {
            name: string;
            value?: number;
            predicateCount?: number;
          };
          tooltip.show(
            `<strong>${child.name}</strong><br/>Records: ${(child.value ?? 0).toLocaleString()}<br/>Predicates: ${child.predicateCount ?? 0}`,
            event
          );
        })
        .on("mousemove", function (event: MouseEvent, d) {
          const child = d.data as {
            name: string;
            value?: number;
            predicateCount?: number;
          };
          tooltip.show(
            `<strong>${child.name}</strong><br/>Records: ${(child.value ?? 0).toLocaleString()}<br/>Predicates: ${child.predicateCount ?? 0}`,
            event
          );
        })
        .on("mouseleave", function () {
          select(this).attr("fill-opacity", 0.8);
          tooltip.hide();
        });

      cells
        .append("text")
        .attr("x", 6)
        .attr("y", 16)
        .attr("fill", colors.background)
        .attr("font-size", (d) => {
          const cellW = d.x1 - d.x0;
          return cellW > 80 ? "11px" : cellW > 50 ? "9px" : "0px";
        })
        .attr("font-weight", "600")
        .attr("pointer-events", "none")
        .text((d) => d.data.name);

      cells
        .append("text")
        .attr("x", 6)
        .attr("y", 30)
        .attr("fill", colors.background)
        .attr("fill-opacity", 0.8)
        .attr("font-size", (d) => {
          const cellW = d.x1 - d.x0;
          const cellH = d.y1 - d.y0;
          return cellW > 60 && cellH > 35 ? "10px" : "0px";
        })
        .attr("pointer-events", "none")
        .text((d) => {
          const child = d.data as { value?: number };
          const v = child.value ?? 0;
          if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
          return String(v);
        });

      cleanupFn = () => {
        tooltip.destroy();
        cleanupD3Svg(svgEl as unknown as HTMLElement);
      };
    }

    return () => {
      destroyedRef.current = true;
      resizeObserver.disconnect();
      cleanupFn?.();
    };
  }, [types, open]);

  return (
    <Collapsible open={open} onOpenChange={handleToggle}>
      <div className="group rounded-lg border border-border/40 bg-card">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <ChevronRight
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                open && "rotate-90"
              )}
            />
            <span className="font-medium">Schema Overview</span>
            {!open && (
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-bold tabular-nums ${getScoreColor(health.score)}`}
                >
                  {health.score}/100
                </span>
                <Badge variant={label.variant} className="text-[10px]">
                  {label.text}
                </Badge>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {types.length} types / {totalRecords.toLocaleString()} records
                </span>
              </div>
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4">
            <div className="flex items-stretch gap-4">
              {/* Left: Schema Health stats */}
              <div
                className="flex flex-col gap-3 shrink-0"
                style={{ width: 260 }}
              >
                {/* Score */}
                <div className="flex items-center gap-2">
                  <Activity className="size-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold">Schema Health</span>
                  <Badge variant={label.variant} className="text-[10px]">
                    {label.text}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-3xl font-bold tabular-nums ${getScoreColor(health.score)}`}
                  >
                    {health.score}
                  </span>
                  <span className="text-muted-foreground text-xs">/100</span>
                </div>

                {/* Orphan types */}
                {health.orphanTypes.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-xs text-[var(--status-warning)]">
                      <AlertTriangle className="size-3" />
                      <span>Orphan Types ({health.orphanTypes.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {health.orphanTypes.map((name) => (
                        <Badge
                          key={name}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty types */}
                {health.emptyTypes.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Info className="size-3" />
                      <span>Empty Types ({health.emptyTypes.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {health.emptyTypes.map((name) => (
                        <Badge
                          key={name}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div className="border-t pt-2">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <Network className="size-3" />
                    Relation Density
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {health.relationDensity.toFixed(1)} relations/type
                  </span>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="w-px self-stretch bg-border/40" />

              {/* Right: Treemap */}
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="text-xs font-semibold mb-2">
                  Records by Type
                </span>
                <div
                  ref={containerRef}
                  className="flex-1 min-h-[160px] overflow-hidden"
                >
                  <svg ref={svgRef} className="w-full h-full" />
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
