"use client";

import { useMemo, useState, useEffect } from "react";
import { AlertTriangle, Info, Activity, Network, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { getSchemaStats } from "@/data/studio-data";
import type { OntologyType } from "@/types";

interface SchemaHealthScoreProps {
  types: OntologyType[];
}

interface HealthResult {
  score: number;
  orphanTypes: string[];
  emptyTypes: string[];
  hubTop5: { name: string; count: number }[];
  relationDensity: number;
}

export function computeHealthScore(types: OntologyType[]): HealthResult {
  const referencedTargets = new Set<string>();
  types.forEach((t) => {
    t.relations.forEach((rel) => referencedTargets.add(rel.target));
  });

  const orphanTypes = types
    .filter((t) => t.relations.length === 0 && !referencedTargets.has(t.name))
    .map((t) => t.name);

  const emptyTypes = types.filter((t) => t.nodeCount === 0).map((t) => t.name);

  const score = Math.max(
    0,
    100 - orphanTypes.length * 15 - emptyTypes.length * 10
  );

  const hubTop5 = [...types]
    .sort((a, b) => b.relations.length - a.relations.length)
    .slice(0, 5)
    .map((t) => ({ name: t.name, count: t.relations.length }));

  const stats = getSchemaStats(types);

  return {
    score,
    orphanTypes,
    emptyTypes,
    hubTop5,
    relationDensity: stats.relationDensity,
  };
}

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

const STORAGE_KEY = "schema-health-panel";

export function SchemaHealthScore({ types }: SchemaHealthScoreProps) {
  const health = useMemo(() => computeHealthScore(types), [types]);
  const label = getScoreLabel(health.score);

  const [open, setOpen] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "closed") setOpen(false);
  }, []);

  function handleToggle(next: boolean) {
    setOpen(next);
    localStorage.setItem(STORAGE_KEY, next ? "open" : "closed");
  }

  return (
    <Collapsible open={open} onOpenChange={handleToggle}>
      <div
        className="rounded-lg border border-border/40 bg-card"
        data-testid="schema-health-score"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <ChevronRight
              className={cn(
                "size-3.5 text-muted-foreground transition-transform",
                open && "rotate-90"
              )}
            />
            <Activity className="size-3.5" />
            <span className="text-xs font-semibold">Schema Health</span>
          </div>
          <div className="flex items-center gap-2">
            {!open && (
              <span className={`text-sm font-bold tabular-nums ${getScoreColor(health.score)}`}>
                {health.score}
              </span>
            )}
            <Badge variant={label.variant} className="text-[10px]">
              {label.text}
            </Badge>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="flex flex-col gap-3 px-3 pb-3">
            {/* Score */}
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
                    <Badge key={name} variant="outline" className="text-[10px]">
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
                    <Badge key={name} variant="outline" className="text-[10px]">
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

            {/* Hub Type Top 5 */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium">Hub Types (Top 5)</span>
              <div className="flex flex-col gap-0.5">
                {health.hubTop5.map((hub) => (
                  <div
                    key={hub.name}
                    className="text-muted-foreground flex items-center justify-between text-xs"
                  >
                    <span>{hub.name}</span>
                    <span className="tabular-nums">
                      {hub.count} rel{hub.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
