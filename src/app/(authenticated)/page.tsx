"use client";

import { ChartSkeleton } from "@/components/charts/shared/ChartSkeleton";
import { MetricCard } from "@/components/charts/dashboard/MetricCard";
import { RecentAlerts } from "@/components/charts/dashboard/RecentAlerts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getDashboardMetrics,
  getDashboardAlerts,
} from "@/data/dashboard-data";

const metrics = getDashboardMetrics();
const alerts = getDashboardAlerts();

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold">Ontology Dashboard</h1>

      {/* Row 1: Metric Cards */}
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            unit={metric.unit}
            change={metric.change}
            changeLabel={metric.changeLabel}
          />
        ))}
      </div>

      {/* Row 2: Resource Gauges (3 placeholders) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {["CPU Gauge", "Memory Gauge", "Disk Gauge"].map((label) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-sm">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartSkeleton className="min-h-[300px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 3: Dual Line Chart + Ontology Relations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Dual Line Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartSkeleton className="min-h-[300px]" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ontology Relations</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartSkeleton className="min-h-[300px]" />
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Node Scatter Plot + Resource Bar Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Node Scatter Plot</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartSkeleton className="min-h-[300px]" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resource Bar Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartSkeleton className="min-h-[300px]" />
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Recent Alerts */}
      <RecentAlerts alerts={alerts} />
    </div>
  );
}
