"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatusDot } from "@/components/ds/StatusDot";
import { GpuThresholdForm } from "@/components/gpu/GpuThresholdForm";
import type { GpuHealthIssue } from "@/types";

interface GpuHealthIssuesProps {
  issues: GpuHealthIssue[];
  className?: string;
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

export function GpuHealthIssues({ issues, className }: GpuHealthIssuesProps) {
  const [showThresholds, setShowThresholds] = useState(false);

  const sorted = [...issues]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <>
      <Card className={cn("border-border/40 flex flex-col h-full", className)} data-testid="gpu-health-issues">
        <CardHeader className="pb-2 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">Health Issues</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowThresholds(true)}
            >
              <Settings2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden p-0 flex-1 min-h-0">
          <div className="h-full overflow-y-auto px-6 pb-6">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-[60px]">Sev</TableHead>
                <TableHead className="w-[50px]">GPU</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[60px]">Time</TableHead>
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
                  <TableCell className="text-xs max-w-[200px] truncate">
                    {issue.message}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                    {formatRelativeTime(issue.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showThresholds} onOpenChange={setShowThresholds}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Alert Thresholds</DialogTitle>
          </DialogHeader>
          <GpuThresholdForm compact />
        </DialogContent>
      </Dialog>
    </>
  );
}
