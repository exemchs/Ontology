"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Cpu, Thermometer, HardDrive, Zap } from "lucide-react";
import { StatusDot } from "@/components/ds/StatusDot";
import type { Gpu } from "@/types";

interface GpuCardProps {
  gpu: Gpu;
  onClick?: () => void;
  selected?: boolean;
  onSelectToggle?: (checked: boolean) => void;
}

function MetricBar({
  icon: Icon,
  label,
  value,
  unit,
  percent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  unit: string;
  percent: number;
}) {
  const barColor =
    percent >= 80
      ? "bg-[var(--status-critical)]"
      : percent >= 60
        ? "bg-[var(--status-warning)]"
        : "bg-[var(--status-healthy)]";

  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground w-12 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-right shrink-0">
        {value}{unit}
      </span>
    </div>
  );
}

export function GpuCard({ gpu, onClick, selected, onSelectToggle }: GpuCardProps) {
  const memoryPercent = (gpu.memoryUsed / gpu.memoryTotal) * 100;
  const powerPercent = (gpu.powerUsage / gpu.powerLimit) * 100;
  const status: "healthy" | "warning" | "critical" =
    gpu.status === "error" ? "critical" : gpu.status === "warning" ? "warning" : "healthy";

  return (
    <Card
      className={`border-border/40 p-3 gap-2.5 cursor-pointer transition-colors hover:border-primary/40 ${selected ? "ring-2 ring-primary/30" : ""}`}
      data-testid={`gpu-card-${gpu.id}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {onSelectToggle && (
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => {
                onSelectToggle(!!checked);
              }}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0"
            />
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{gpu.name}</span>
            <span className="text-xs text-muted-foreground">{gpu.model}</span>
          </div>
        </div>
        <StatusDot status={status} label={gpu.status} />
      </div>
      <div className="flex flex-col gap-2">
        <MetricBar icon={Cpu} label="Util" value={gpu.utilization} unit="%" percent={gpu.utilization} />
        <MetricBar icon={Thermometer} label="Temp" value={gpu.temperature} unit={"\u00b0C"} percent={(gpu.temperature / 90) * 100} />
        <MetricBar icon={HardDrive} label="Mem" value={`${gpu.memoryUsed}/${gpu.memoryTotal}`} unit="G" percent={memoryPercent} />
        <MetricBar icon={Zap} label="Power" value={`${gpu.powerUsage}/${gpu.powerLimit}`} unit="W" percent={powerPercent} />
      </div>
    </Card>
  );
}
