"use client";

import { GpuCard } from "@/components/gpu/GpuCard";
import type { Gpu } from "@/types";

interface GpuCardGridProps {
  gpus: Gpu[];
  onGpuClick?: (gpuId: number) => void;
  selectedGpus?: number[];
  onGpuSelectToggle?: (gpuId: number, checked: boolean) => void;
}

export function GpuCardGrid({
  gpus,
  onGpuClick,
  selectedGpus = [],
  onGpuSelectToggle,
}: GpuCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {gpus.map((gpu) => (
        <GpuCard
          key={gpu.id}
          gpu={gpu}
          onClick={onGpuClick ? () => onGpuClick(gpu.id) : undefined}
          selected={selectedGpus.includes(gpu.id)}
          onSelectToggle={
            onGpuSelectToggle
              ? (checked) => onGpuSelectToggle(gpu.id, checked)
              : undefined
          }
        />
      ))}
    </div>
  );
}
