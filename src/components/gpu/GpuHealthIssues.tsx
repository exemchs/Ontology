"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GpuHealthIssue } from "@/types";

interface GpuHealthIssuesProps {
  issues: GpuHealthIssue[];
}

function formatRelativeTime(timestamp: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

const severityStyles: Record<string, string> = {
  error:
    "bg-red-500/15 text-red-700 border-red-300 dark:text-red-400 dark:border-red-800",
  warning:
    "bg-amber-500/15 text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-800",
  info: "bg-blue-500/15 text-blue-700 border-blue-300 dark:text-blue-400 dark:border-blue-800",
};

export function GpuHealthIssues({ issues }: GpuHealthIssuesProps) {
  const sorted = [...issues]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 6);

  return (
    <Card data-testid="gpu-health-issues">
      <CardHeader>
        <CardTitle>Health Issues</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {sorted.map((issue) => (
            <div key={issue.id} className="flex items-start gap-3">
              <Badge
                variant="outline"
                className={`shrink-0 ${severityStyles[issue.severity]}`}
              >
                {issue.severity}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-tight">{issue.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {issue.gpuName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(issue.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
