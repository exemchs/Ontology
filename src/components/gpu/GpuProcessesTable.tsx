"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GpuProcess } from "@/types";

interface GpuProcessesTableProps {
  processes: GpuProcess[];
}

function formatMemory(mb: number): string {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  return `${mb} MB`;
}

const typeStyles: Record<string, string> = {
  C: "bg-blue-500/15 text-blue-700 border-blue-300 dark:text-blue-400 dark:border-blue-800",
  G: "bg-green-500/15 text-green-700 border-green-300 dark:text-green-400 dark:border-green-800",
};

export function GpuProcessesTable({ processes }: GpuProcessesTableProps) {
  return (
    <Card className="border-border/40" data-testid="gpu-processes-table">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">GPU Processes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PID</TableHead>
              <TableHead>GPU</TableHead>
              <TableHead>Memory</TableHead>
              <TableHead>Process Name</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processes.map((proc) => (
              <TableRow key={proc.pid}>
                <TableCell className="tabular-nums">{proc.pid}</TableCell>
                <TableCell>
                  <Badge variant="outline">{proc.gpuName}</Badge>
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatMemory(proc.memoryUsed)}
                </TableCell>
                <TableCell className="font-mono text-xs max-w-[200px] truncate">
                  {proc.processName}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={typeStyles[proc.type]}>
                    {proc.type}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
