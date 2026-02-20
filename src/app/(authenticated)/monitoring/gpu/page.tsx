"use client";

import { useMemo } from "react";

import { PageShell } from "@/components/ds/PageShell";
import { SystemResourcePanel } from "@/components/ds/SystemResourcePanel";
import { getSystemResourceGauges, getSystemResourceTrends } from "@/data/system-resource-data";
import { GpuSummaryHeader } from "@/components/gpu/GpuSummaryHeader";
import GpuGrid from "@/components/gpu/GpuGrid";
import { getGpuCards } from "@/data/gpu-data";

export default function GpuPage() {
  const gpus = useMemo(() => getGpuCards(), []);
  const systemGauges = useMemo(() => getSystemResourceGauges(), []);
  const systemTrends = useMemo(() => getSystemResourceTrends(), []);

  return (
    <PageShell
      title="GPU Monitoring"
      description="Real-time GPU performance and health overview"
    >
      <GpuSummaryHeader gpus={gpus} />
      <SystemResourcePanel gauges={systemGauges} trends={systemTrends} />
      <GpuGrid />
    </PageShell>
  );
}
