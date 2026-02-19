"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Thermometer, HardDrive, Zap } from "lucide-react";
import type { Gpu } from "@/types";

interface GpuCardProps {
  gpu: Gpu;
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
      ? "bg-red-500"
      : percent >= 60
        ? "bg-amber-500"
        : "bg-green-500";

  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground w-12 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span className="text-xs tabular-nums w-14 text-right shrink-0">
        {value}
        {unit}
      </span>
    </div>
  );
}

const statusColors: Record<string, string> = {
  healthy:
    "bg-green-500/15 text-green-700 border-green-300 dark:text-green-400 dark:border-green-800",
  warning:
    "bg-amber-500/15 text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-800",
  error:
    "bg-red-500/15 text-red-700 border-red-300 dark:text-red-400 dark:border-red-800",
};

export function GpuCard({ gpu }: GpuCardProps) {
  const memoryPercent = (gpu.memoryUsed / gpu.memoryTotal) * 100;
  const powerPercent = (gpu.powerUsage / gpu.powerLimit) * 100;

  return (
    <Card className="p-4 gap-3" data-testid={`gpu-card-${gpu.id}`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{gpu.name}</span>
          <span className="text-xs text-muted-foreground">{gpu.model}</span>
        </div>
        <Badge variant="outline" className={statusColors[gpu.status]}>
          {gpu.status}
        </Badge>
      </div>
      <div className="flex flex-col gap-2">
        <MetricBar
          icon={Cpu}
          label="Util"
          value={gpu.utilization}
          unit="%"
          percent={gpu.utilization}
        />
        <MetricBar
          icon={Thermometer}
          label="Temp"
          value={gpu.temperature}
          unit={"\u00b0C"}
          percent={(gpu.temperature / 90) * 100}
        />
        <MetricBar
          icon={HardDrive}
          label="Mem"
          value={`${gpu.memoryUsed}/${gpu.memoryTotal}`}
          unit="G"
          percent={memoryPercent}
        />
        <MetricBar
          icon={Zap}
          label="Power"
          value={`${gpu.powerUsage}/${gpu.powerLimit}`}
          unit="W"
          percent={powerPercent}
        />
      </div>
    </Card>
  );
}
