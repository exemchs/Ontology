"use client";

import { useMemo } from "react";

import { getDgraphEvents, type DgraphEvent } from "@/data/dgraph-data";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getSeverityBorderColor(severity: DgraphEvent["severity"]): string {
  switch (severity) {
    case "error":
      return "border-l-[var(--status-critical)]";
    case "warning":
      return "border-l-[var(--status-warning)]";
    case "info":
      return "border-l-[var(--status-healthy)]";
  }
}

function getSeverityBadgeClass(severity: DgraphEvent["severity"]): string {
  switch (severity) {
    case "error":
      return "bg-[var(--status-critical)]/15 text-[var(--status-critical)] border-[var(--status-critical)]/30";
    case "warning":
      return "bg-[var(--status-warning)]/15 text-[var(--status-warning)] border-[var(--status-warning)]/30";
    case "info":
      return "bg-[var(--status-healthy)]/15 text-[var(--status-healthy)] border-[var(--status-healthy)]/30";
  }
}

// ── Component ────────────────────────────────────────────────────────────────

interface RecentEventsProps {
  className?: string;
}

export function RecentEvents({ className }: RecentEventsProps) {
  const events = useMemo(() => getDgraphEvents(), []);

  return (
    <ScrollArea className={className} data-testid="recent-events">
      <div className="space-y-2 pr-2">
        {events.map((event) => (
          <div
            key={event.id}
            className={`flex items-start gap-3 rounded-md border border-l-2 p-2.5 ${getSeverityBorderColor(event.severity)}`}
          >
            {/* Severity badge */}
            <Badge
              variant="outline"
              className={`shrink-0 text-[10px] ${getSeverityBadgeClass(event.severity)}`}
            >
              {event.severity}
            </Badge>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{event.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {event.nodeName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(event.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
