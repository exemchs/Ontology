"use client";

import { useMemo } from "react";
import { getDgraphErrorLog, type DgraphErrorLogEntry } from "@/data/dgraph-data";
import { Badge } from "@/components/ui/badge";

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / (60 * 1000));
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

const severityStyles: Record<
  DgraphErrorLogEntry["severity"],
  { badge: string; border: string }
> = {
  error: {
    badge: "bg-[var(--status-critical)]/15 text-[var(--status-critical)] border-[var(--status-critical)]/30",
    border: "border-l-[var(--status-critical)]",
  },
  warning: {
    badge: "bg-[var(--status-warning)]/15 text-[var(--status-warning)] border-[var(--status-warning)]/30",
    border: "border-l-[var(--status-warning)]",
  },
  info: {
    badge: "bg-[var(--status-healthy)]/15 text-[var(--status-healthy)] border-[var(--status-healthy)]/30",
    border: "border-l-[var(--status-healthy)]",
  },
};

export function ErrorTimeline() {
  const entries = useMemo(() => {
    return getDgraphErrorLog().sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, []);

  return (
    <div className="max-h-[280px] overflow-auto space-y-2 pr-1">
      {entries.map((entry, idx) => {
        const styles = severityStyles[entry.severity];
        return (
          <div
            key={idx}
            className={`border-l-2 ${styles.border} pl-3 py-2 rounded-r-md bg-muted/30`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 h-4 ${styles.badge}`}
              >
                {entry.severity}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {entry.alpha}
              </span>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {formatRelativeTime(entry.timestamp)}
              </span>
            </div>
            <p className="text-xs text-foreground/80 leading-snug">
              {entry.message}
            </p>
          </div>
        );
      })}
    </div>
  );
}
