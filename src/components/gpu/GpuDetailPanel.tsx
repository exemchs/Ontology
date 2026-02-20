"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Gpu, GpuProcess } from "@/types";
import type { GpuDetailData } from "@/data/gpu-data";

// ── Types ────────────────────────────────────────────────────────────────────

interface GpuDetailPanelProps {
  gpu: Gpu | null;
  allGpus: Gpu[];
  processes: GpuProcess[];
  detailData: GpuDetailData | null;
  onGpuChange: (gpuId: number) => void;
  onClose: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getStatusVariant(status: string): "default" | "outline" {
  return status === "healthy" ? "default" : "outline";
}

function getStatusClassName(status: string): string {
  if (status === "warning") return "bg-[var(--status-warning)]/15 text-[var(--status-warning)] border-[var(--status-warning)]/30";
  if (status === "error") return "bg-[var(--status-critical)]/15 text-[var(--status-critical)] border-[var(--status-critical)]/30";
  return "";
}

function formatMemory(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
}

function getBarColor(value: number): string {
  if (value > 80) return "bg-[var(--status-critical)]";
  if (value >= 60) return "bg-[var(--status-warning)]";
  return "bg-[var(--status-healthy)]";
}

// ── Component ────────────────────────────────────────────────────────────────

export function GpuDetailPanel({ gpu, allGpus, processes, detailData, onGpuChange }: GpuDetailPanelProps) {
  if (!gpu) return null;

  const gpuProcesses = processes.filter((p) => p.gpuName === gpu.name);
  const memoryPercent = (gpu.memoryUsed / gpu.memoryTotal) * 100;
  const powerPercent = (gpu.powerUsage / gpu.powerLimit) * 100;

  const metrics = [
    { label: "Utilization", value: `${gpu.utilization}%`, percent: gpu.utilization },
    { label: "Temperature", value: `${gpu.temperature}\u00b0C`, percent: (gpu.temperature / 90) * 100 },
    { label: "Memory", value: `${gpu.memoryUsed} / ${gpu.memoryTotal} GB`, percent: memoryPercent },
    { label: "Power", value: `${gpu.powerUsage} / ${gpu.powerLimit} W`, percent: powerPercent },
  ];

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]" data-testid="gpu-detail-panel">
      <div className="space-y-6 px-1 pb-4">
        {/* GPU Selector */}
        <Select
          value={String(gpu.id)}
          onValueChange={(v) => onGpuChange(Number(v))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {allGpus.map((g) => (
              <SelectItem key={g.id} value={String(g.id)}>
                <span className="font-medium">{g.name}</span>
                <span className="text-muted-foreground ml-2 text-xs">{g.model}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant={getStatusVariant(gpu.status)}
            className={getStatusClassName(gpu.status)}
          >
            {gpu.status}
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-3">
          {metrics.map((m) => (
            <Card key={m.label} className="py-3">
              <CardContent className="px-4 py-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  <span className="text-sm font-mono font-medium">{m.value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getBarColor(m.percent)}`}
                    style={{ width: `${Math.min(m.percent, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        {/* DCGM Extended Metrics */}
        {detailData && (
          <>
            <div>
              <p className="text-sm font-medium mb-3">DCGM Extended Metrics</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border px-3 py-2">
                  <span className="text-xs text-muted-foreground block">SM Clock</span>
                  <span className="text-sm font-mono">{detailData.smClock} MHz</span>
                </div>
                <div className="rounded-md border px-3 py-2">
                  <span className="text-xs text-muted-foreground block">Memory Clock</span>
                  <span className="text-sm font-mono">{detailData.memoryClock} MHz</span>
                </div>
                <div className="rounded-md border px-3 py-2">
                  <span className="text-xs text-muted-foreground block">PCIe TX</span>
                  <span className="text-sm font-mono">{detailData.pcieTxBandwidth} GB/s</span>
                </div>
                <div className="rounded-md border px-3 py-2">
                  <span className="text-xs text-muted-foreground block">PCIe RX</span>
                  <span className="text-sm font-mono">{detailData.pcieRxBandwidth} GB/s</span>
                </div>
                <div className="rounded-md border px-3 py-2">
                  <span className="text-xs text-muted-foreground block">ECC Single-Bit</span>
                  <span className="text-sm font-mono">{detailData.eccSingleBit}</span>
                </div>
                <div className="rounded-md border px-3 py-2">
                  <span className="text-xs text-muted-foreground block">ECC Double-Bit</span>
                  <span className="text-sm font-mono">{detailData.eccDoubleBit}</span>
                </div>
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Process Table */}
        <div>
          <p className="text-sm font-medium mb-3">
            Processes ({gpuProcesses.length})
          </p>
          {gpuProcesses.length === 0 ? (
            <p className="text-xs text-muted-foreground">No active processes</p>
          ) : (
            <div className="space-y-2">
              {gpuProcesses.map((proc) => (
                <div
                  key={proc.pid}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-mono truncate">{proc.processName}</p>
                    <p className="text-xs text-muted-foreground">
                      PID: {proc.pid} | Type: {proc.type}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs font-mono">{proc.gpuUtilization}% GPU</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {formatMemory(proc.memoryUsed)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
