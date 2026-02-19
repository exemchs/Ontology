"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusDot } from "@/components/ds/StatusDot";
import type { Alert } from "@/types";

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

function severityToStatus(severity: Alert["severity"]): "healthy" | "warning" | "critical" {
  switch (severity) {
    case "error":
      return "critical";
    case "warning":
      return "warning";
    case "info":
      return "healthy";
  }
}

interface RecentAlertsProps {
  alerts: Alert[];
}

export function RecentAlerts({ alerts }: RecentAlertsProps) {
  return (
    <Card className="border-border/40" data-testid="recent-alerts">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          {alerts.map((alert) => (
            <AccordionItem key={alert.id} value={`alert-${alert.id}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-1 items-center gap-3">
                  <StatusDot
                    status={severityToStatus(alert.severity)}
                    label={alert.severity}
                  />
                  <span className="flex-1 text-left text-sm">{alert.title}</span>
                  {alert.resolvedAt && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatRelativeTime(alert.resolvedAt)}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-5">
                  <p className="text-xs text-muted-foreground">
                    {alert.nodeId ? `Node #${alert.nodeId}` : "Cluster-wide"}
                  </p>
                  <p className="text-sm">{alert.message}</p>
                  <StatusDot
                    status={alert.resolved ? "healthy" : "critical"}
                    label={alert.resolved ? "Resolved" : "Active"}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
