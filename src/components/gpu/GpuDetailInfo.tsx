"use client";

import {
  Cpu,
  Zap,
  Thermometer,
  MemoryStick,
  Clock,
  Gauge,
  ArrowLeftRight,
  ToggleRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Gpu } from "@/types";
import type { GpuDetailData } from "@/data/gpu-data";

interface GpuDetailInfoProps {
  gpu: Gpu;
  detailData: GpuDetailData | null;
  className?: string;
  /** When true, renders without Card wrapper (for embedding inside another Card) */
  embedded?: boolean;
}

interface MetricTile {
  icon: LucideIcon;
  label: string;
  value: string;
  highlight?: boolean;
}

function DetailContent({ gpu, detailData }: { gpu: Gpu; detailData: GpuDetailData | null }) {
  const memPct = Math.round((gpu.memoryUsed / gpu.memoryTotal) * 100);

  const tiles: MetricTile[] = [
    { icon: Cpu, label: "SM Clock", value: detailData ? `${detailData.smClock} MHz` : "—" },
    { icon: Gauge, label: "Utilization", value: `${gpu.utilization} %` },
    { icon: Zap, label: "Power Draw", value: `${gpu.powerUsage} W` },
    { icon: Thermometer, label: "Temp", value: `${gpu.temperature} °C` },
    { icon: Clock, label: "Mem Clock", value: detailData ? `${detailData.memoryClock} MHz` : "—" },
    { icon: MemoryStick, label: "Memory", value: `${memPct} %` },
    { icon: Zap, label: "Power Limit", value: `${gpu.powerLimit} W` },
    {
      icon: ToggleRight,
      label: "Persistence",
      value: detailData ? (detailData.persistenceMode ? "Enabled" : "Disabled") : "—",
      highlight: detailData ? !detailData.persistenceMode : false,
    },
    { icon: ArrowLeftRight, label: "PCIe TX", value: detailData ? `${detailData.pcieTxBandwidth} GB/s` : "—" },
    { icon: ArrowLeftRight, label: "PCIe RX", value: detailData ? `${detailData.pcieRxBandwidth} GB/s` : "—" },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="text-sm font-semibold">{gpu.name}</span>
        <Badge variant="secondary" className="text-[10px] font-medium">
          {gpu.model}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className={cn(
              "rounded-md border border-border/50 bg-muted/30 px-3 py-2.5 flex items-center gap-2.5",
              tile.highlight && "border-[var(--status-warning)]/40 bg-[var(--status-warning)]/5"
            )}
          >
            <tile.icon className="size-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground leading-none mb-0.5">{tile.label}</p>
              <p className="text-sm font-semibold tabular-nums leading-tight">{tile.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GpuDetailInfo({ gpu, detailData, className, embedded }: GpuDetailInfoProps) {
  if (embedded) {
    return <DetailContent gpu={gpu} detailData={detailData} />;
  }

  return (
    <Card className={cn("border-border/40", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <CardTitle className="text-sm">{gpu.name}</CardTitle>
          <Badge variant="secondary" className="text-[10px] font-medium">
            {gpu.model}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <DetailContent gpu={gpu} detailData={detailData} />
      </CardContent>
    </Card>
  );
}
