"use client";

import { useState, useMemo } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

import { PageShell } from "@/components/ds/PageShell";
import { DualLineChart } from "@/components/charts/dashboard/DualLineChart";
import { NodeScatterPlot } from "@/components/charts/dashboard/NodeScatterPlot";
import { ResourceBarChart } from "@/components/charts/dashboard/ResourceBarChart";
import { OntologyRelationChart } from "@/components/charts/dashboard/OntologyRelationChart";
import { ResourceGauge } from "@/components/charts/dashboard/ResourceGauge";
import { RecentAlerts } from "@/components/charts/dashboard/RecentAlerts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  getDashboardMetrics,
  getDashboardAlerts,
  getDashboardGauges,
} from "@/data/dashboard-data";

type Interval = "hourly" | "daily";
type BarLayout = "stacked" | "grouped";
type RelationView = "chord" | "force" | "sankey";

export default function DashboardPage() {
  const [interval, setInterval] = useState<Interval>("hourly");
  const [barLayout, setBarLayout] = useState<BarLayout>("stacked");
  const [relationView, setRelationView] = useState<RelationView>("force");

  const metrics = useMemo(() => getDashboardMetrics(), []);
  const alerts = useMemo(() => getDashboardAlerts(), []);
  const gauges = useMemo(() => getDashboardGauges(), []);

  return (
    <PageShell title="Dashboard" description="System monitoring overview">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <Card key={m.label} className="border-border/40 p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {m.label}
            </p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-semibold tabular-nums">
                {m.value.toLocaleString()}
              </span>
              {m.unit && (
                <span className="text-xs text-muted-foreground">{m.unit}</span>
              )}
            </div>
            {m.change !== undefined && m.change !== 0 && (
              <div className="flex items-center gap-1 mt-1">
                {m.change >= 0 ? (
                  <ArrowUpRight className="size-3.5 text-[var(--status-healthy)]" />
                ) : (
                  <ArrowDownRight className="size-3.5 text-[var(--status-critical)]" />
                )}
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    m.change >= 0
                      ? "text-[var(--status-healthy)]"
                      : "text-[var(--status-critical)]"
                  )}
                >
                  {m.change >= 0 ? "+" : ""}
                  {m.change.toFixed(1)}%
                </span>
                {m.changeLabel && (
                  <span className="text-xs text-muted-foreground">
                    {m.changeLabel}
                  </span>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {gauges.map((gauge) => (
          <Card key={gauge.label} className="border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{gauge.label} Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceGauge data={gauge} className="aspect-square max-h-[200px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Dual Line Chart */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm">Request & Query Rates</CardTitle>
              <Tabs value={interval} onValueChange={(v) => setInterval(v as Interval)}>
                <TabsList className="h-7">
                  <TabsTrigger value="hourly" className="text-xs px-2">
                    Hourly
                  </TabsTrigger>
                  <TabsTrigger value="daily" className="text-xs px-2">
                    Daily
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <DualLineChart interval={interval} className="aspect-[16/9]" />
          </CardContent>
        </Card>

        {/* Ontology Relations */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm">Ontology Relations</CardTitle>
              <Tabs
                value={relationView}
                onValueChange={(v) => setRelationView(v as RelationView)}
              >
                <TabsList className="h-7">
                  <TabsTrigger value="chord" className="text-xs px-2">
                    Chord
                  </TabsTrigger>
                  <TabsTrigger value="force" className="text-xs px-2">
                    Force
                  </TabsTrigger>
                  <TabsTrigger value="sankey" className="text-xs px-2">
                    Sankey
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <OntologyRelationChart viewType={relationView} />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Node Scatter Plot */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Node Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <NodeScatterPlot />
          </CardContent>
        </Card>

        {/* Resource Bar Chart */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm">Resource Usage</CardTitle>
              <Tabs
                value={barLayout}
                onValueChange={(v) => setBarLayout(v as BarLayout)}
              >
                <TabsList className="h-7">
                  <TabsTrigger value="stacked" className="text-xs px-2">
                    Stacked
                  </TabsTrigger>
                  <TabsTrigger value="grouped" className="text-xs px-2">
                    Grouped
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ResourceBarChart layout={barLayout} className="aspect-[16/9]" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <RecentAlerts alerts={alerts} />
    </PageShell>
  );
}
