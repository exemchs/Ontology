"use client";

import { useMemo } from "react";
import { AlertTriangle, Info, Activity, Network } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  // Orphan detection: types with no outbound relations AND not referenced by any other type
  const referencedTargets = new Set<string>();
  types.forEach((t) => {
    t.relations.forEach((rel) => referencedTargets.add(rel.target));
  });

  const orphanTypes = types
    .filter((t) => t.relations.length === 0 && !referencedTargets.has(t.name))
    .map((t) => t.name);

  // Empty detection: types with nodeCount === 0
  const emptyTypes = types.filter((t) => t.nodeCount === 0).map((t) => t.name);

  // Score: max(0, 100 - (orphans * 15) - (empties * 10))
  const score = Math.max(
    0,
    100 - orphanTypes.length * 15 - emptyTypes.length * 10
  );

  // Hub Type Top 5: types sorted by outbound relation count
  const hubTop5 = [...types]
    .sort((a, b) => b.relations.length - a.relations.length)
    .slice(0, 5)
    .map((t) => ({ name: t.name, count: t.relations.length }));

  // Relation density
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
  if (score >= 80) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function getScoreLabel(
  score: number
): { text: string; variant: "default" | "secondary" | "destructive" } {
  if (score >= 80) return { text: "Healthy", variant: "default" };
  if (score >= 50) return { text: "Warning", variant: "secondary" };
  return { text: "Critical", variant: "destructive" };
}

export function SchemaHealthScore({ types }: SchemaHealthScoreProps) {
  const health = useMemo(() => computeHealthScore(types), [types]);
  const label = getScoreLabel(health.score);

  return (
    <Card
      className="border-border/40 flex flex-col gap-3 p-3"
      data-testid="schema-health-score"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
          <Activity className="size-3.5" />
          Schema Health
        </h3>
        <Badge variant={label.variant} className="text-[10px]">
          {label.text}
        </Badge>
      </div>

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
          <div className="flex items-center gap-1 text-xs text-amber-500">
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
    </Card>
  );
}
