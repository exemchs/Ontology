"use client";

import { useEffect, useRef, useLayoutEffect, useState } from "react";
import { Maximize2 } from "lucide-react";

import type { DgraphNode } from "@/data/dgraph-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatNumber } from "@/components/charts/shared/chart-utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface NodePopoverProps {
  node: DgraphNode;
  x: number;
  y: number;
  onClose: () => void;
  onExpand: (node: DgraphNode) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "warning":
      return "bg-[var(--status-warning)]/15 text-[var(--status-warning)] border-[var(--status-warning)]/30";
    case "error":
      return "bg-[var(--status-critical)]/15 text-[var(--status-critical)] border-[var(--status-critical)]/30";
    default:
      return "";
  }
}

function getBarColor(value: number): string {
  if (value > 80) return "bg-[var(--status-critical)]";
  if (value >= 60) return "bg-[var(--status-warning)]";
  return "bg-[var(--status-healthy)]";
}

// ── Component ────────────────────────────────────────────────────────────────

export function NodePopover({ node, x, y, onClose, onExpand }: NodePopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: x, top: y });

  // Measure popover and adjust if it goes off-screen
  useLayoutEffect(() => {
    const el = popoverRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const pw = rect.width;
    const ph = rect.height;

    let left = x - pw / 2;
    let top = y - ph - 20;

    // Keep within viewport bounds
    if (left < 8) left = 8;
    if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
    if (top < 8) top = y + 20; // flip below if no room above

    setPosition({ left, top });
  }, [x, y]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const metrics = [
    { label: "CPU", value: node.cpuUsage },
    { label: "Memory", value: node.memoryUsage },
    { label: "Disk", value: node.diskUsage },
  ];

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 bg-popover border rounded-lg shadow-lg p-3 w-64"
      style={{ left: position.left, top: position.top }}
      data-testid="node-popover"
    >
      {/* Name + Status */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium truncate">{node.name}</span>
        <Badge
          variant={node.status === "healthy" ? "default" : "outline"}
          className={getStatusBadgeClass(node.status)}
        >
          {node.status}
        </Badge>
      </div>

      {/* Host:Port */}
      <p className="text-xs text-muted-foreground mt-0.5">
        {node.host}:{node.port}
      </p>

      <Separator className="my-2" />

      {/* Metrics */}
      <div className="space-y-1.5">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center gap-2">
            <span className="text-xs w-14">{m.label}</span>
            <span className="text-xs font-mono w-12 text-right">
              {m.value.toFixed(1)}%
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${getBarColor(m.value)}`}
                style={{ width: `${Math.min(m.value, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-2" />

      {/* QPS + Expand */}
      <div className="flex items-center justify-between">
        <span className="text-xs">
          QPS: <span className="font-mono">{formatNumber(node.qps)}</span>/min
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onExpand(node)}
          aria-label="Expand node details"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
