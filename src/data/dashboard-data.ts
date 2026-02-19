// =============================================================================
// eXemble Ontology Platform - Dashboard Page Data
// =============================================================================
// Hardcoded data for the Dashboard page. All functions return fresh data with
// jitter applied on each call to simulate live monitoring.
// =============================================================================

import type {
  Alert,
  GaugeData,
  NodeStatus,
  ResourceBarData,
  ScatterPoint,
  TimeSeriesPoint,
} from "@/types";

// ── Jitter Utility ──────────────────────────────────────────────────────────

/** Add random jitter to a value within percentage bounds */
function addJitter(value: number, percent: number = 5): number {
  const range = value * (percent / 100);
  return value + (Math.random() - 0.5) * 2 * range;
}

/** Round to specified decimal places */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ── Dashboard Metrics ───────────────────────────────────────────────────────

export interface DashboardMetric {
  label: string;
  value: number;
  unit: string;
  change: number;
  changeLabel: string;
}

export function getDashboardMetrics(): DashboardMetric[] {
  return [
    {
      label: "Total Nodes",
      value: 12, // No jitter - integer count
      unit: "",
      change: 0,
      changeLabel: "stable",
    },
    {
      label: "Total Relations",
      value: Math.round(addJitter(233452, 3)),
      unit: "",
      change: round(addJitter(2.4, 30), 1),
      changeLabel: "vs last hour",
    },
    {
      label: "Query Rate",
      value: Math.round(addJitter(1847, 5)),
      unit: "/min",
      change: round(addJitter(5.1, 40), 1),
      changeLabel: "vs last hour",
    },
    {
      label: "Uptime",
      value: round(addJitter(99.97, 0.02), 2),
      unit: "%",
      change: 0,
      changeLabel: "30 days",
    },
  ];
}

// ── Dashboard Gauges ────────────────────────────────────────────────────────

export function getDashboardGauges(): GaugeData[] {
  return [
    {
      label: "CPU",
      value: round(addJitter(45.3, 5), 1),
      max: 100,
      color: "var(--color-chart-1)",
    },
    {
      label: "Memory",
      value: round(addJitter(62.1, 5), 1),
      max: 100,
      color: "var(--color-chart-2)",
    },
    {
      label: "Disk",
      value: round(addJitter(55.8, 5), 1),
      max: 100,
      color: "var(--color-chart-3)",
    },
  ];
}

// ── Dashboard Time Series ───────────────────────────────────────────────────

function generateTimeSeriesData(
  points: number,
  range: [number, number],
  intervalMinutes: number = 5
): TimeSeriesPoint[] {
  const now = new Date();
  const [min, max] = range;
  const mid = (min + max) / 2;
  const amplitude = (max - min) / 2;

  return Array.from({ length: points }, (_, i) => {
    const time = new Date(
      now.getTime() - (points - 1 - i) * intervalMinutes * 60 * 1000
    );
    // Sinusoidal base pattern with jitter for natural variation
    const base = mid + amplitude * Math.sin((i / points) * Math.PI * 2) * 0.3;
    const value = round(addJitter(base, 8), 0);
    return { time, value: Math.max(min, Math.min(max, value)) };
  });
}

export interface DashboardTimeSeries {
  name: string;
  color: string;
  data: TimeSeriesPoint[];
}

export function getDashboardTimeSeries(
  interval: "hourly" | "daily" = "hourly"
): DashboardTimeSeries[] {
  const intervalMinutes = interval === "daily" ? 60 : 5;
  return [
    {
      name: "Agent Request Rate",
      color: "var(--color-chart-1)",
      data: generateTimeSeriesData(24, [800, 2500], intervalMinutes),
    },
    {
      name: "Query QPS",
      color: "var(--color-chart-2)",
      data: generateTimeSeriesData(24, [200, 800], intervalMinutes),
    },
  ];
}

// ── Dashboard Scatter Data ──────────────────────────────────────────────────

const scatterNodes: { name: string; latencyBase: number; throughputBase: number }[] = [
  { name: "sks-zero-01", latencyBase: 2.1, throughputBase: 950 },
  { name: "sks-zero-02", latencyBase: 1.8, throughputBase: 1020 },
  { name: "sks-zero-03", latencyBase: 3.5, throughputBase: 870 },
  { name: "sks-alpha-01", latencyBase: 4.2, throughputBase: 780 },
  { name: "sks-alpha-02", latencyBase: 5.8, throughputBase: 620 },
  { name: "sks-alpha-03", latencyBase: 2.9, throughputBase: 1100 },
  { name: "sks-alpha-04", latencyBase: 7.2, throughputBase: 520 },
  { name: "sks-shard-01", latencyBase: 1.5, throughputBase: 1180 },
  { name: "sks-shard-02", latencyBase: 3.1, throughputBase: 910 },
  { name: "sks-shard-03", latencyBase: 6.1, throughputBase: 580 },
  { name: "sks-compute-01", latencyBase: 2.4, throughputBase: 1050 },
  { name: "sks-compute-02", latencyBase: 4.8, throughputBase: 720 },
];

function getStatusFromLatency(latency: number): NodeStatus {
  if (latency > 7) return "error";
  if (latency > 5) return "warning";
  return "healthy";
}

export function getDashboardScatterData(): ScatterPoint[] {
  return scatterNodes.map((node) => {
    const latency = round(addJitter(node.latencyBase, 10), 1);
    const throughput = Math.round(addJitter(node.throughputBase, 5));
    return {
      name: node.name,
      latency,
      throughput,
      status: getStatusFromLatency(latency),
    };
  });
}

// ── Dashboard Resource Bars ─────────────────────────────────────────────────

const resourceNodes: { name: string; cpu: number; memory: number; disk: number }[] = [
  { name: "zero-01", cpu: 42, memory: 58, disk: 45 },
  { name: "zero-02", cpu: 38, memory: 52, disk: 40 },
  { name: "zero-03", cpu: 55, memory: 67, disk: 50 },
  { name: "alpha-01", cpu: 62, memory: 71, disk: 55 },
  { name: "alpha-02", cpu: 78, memory: 75, disk: 62 },
  { name: "alpha-03", cpu: 45, memory: 48, disk: 38 },
  { name: "alpha-04", cpu: 85, memory: 80, disk: 68 },
  { name: "shard-01", cpu: 33, memory: 44, disk: 35 },
  { name: "shard-02", cpu: 50, memory: 60, disk: 48 },
  { name: "shard-03", cpu: 72, memory: 68, disk: 58 },
  { name: "compute-01", cpu: 40, memory: 55, disk: 42 },
  { name: "compute-02", cpu: 58, memory: 63, disk: 52 },
];

export function getDashboardResourceBars(): ResourceBarData[] {
  return resourceNodes.map((node) => ({
    name: node.name,
    cpu: round(addJitter(node.cpu, 5), 1),
    memory: round(addJitter(node.memory, 5), 1),
    disk: round(addJitter(node.disk, 5), 1),
  }));
}

// ── Dashboard Alerts ────────────────────────────────────────────────────────

export function getDashboardAlerts(): Alert[] {
  const now = Date.now();
  return [
    {
      id: 1,
      clusterId: 1,
      nodeId: 7,
      severity: "error",
      title: "High CPU utilization on alpha-04",
      message:
        "CPU usage exceeded 90% threshold for over 5 minutes. Current: 92.3%. Process 'dgraph-alpha' consuming majority of resources. Consider scaling horizontally or optimizing heavy queries.",
      resolved: false,
      resolvedAt: null,
    },
    {
      id: 2,
      clusterId: 1,
      nodeId: 5,
      severity: "error",
      title: "Memory threshold breach on alpha-02",
      message:
        "Memory usage at 87.6% (14.0 GB / 16.0 GB). Approaching OOM kill threshold. Recommend increasing node memory or redistributing shards.",
      resolved: true,
      resolvedAt: new Date(now - 25 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      clusterId: 1,
      nodeId: 10,
      severity: "warning",
      title: "Disk usage warning on shard-03",
      message:
        "Disk utilization at 78% on /data partition. Projected to reach 85% within 48 hours at current growth rate. Schedule cleanup or expand storage.",
      resolved: false,
      resolvedAt: null,
    },
    {
      id: 4,
      clusterId: 1,
      nodeId: 4,
      severity: "warning",
      title: "Replication lag detected on alpha-01",
      message:
        "Replication lag of 3.2 seconds detected between alpha-01 and zero-01. Network latency between nodes is elevated. Monitoring for auto-recovery.",
      resolved: true,
      resolvedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 5,
      clusterId: 1,
      nodeId: null,
      severity: "info",
      title: "Cluster health check completed",
      message:
        "Routine health check completed successfully. All zero nodes responsive. 11/12 nodes within normal parameters. 1 node (alpha-04) flagged for review.",
      resolved: true,
      resolvedAt: new Date(now - 10 * 60 * 1000).toISOString(),
    },
  ];
}

// =============================================================================
// NOC Dashboard Widget Data (Phase 08)
// =============================================================================

// ── Signal Widget Data ────────────────────────────────────────────────────────

export interface DashboardSignalData {
  dgraphTarget: { value: number; status: "healthy" | "warning" | "error" };
  alphaAlive: { value: number; status: "healthy" | "warning" | "error" };
}

export function getDashboardSignalData(): DashboardSignalData {
  return {
    dgraphTarget: { value: 3, status: "healthy" },
    alphaAlive: { value: 4, status: "healthy" },
  };
}

// ── Sparkline Widget Data ─────────────────────────────────────────────────────

export interface SparklineData {
  label: string;
  value: number;
  unit: string;
  data: { time: string; value: number }[];
}

function generateSparklinePoints(
  points: number,
  baseValue: number,
  jitterPercent: number
): { time: string; value: number }[] {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => {
    const time = new Date(now - (points - 1 - i) * 60 * 1000).toISOString();
    const sinWave = Math.sin((i / points) * Math.PI * 3) * baseValue * 0.1;
    const value = Math.round(addJitter(baseValue + sinWave, jitterPercent));
    return { time, value: Math.max(0, value) };
  });
}

export function getDashboardSparklineData(): { qps: SparklineData; tps: SparklineData } {
  return {
    qps: {
      label: "Queries/sec",
      value: Math.round(addJitter(1247, 5)),
      unit: "q/s",
      data: generateSparklinePoints(60, 1247, 8),
    },
    tps: {
      label: "Transactions/sec",
      value: Math.round(addJitter(842, 5)),
      unit: "t/s",
      data: generateSparklinePoints(60, 842, 8),
    },
  };
}

// ── Threshold Widget Data ─────────────────────────────────────────────────────

export interface ThresholdData {
  data: { time: string; value: number }[];
  warningThreshold: number;
  criticalThreshold: number;
}

export function getDashboardThresholdData(): ThresholdData {
  const now = Date.now();
  const points = 60;
  const data = Array.from({ length: points }, (_, i) => {
    const time = new Date(now - (points - 1 - i) * 60 * 1000).toISOString();
    // Base around 120ms with occasional spikes
    const base = 120 + Math.sin((i / points) * Math.PI * 4) * 40;
    const spike = Math.random() > 0.92 ? addJitter(300, 30) : 0;
    const value = round(Math.max(10, addJitter(base + spike, 10)), 1);
    return { time, value };
  });

  return {
    data,
    warningThreshold: 200,
    criticalThreshold: 500,
  };
}

// ── Metric Card Widget Data ─────────────────────────────────────────────────

export interface MetricCardData {
  label: string;
  value: string | number;
  trend: "up" | "down" | "flat";
  trendValue: string;
}

export function getDashboardMetricCards(): {
  pending: MetricCardData;
  raft: MetricCardData;
  errors: MetricCardData;
  cache: MetricCardData;
} {
  return {
    pending: {
      label: "Pending Queries",
      value: Math.round(addJitter(12, 30)),
      trend: "down",
      trendValue: "-3",
    },
    raft: {
      label: "Raft Leader Changes",
      value: Math.round(addJitter(2, 50)),
      trend: "flat",
      trendValue: "0",
    },
    errors: {
      label: "Errors/sec",
      value: round(addJitter(0.8, 40), 1),
      trend: "down",
      trendValue: "-0.2",
    },
    cache: {
      label: "Cache Hit Rate",
      value: `${round(addJitter(94.2, 1), 1)}%`,
      trend: "up",
      trendValue: "+0.5%",
    },
  };
}

// ── Trend Widget Data ─────────────────────────────────────────────────────────

export interface TrendSeriesData {
  name: string;
  data: { time: string; value: number }[];
}

function generateTrendPoints(
  points: number,
  baseValue: number,
  jitterPercent: number,
  trendSlope: number = 0
): { time: string; value: number }[] {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => {
    const time = new Date(now - (points - 1 - i) * 5 * 60 * 1000).toISOString();
    const trend = trendSlope * (i / points);
    const value = round(Math.max(0, addJitter(baseValue + trend, jitterPercent)), 1);
    return { time, value };
  });
}

export function getDashboardTrendData(): {
  disk: TrendSeriesData[];
  memory: TrendSeriesData[];
} {
  return {
    disk: [
      {
        name: "Used",
        data: generateTrendPoints(24, 58, 3, 5),
      },
      {
        name: "Reserved",
        data: generateTrendPoints(24, 72, 2, 2),
      },
    ],
    memory: [
      {
        name: "Alpha RSS",
        data: generateTrendPoints(24, 4200, 5, 300),
      },
      {
        name: "Cache",
        data: generateTrendPoints(24, 2800, 4, 100),
      },
    ],
  };
}

// ── GPU Summary Widget Data ────────────────────────────────────────────────

export interface GpuSummaryData {
  active: number;
  idle: number;
  error: number;
}

export function getDashboardGpuSummary(): GpuSummaryData {
  return {
    active: 6,
    idle: 2,
    error: 1,
  };
}

// ── Daily Summary Widget Data ──────────────────────────────────────────────

export interface DailySummaryData {
  queryCountChange: number;
  errorCount: number;
  errorCountYesterday: number;
}

export function getDashboardDailySummary(): DailySummaryData {
  return {
    queryCountChange: Math.round(addJitter(12, 30)),
    errorCount: Math.round(addJitter(23, 20)),
    errorCountYesterday: 31,
  };
}
