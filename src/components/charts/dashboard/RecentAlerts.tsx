"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function severityVariant(severity: Alert["severity"]) {
  switch (severity) {
    case "error":
      return "destructive" as const;
    case "warning":
      return undefined; // custom styling
    case "info":
      return "secondary" as const;
  }
}

interface RecentAlertsProps {
  alerts: Alert[];
}

export function RecentAlerts({ alerts }: RecentAlertsProps) {
  return (
    <Card data-testid="recent-alerts">
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          {alerts.map((alert) => (
            <AccordionItem key={alert.id} value={`alert-${alert.id}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-1 items-center gap-3">
                  <Badge
                    variant={severityVariant(alert.severity)}
                    className={
                      alert.severity === "warning"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        : undefined
                    }
                  >
                    {alert.severity}
                  </Badge>
                  <span className="flex-1 text-left">{alert.title}</span>
                  {alert.resolvedAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(alert.resolvedAt)}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-2">
                  <p className="text-sm text-muted-foreground">
                    {alert.nodeId ? `Node #${alert.nodeId}` : "Cluster-wide"}
                  </p>
                  <p className="text-sm">{alert.message}</p>
                  <Badge
                    variant={alert.resolved ? "default" : "destructive"}
                    className={
                      alert.resolved
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : undefined
                    }
                  >
                    {alert.resolved ? "Resolved" : "Active"}
                  </Badge>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
