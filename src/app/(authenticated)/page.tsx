"use client";

import { useMemo } from "react";
import DashboardGrid from "@/components/dashboard/DashboardGrid";
import { SystemResourcePanel } from "@/components/ds/SystemResourcePanel";
import { getSystemResourceGauges, getSystemResourceTrends } from "@/data/system-resource-data";

export default function DashboardPage() {
  const systemGauges = useMemo(() => getSystemResourceGauges(), []);
  const systemTrends = useMemo(() => getSystemResourceTrends(), []);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Dgraph cluster overview — drag widgets to customize layout
          </p>
        </div>
      </div>
      <SystemResourcePanel
        gauges={systemGauges}
        trends={systemTrends}
        storageKey="dashboard-resource-panel"
      />
      <DashboardGrid />
    </div>
  );
}
