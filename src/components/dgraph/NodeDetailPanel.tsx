"use client";

import { ArrowRight } from "lucide-react";

import type { DgraphNode, DgraphLink } from "@/data/dgraph-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatNumber } from "@/components/charts/shared/chart-utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface NodeDetailPanelProps {
  node: DgraphNode;
  allNodes: DgraphNode[];
  links: DgraphLink[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getBarColor(value: number): string {
  if (value > 80) return "bg-red-500";
  if (value >= 60) return "bg-amber-500";
  return "bg-[var(--status-healthy)]";
}

function getConnectionType(a: DgraphNode, b: DgraphNode): string {
  const types = [a.type, b.type].sort();
  if (types[0] === "alpha" && types[1] === "alpha") return "alpha-alpha";
  if (types[0] === "alpha" && types[1] === "zero") return "zero-alpha";
  return "zero-zero";
}

// ── Component ────────────────────────────────────────────────────────────────

export function NodeDetailPanel({ node, allNodes, links }: NodeDetailPanelProps) {
  // Find connected nodes
  const connections = links
    .filter((l) => l.source === node.id || l.target === node.id)
    .map((l) => {
      const otherId = l.source === node.id ? l.target : l.source;
      const otherNode = allNodes.find((n) => n.id === otherId);
      return otherNode ? { node: otherNode, linkType: l.type } : null;
    })
    .filter(Boolean) as { node: DgraphNode; linkType: string }[];

  const metrics = [
    { label: "CPU Usage", value: node.cpuUsage },
    { label: "Memory", value: node.memoryUsage },
    { label: "Disk", value: node.diskUsage },
  ];

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] pr-3" data-testid="node-detail-panel">
      <div className="space-y-6 pb-4">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold">{node.name}</h2>
            <Badge
              variant={node.status === "healthy" ? "default" : "outline"}
              className={
                node.status === "warning"
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  : node.status === "error"
                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                    : ""
              }
            >
              {node.status}
            </Badge>
            <Badge variant="secondary">{node.type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {node.host}:{node.port}
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-3">
          {metrics.map((m) => (
            <Card key={m.label} className="py-3">
              <CardContent className="px-4 py-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  <span className="text-sm font-mono font-medium">
                    {m.value.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getBarColor(m.value)}`}
                    style={{ width: `${Math.min(m.value, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* QPS */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Queries Per Second</p>
          <p className="text-2xl font-bold font-mono">
            {formatNumber(node.qps)}
            <span className="text-sm font-normal text-muted-foreground ml-1">/min</span>
          </p>
        </div>

        <Separator />

        {/* Connections */}
        <div>
          <p className="text-sm font-medium mb-3">
            Connections ({connections.length})
          </p>
          <div className="space-y-2">
            {connections.map((conn) => (
              <div
                key={conn.node.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm">{conn.node.name}</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {conn.linkType}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Close hint */}
        <p className="text-xs text-muted-foreground text-center">
          Press Esc or click outside to close
        </p>
      </div>
    </ScrollArea>
  );
}
