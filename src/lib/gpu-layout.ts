// =============================================================================
// eXemble Ontology Platform - GPU Monitoring Layout Persistence
// =============================================================================
// Manages the draggable grid layout for the GPU Monitoring dashboard.
// Uses localStorage for persistence (same pattern as dashboard-layout.ts).
// =============================================================================

import type { Layout } from "react-grid-layout";

// ── Storage Key ─────────────────────────────────────────────────────────────

const GPU_STORAGE_KEY = "exemble-gpu-layout-v1";

// ── Widget Config Types ─────────────────────────────────────────────────────

export type GpuWidgetType =
  | "heatmap"
  | "pipeline"
  | "health-issues"
  | "performance-trend"
  | "gpu-list-detail";

export interface GpuWidgetConfig {
  id: string;
  type: GpuWidgetType;
  title: string;
}

// ── Default Layout (6-column grid, rowHeight=80) ────────────────────────────

export const DEFAULT_GPU_LAYOUT: Layout[] = [
  // Row 0-3: Heatmap + Pipeline + Health Issues
  { i: "heatmap", x: 0, y: 0, w: 3, h: 4 },
  { i: "pipeline", x: 3, y: 0, w: 1, h: 4 },
  { i: "health-issues", x: 4, y: 0, w: 2, h: 4 },
  // Row 4-7: Performance Trend + GPU List & Detail
  { i: "performance-trend", x: 0, y: 4, w: 2, h: 4 },
  { i: "gpu-list-detail", x: 2, y: 4, w: 4, h: 4 },
];

// ── Widget Registry ─────────────────────────────────────────────────────────

export const GPU_WIDGET_REGISTRY: GpuWidgetConfig[] = [
  {
    id: "heatmap",
    type: "heatmap",
    title: "Utilization Distribution",
  },
  {
    id: "pipeline",
    type: "pipeline",
    title: "GPU Pipeline",
  },
  {
    id: "health-issues",
    type: "health-issues",
    title: "Health Issues",
  },
  {
    id: "performance-trend",
    type: "performance-trend",
    title: "Performance Trends",
  },
  {
    id: "gpu-list-detail",
    type: "gpu-list-detail",
    title: "GPU List",
  },
];

// ── Layout Persistence Helpers ──────────────────────────────────────────────

export function saveGpuLayout(layout: Layout[]): void {
  try {
    localStorage.setItem(GPU_STORAGE_KEY, JSON.stringify(layout));
  } catch {
    // Storage unavailable — ignore
  }
}

export function loadGpuLayout(defaults: Layout[]): Layout[] {
  try {
    const stored = localStorage.getItem(GPU_STORAGE_KEY);
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

export function resetGpuLayout(defaults: Layout[]): Layout[] {
  try {
    localStorage.removeItem(GPU_STORAGE_KEY);
  } catch {
    // Ignore
  }
  return defaults;
}
