"use client";

import { useEffect, useMemo } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { getDashboardAlerts } from "@/data/dashboard-data";
import type { Alert } from "@/types";

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(isoString: string | null): string {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function severityVariant(
  severity: Alert["severity"]
): "destructive" | "default" | "secondary" {
  switch (severity) {
    case "error":
      return "destructive";
    case "warning":
      return "default";
    case "info":
      return "secondary";
  }
}

// ── Component ───────────────────────────────────────────────────────────────

export function AlertBell() {
  const alerts = useMemo(() => getDashboardAlerts(), []);
  const unresolvedCount = alerts.filter((a) => !a.resolved).length;

  // Toast for the most recent unresolved alert on mount
  useEffect(() => {
    const unresolved = alerts.filter((a) => !a.resolved);
    if (unresolved.length > 0) {
      const latest = unresolved[0];
      toast.warning(latest.title, {
        description: latest.message.slice(0, 100) + "...",
        duration: 5000,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Popover>
      <PopoverTrigger asChild>
        <SidebarMenuButton tooltip="Notifications" className="relative">
          <Bell className="size-4" />
          <span>Notifications</span>
          {unresolvedCount > 0 && (
            <span className="absolute top-1.5 left-5 size-2 rounded-full bg-destructive group-data-[collapsible=icon]:left-1.5 group-data-[collapsible=icon]:top-1" />
          )}
        </SidebarMenuButton>
      </PopoverTrigger>

      <PopoverContent side="right" align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-medium">Notifications</h4>
          {unresolvedCount > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              {unresolvedCount} unresolved
            </Badge>
          )}
        </div>

        {/* Alert list */}
        <div className="max-h-80 overflow-y-auto">
          {alerts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No notifications
            </p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 border-b px-4 py-3 last:border-b-0 ${
                  alert.resolved ? "opacity-50" : ""
                }`}
              >
                <Badge
                  variant={severityVariant(alert.severity)}
                  className={`mt-0.5 shrink-0 text-[10px] px-1.5 py-0 ${
                    alert.severity === "warning"
                      ? "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400"
                      : ""
                  }`}
                >
                  {alert.severity}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight truncate">
                    {alert.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {alert.message}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                  {alert.resolved
                    ? formatRelativeTime(alert.resolvedAt)
                    : "active"}
                </span>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
