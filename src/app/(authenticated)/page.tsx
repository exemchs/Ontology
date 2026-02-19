"use client";

import { MetricCard } from "@/components/charts/dashboard/MetricCard";
import { RecentAlerts } from "@/components/charts/dashboard/RecentAlerts";
import { ResourceGauge } from "@/components/charts/dashboard/ResourceGauge";
import { DualLineChart } from "@/components/charts/dashboard/DualLineChart";
import { NodeScatterPlot } from "@/components/charts/dashboard/NodeScatterPlot";
import { ResourceBarChart } from "@/components/charts/dashboard/ResourceBarChart";
import { OntologyRelationChart } from "@/components/charts/dashboard/OntologyRelationChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getDashboardMetrics,
  getDashboardAlerts,
  getDashboardGauges,
} from "@/data/dashboard-data";

const metrics = getDashboardMetrics();
const alerts = getDashboardAlerts();
const gauges = getDashboardGauges();

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

      {/* Row 2: Resource Gauges */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {gauges.map((gauge) => (
          <Card key={gauge.label}>
            <CardHeader>
              <CardTitle className="text-sm">{gauge.label} Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceGauge data={gauge} className="min-h-[250px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 3: Dual Line Chart + Ontology Relations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Request & Query Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <DualLineChart className="min-h-[300px]" />
          </CardContent>
        </Card>
        <OntologyRelationChart />
      </div>

      {/* Row 4: Node Scatter Plot + Resource Bar Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Node Scatter Plot</CardTitle>
          </CardHeader>
          <CardContent>
            <NodeScatterPlot />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resource Bar Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceBarChart />
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Recent Alerts */}
      <RecentAlerts alerts={alerts} />
    </div>
  );
}
