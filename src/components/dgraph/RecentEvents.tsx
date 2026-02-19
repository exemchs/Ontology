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
      return "border-l-red-500";
    case "warning":
      return "border-l-amber-500";
    case "info":
      return "border-l-blue-500";
  }
}

function getSeverityBadgeClass(severity: DgraphEvent["severity"]): string {
  switch (severity) {
    case "error":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "warning":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "info":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  }
}

// ── Component ────────────────────────────────────────────────────────────────

interface RecentEventsProps {
  className?: string;
}

export function RecentEvents({ className }: RecentEventsProps) {
  const events = useMemo(() => getDgraphEvents(), []);

  return (
    <ScrollArea className={className} style={{ maxHeight: 420 }} data-testid="recent-events">
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
