"use client";

import { GpuCard } from "@/components/gpu/GpuCard";
import type { Gpu } from "@/types";

interface GpuCardGridProps {
  gpus: Gpu[];
}

export function GpuCardGrid({ gpus }: GpuCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {gpus.map((gpu) => (
        <GpuCard key={gpu.id} gpu={gpu} />
      ))}
    </div>
  );
}
