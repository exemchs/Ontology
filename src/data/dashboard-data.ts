// =============================================================================
// eXemble Ontology Platform - Dashboard Page Data
// =============================================================================
// Hardcoded data for the Dashboard page. All functions return fresh data with
// jitter applied on each call to simulate live monitoring.
// =============================================================================

import type { GaugeData, TimeSeriesPoint } from "@/types";

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

export function getDashboardTimeSeries(): DashboardTimeSeries[] {
  return [
    {
      name: "Agent Request Rate",
      color: "var(--color-chart-1)",
      data: generateTimeSeriesData(24, [800, 2500], 5),
    },
    {
      name: "Query QPS",
      color: "var(--color-chart-2)",
      data: generateTimeSeriesData(24, [200, 800], 5),
    },
  ];
}
