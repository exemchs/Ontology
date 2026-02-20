"use client";

import { Cpu, Thermometer, HardDrive, Zap, Terminal } from "lucide-react";
import { StatusDot } from "@/components/ds/StatusDot";
import { cn } from "@/lib/utils";
import type { Gpu, GpuProcess } from "@/types";

interface GpuListProps {
  gpus: Gpu[];
  processes: GpuProcess[];
  selectedId: number | null;
  onSelect: (gpuId: number) => void;
  className?: string;
}

function getBarColor(pct: number): string {
  if (pct >= 80) return "bg-[var(--status-critical)]";
  if (pct >= 60) return "bg-[var(--status-warning)]";
  return "bg-[var(--status-healthy)]";
}

function MiniBar({ percent }: { percent: number }) {
  return (
    <div className="w-10 h-1 rounded-full bg-muted overflow-hidden">
      <div
        className={cn("h-full rounded-full", getBarColor(percent))}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

export function GpuList({ gpus, processes, selectedId, onSelect, className }: GpuListProps) {
  // Pre-compute process counts per GPU
  const processCountMap = new Map<string, number>();
  for (const p of processes) {
    processCountMap.set(p.gpuName, (processCountMap.get(p.gpuName) ?? 0) + 1);
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border/50">
            <th className="px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">GPU</th>
            <th className="px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-center">Status</th>
            <th className="px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              <div className="flex items-center gap-1"><Cpu className="size-3" />Util</div>
            </th>
            <th className="px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              <div className="flex items-center gap-1"><Thermometer className="size-3" />Temp</div>
            </th>
            <th className="px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              <div className="flex items-center gap-1"><HardDrive className="size-3" />Mem</div>
            </th>
            <th className="px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              <div className="flex items-center gap-1"><Terminal className="size-3" />Proc</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {gpus.map((gpu) => {
            const isSelected = gpu.id === selectedId;
            const status: "healthy" | "warning" | "critical" =
              gpu.status === "error" ? "critical" : gpu.status === "warning" ? "warning" : "healthy";
            const memPct = (gpu.memoryUsed / gpu.memoryTotal) * 100;
            const procCount = processCountMap.get(gpu.name) ?? 0;

            return (
              <tr
                key={gpu.id}
                onClick={() => onSelect(gpu.id)}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/50 border-b border-border/30 last:border-b-0",
                  isSelected && "bg-primary/5"
                )}
              >
                <td className="px-3 py-2">
                  <div className="text-xs font-medium">{gpu.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">{gpu.model}</div>
                </td>
                <td className="px-3 py-2 text-center">
                  <StatusDot status={status} />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] tabular-nums">{gpu.utilization}%</span>
                    <MiniBar percent={gpu.utilization} />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className="text-[11px] tabular-nums">{gpu.temperature}&deg;</span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] tabular-nums">{gpu.memoryUsed}/{gpu.memoryTotal}G</span>
                    <MiniBar percent={memPct} />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className="text-[11px] tabular-nums text-muted-foreground">{procCount}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
