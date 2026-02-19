"use client";

import DashboardGrid from "@/components/dashboard/DashboardGrid";

export default function DashboardPage() {
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
      <DashboardGrid />
    </div>
  );
}
