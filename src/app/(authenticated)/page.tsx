"use client";

import { useMemo } from "react";
import DashboardGrid from "@/components/dashboard/DashboardGrid";
import { SystemResourcePanel } from "@/components/ds/SystemResourcePanel";
import { PageShell } from "@/components/ds/PageShell";
import { getSystemResourceGauges, getSystemResourceTrends } from "@/data/system-resource-data";

export default function DashboardPage() {
  const systemGauges = useMemo(() => getSystemResourceGauges(), []);
  const systemTrends = useMemo(() => getSystemResourceTrends(), []);

  return (
    <PageShell
      title="Dashboard"
      description="Dgraph cluster overview — drag widgets to customize layout"
    >
      <SystemResourcePanel
        gauges={systemGauges}
        trends={systemTrends}
        storageKey="dashboard-resource-panel"
      />
      <DashboardGrid />
    </PageShell>
  );
}
