// =============================================================================
// eXemble Ontology Platform - Dashboard Layout Persistence
// =============================================================================
// Manages the draggable grid layout for the NOC-style dashboard.
// Uses localStorage for persistence (not Supabase) since POC has no real
// authenticated users. If real auth is added, migrate to Supabase user prefs.
// =============================================================================

import type { Layout } from "react-grid-layout";

// ── Storage Key ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "exemble-dashboard-layout-v1";

// ── Widget Config Types ─────────────────────────────────────────────────────

export type WidgetType =
  | "signal"
  | "sparkline"
  | "threshold"
  | "metric"
  | "trend"
  | "gpu-summary"
  | "daily-summary";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  props: Record<string, unknown>;
}

// ── Default Layout (4-column grid, rowHeight=80) ────────────────────────────

export const DEFAULT_DASHBOARD_LAYOUT: Layout[] = [
  // Row 0: Signal + Sparkline widgets
  { i: "signal-dgraph-target", x: 0, y: 0, w: 1, h: 2 },
  { i: "signal-alpha-alive", x: 1, y: 0, w: 1, h: 2 },
  { i: "sparkline-qps", x: 2, y: 0, w: 1, h: 3 },
  { i: "sparkline-tps", x: 3, y: 0, w: 1, h: 3 },
  // Row 1: Metric cards
  { i: "metric-pending", x: 0, y: 2, w: 1, h: 2 },
  { i: "metric-raft", x: 1, y: 2, w: 1, h: 2 },
  { i: "metric-errors", x: 2, y: 3, w: 1, h: 2 },
  { i: "metric-cache", x: 3, y: 3, w: 1, h: 2 },
  // Row 2: Threshold chart (wide)
  { i: "threshold-p95", x: 0, y: 5, w: 2, h: 4 },
  // Row 3: Trend charts
  { i: "trend-disk", x: 2, y: 5, w: 2, h: 4 },
  { i: "trend-memory", x: 0, y: 9, w: 2, h: 4 },
  // Row 4: Summary widgets
  { i: "gpu-summary", x: 2, y: 9, w: 2, h: 2 },
  { i: "daily-summary", x: 2, y: 11, w: 2, h: 2 },
];

// ── Widget Registry ─────────────────────────────────────────────────────────

export const WIDGET_REGISTRY: WidgetConfig[] = [
  {
    id: "signal-dgraph-target",
    type: "signal",
    title: "DGraph Targets",
    props: { field: "dgraphTarget" },
  },
  {
    id: "signal-alpha-alive",
    type: "signal",
    title: "Alpha Alive",
    props: { field: "alphaAlive" },
  },
  {
    id: "sparkline-qps",
    type: "sparkline",
    title: "Queries/sec",
    props: { field: "qps" },
  },
  {
    id: "sparkline-tps",
    type: "sparkline",
    title: "Transactions/sec",
    props: { field: "tps" },
  },
  {
    id: "metric-pending",
    type: "metric",
    title: "Pending Queries",
    props: { field: "pending" },
  },
  {
    id: "metric-raft",
    type: "metric",
    title: "Raft Leader Changes",
    props: { field: "raft" },
  },
  {
    id: "metric-errors",
    type: "metric",
    title: "Errors/sec",
    props: { field: "errors" },
  },
  {
    id: "metric-cache",
    type: "metric",
    title: "Cache Hit Rate",
    props: { field: "cache" },
  },
  {
    id: "threshold-p95",
    type: "threshold",
    title: "Query p95 Latency",
    props: {},
  },
  {
    id: "trend-disk",
    type: "trend",
    title: "Disk Usage Trend",
    props: { field: "disk" },
  },
  {
    id: "trend-memory",
    type: "trend",
    title: "Alpha Memory Usage",
    props: { field: "memory" },
  },
  {
    id: "gpu-summary",
    type: "gpu-summary",
    title: "GPU Overview",
    props: {},
  },
  {
    id: "daily-summary",
    type: "daily-summary",
    title: "Daily Summary",
    props: {},
  },
];

// ── Layout Persistence Helpers ──────────────────────────────────────────────

/**
 * Save layout to localStorage.
 * Fails silently if storage is unavailable (SSR, private browsing).
 */
export function saveLayout(layout: Layout[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch {
    // Storage unavailable — ignore
  }
}

/**
 * Load layout from localStorage.
 * Merges missing widgets from defaults to handle registry changes.
 */
export function loadLayout(defaults: Layout[]): Layout[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaults;

    const parsed: Layout[] = JSON.parse(stored);
    const storedIds = new Set(parsed.map((item) => item.i));

    // Add any new widgets not in the stored layout
    const missing = defaults.filter((d) => !storedIds.has(d.i));
    return [...parsed, ...missing];
  } catch {
    return defaults;
  }
}

/**
 * Reset layout — clear localStorage and return defaults.
 */
export function resetLayout(defaults: Layout[]): Layout[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
  return defaults;
}
