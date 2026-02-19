"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusDot } from "@/components/ds/StatusDot";
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

function severityToStatus(severity: string): "healthy" | "warning" | "critical" {
  if (severity === "error") return "critical";
  if (severity === "warning") return "warning";
  return "healthy";
}

export function GpuHealthIssues({ issues }: GpuHealthIssuesProps) {
  const sorted = [...issues]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 6);

  return (
    <Card className="border-border/40" data-testid="gpu-health-issues">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Health Issues</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Severity</TableHead>
              <TableHead>GPU</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell>
                  <StatusDot
                    status={severityToStatus(issue.severity)}
                    label={issue.severity}
                  />
                </TableCell>
                <TableCell className="text-xs">{issue.gpuName}</TableCell>
                <TableCell className="text-sm max-w-[280px]">
                  {issue.message}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                  {formatRelativeTime(issue.timestamp)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
