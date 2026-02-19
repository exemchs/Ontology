// =============================================================================
// eXemble Ontology Platform - DGraph Cluster Page Data
// =============================================================================
// Hardcoded data for the DGraph cluster topology visualization.
// Node metrics, links for force simulation, shard distribution, query scatter.
// =============================================================================

import type { ClusterNode, NodeType, NodeStatus } from "@/types";

// ── Jitter Utility ──────────────────────────────────────────────────────────

function addJitter(value: number, percent: number = 5): number {
  const range = value * (percent / 100);
  return value + (Math.random() - 0.5) * 2 * range;
}

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ── Node Seed Data ──────────────────────────────────────────────────────────

interface NodeSeed {
  id: number;
  name: string;
  type: NodeType;
  status: NodeStatus;
  host: string;
  port: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  qps: number;
}

// ── Extended Node Type ────────────────────────────────────────────────────

export interface DgraphNode extends ClusterNode {
  qps: number;
}

const nodeSeeds: NodeSeed[] = [
  { id: 1, name: "sks-zero-01", type: "zero", status: "healthy", host: "10.0.1.1", port: 5080, cpuUsage: 15.2, memoryUsage: 32.1, diskUsage: 28.5, qps: 320 },
  { id: 2, name: "sks-zero-02", type: "zero", status: "healthy", host: "10.0.1.2", port: 5080, cpuUsage: 12.8, memoryUsage: 28.9, diskUsage: 25.3, qps: 280 },
  { id: 3, name: "sks-zero-03", type: "zero", status: "healthy", host: "10.0.1.3", port: 5080, cpuUsage: 18.1, memoryUsage: 35.4, diskUsage: 30.1, qps: 350 },
  { id: 4, name: "sks-alpha-01", type: "alpha", status: "healthy", host: "10.0.2.1", port: 7080, cpuUsage: 45.3, memoryUsage: 62.1, diskUsage: 55.8, qps: 1200 },
  { id: 5, name: "sks-alpha-02", type: "alpha", status: "healthy", host: "10.0.2.2", port: 7080, cpuUsage: 52.1, memoryUsage: 58.4, diskUsage: 48.2, qps: 1450 },
  { id: 6, name: "sks-alpha-03", type: "alpha", status: "warning", host: "10.0.2.3", port: 7080, cpuUsage: 78.9, memoryUsage: 85.2, diskUsage: 72.1, qps: 1800 },
  { id: 7, name: "sks-alpha-04", type: "alpha", status: "healthy", host: "10.0.2.4", port: 7080, cpuUsage: 38.7, memoryUsage: 54.3, diskUsage: 42.6, qps: 980 },
  { id: 8, name: "sks-alpha-05", type: "alpha", status: "healthy", host: "10.0.2.5", port: 7080, cpuUsage: 41.2, memoryUsage: 49.8, diskUsage: 38.9, qps: 1100 },
  { id: 9, name: "sks-alpha-06", type: "alpha", status: "healthy", host: "10.0.2.6", port: 7080, cpuUsage: 35.6, memoryUsage: 52.7, diskUsage: 45.3, qps: 850 },
  { id: 10, name: "sks-compute-01", type: "alpha", status: "healthy", host: "10.0.3.1", port: 7080, cpuUsage: 65.4, memoryUsage: 71.2, diskUsage: 58.4, qps: 2200 },
  { id: 11, name: "sks-compute-02", type: "alpha", status: "healthy", host: "10.0.3.2", port: 7080, cpuUsage: 58.9, memoryUsage: 68.5, diskUsage: 52.1, qps: 1950 },
  { id: 12, name: "sks-compute-03", type: "alpha", status: "error", host: "10.0.3.3", port: 7080, cpuUsage: 92.1, memoryUsage: 94.8, diskUsage: 88.5, qps: 50 },
];

// ── Exported Functions ──────────────────────────────────────────────────────

export function getDgraphNodes(): DgraphNode[] {
  return nodeSeeds.map((seed) => ({
    id: seed.id,
    clusterId: 1,
    name: seed.name,
    type: seed.type,
    status: seed.status,
    host: seed.host,
    port: seed.port,
    cpuUsage: round(addJitter(seed.cpuUsage, 3), 1),
    memoryUsage: round(addJitter(seed.memoryUsage, 3), 1),
    diskUsage: round(addJitter(seed.diskUsage, 3), 1),
    qps: Math.round(addJitter(seed.qps, 8)),
  }));
}

// ── Links for Force Simulation ──────────────────────────────────────────────

export interface DgraphLink {
  source: number;
  target: number;
  type: "zero-alpha" | "alpha-alpha" | "zero-zero";
}

export function getDgraphLinks(): DgraphLink[] {
  return [
    // Zero → Alpha connections (each zero manages some alphas)
    { source: 1, target: 4, type: "zero-alpha" },
    { source: 1, target: 5, type: "zero-alpha" },
    { source: 1, target: 6, type: "zero-alpha" },
    { source: 2, target: 7, type: "zero-alpha" },
    { source: 2, target: 8, type: "zero-alpha" },
    { source: 2, target: 9, type: "zero-alpha" },
    { source: 3, target: 10, type: "zero-alpha" },
    { source: 3, target: 11, type: "zero-alpha" },
    { source: 3, target: 12, type: "zero-alpha" },
    // Zero ↔ Zero (raft consensus)
    { source: 1, target: 2, type: "zero-zero" },
    { source: 2, target: 3, type: "zero-zero" },
    { source: 1, target: 3, type: "zero-zero" },
    // Alpha ↔ Alpha (data replication within groups)
    { source: 4, target: 5, type: "alpha-alpha" },
    { source: 5, target: 6, type: "alpha-alpha" },
    { source: 7, target: 8, type: "alpha-alpha" },
    { source: 8, target: 9, type: "alpha-alpha" },
    { source: 10, target: 11, type: "alpha-alpha" },
    { source: 11, target: 12, type: "alpha-alpha" },
  ];
}

// ── Shard Bar Chart Data ────────────────────────────────────────────────────

export interface DgraphShard {
  group: string;
  shards: { name: string; size: number }[];
}

export function getDgraphShards(): DgraphShard[] {
  return [
    {
      group: "Group 1",
      shards: [
        { name: "Equipment", size: Math.round(addJitter(832, 3)) },
        { name: "Process", size: Math.round(addJitter(24500, 3)) },
        { name: "Recipe", size: Math.round(addJitter(310, 3)) },
        { name: "Defect", size: Math.round(addJitter(8200, 3)) },
      ],
    },
    {
      group: "Group 2",
      shards: [
        { name: "Wafer", size: Math.round(addJitter(52000, 3)) },
        { name: "Process", size: Math.round(addJitter(24500, 3)) },
        { name: "Defect", size: Math.round(addJitter(24400, 3)) },
        { name: "Maintenance", size: Math.round(addJitter(1910, 3)) },
        { name: "Recipe", size: Math.round(addJitter(155, 3)) },
      ],
    },
    {
      group: "Group 3",
      shards: [
        { name: "Wafer", size: Math.round(addJitter(104000, 3)) },
        { name: "Defect", size: Math.round(addJitter(16200, 3)) },
        { name: "Maintenance", size: Math.round(addJitter(1910, 3)) },
        { name: "Equipment", size: Math.round(addJitter(416, 3)) },
      ],
    },
  ];
}

// ── Query Scatter Plot Data ─────────────────────────────────────────────────

export interface DgraphQueryPoint {
  id: string;
  latency: number; // ms
  throughput: number; // queries/sec
  type: "graphql" | "dql";
}

export function getDgraphQueries(): DgraphQueryPoint[] {
  return Array.from({ length: 50 }, (_, i) => {
    const isGraphql = Math.random() > 0.4;
    const baseLatency = isGraphql ? 45 : 120;
    const baseThroughput = isGraphql ? 350 : 180;

    return {
      id: `q-${String(i + 1).padStart(3, "0")}`,
      latency: round(addJitter(baseLatency, 40), 1),
      throughput: round(addJitter(baseThroughput, 35), 0),
      type: isGraphql ? "graphql" : "dql",
    };
  });
}

// ── Event Log Data ────────────────────────────────────────────────────────

export interface DgraphEvent {
  id: string;
  nodeId: number;
  nodeName: string;
  severity: "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
}

export function getDgraphEvents(): DgraphEvent[] {
  const now = Date.now();

  const events: DgraphEvent[] = [
    {
      id: "evt-001",
      nodeId: 12,
      nodeName: "sks-compute-03",
      severity: "error",
      title: "Memory threshold exceeded",
      message: "sks-compute-03 memory usage exceeded 90% threshold (94.8%)",
      timestamp: new Date(now - 3 * 60 * 1000).toISOString(),
    },
    {
      id: "evt-002",
      nodeId: 12,
      nodeName: "sks-compute-03",
      severity: "error",
      title: "Node unresponsive",
      message: "sks-compute-03 failed to respond to health check within 5s timeout",
      timestamp: new Date(now - 8 * 60 * 1000).toISOString(),
    },
    {
      id: "evt-003",
      nodeId: 6,
      nodeName: "sks-alpha-03",
      severity: "warning",
      title: "High CPU utilization",
      message: "sks-alpha-03 high CPU utilization detected (78.9%)",
      timestamp: new Date(now - 12 * 60 * 1000).toISOString(),
    },
    {
      id: "evt-004",
      nodeId: 9,
      nodeName: "sks-alpha-06",
      severity: "warning",
      title: "Slow query detected",
      message: "Slow query detected: 450ms on sks-alpha-06 (threshold: 200ms)",
      timestamp: new Date(now - 18 * 60 * 1000).toISOString(),
    },
    {
      id: "evt-005",
      nodeId: 1,
      nodeName: "sks-zero-01",
      severity: "info",
      title: "Raft consensus completed",
      message: "Raft consensus completed for Group 1 - leader election stable",
      timestamp: new Date(now - 25 * 60 * 1000).toISOString(),
    },
    {
      id: "evt-006",
      nodeId: 4,
      nodeName: "sks-alpha-01",
      severity: "info",
      title: "Schema update applied",
      message: "Schema update applied successfully - 3 predicates added to Equipment type",
      timestamp: new Date(now - 35 * 60 * 1000).toISOString(),
    },
    {
      id: "evt-007",
      nodeId: 6,
      nodeName: "sks-alpha-03",
      severity: "warning",
      title: "Disk I/O latency spike",
      message: "sks-alpha-03 disk write latency exceeded 50ms (avg: 12ms)",
      timestamp: new Date(now - 42 * 60 * 1000).toISOString(),
    },
    {
      id: "evt-008",
      nodeId: 2,
      nodeName: "sks-zero-02",
      severity: "info",
      title: "Shard rebalance completed",
      message: "Shard rebalance for Group 2 completed - 3 predicates moved",
      timestamp: new Date(now - 55 * 60 * 1000).toISOString(),
    },
    {
      id: "evt-009",
      nodeId: 10,
      nodeName: "sks-compute-01",
      severity: "info",
      title: "Backup snapshot created",
      message: "Incremental backup snapshot created successfully (2.4 GB)",
      timestamp: new Date(now - 78 * 60 * 1000).toISOString(),
    },
    {
      id: "evt-010",
      nodeId: 3,
      nodeName: "sks-zero-03",
      severity: "info",
      title: "Cluster membership updated",
      message: "Cluster membership table refreshed - 12 nodes active, 0 removed",
      timestamp: new Date(now - 95 * 60 * 1000).toISOString(),
    },
  ];

  // Already sorted by timestamp descending (newest first)
  return events;
}

// ── Latency Histogram Data ──────────────────────────────────────────────────

export function getDgraphLatencyData(): number[] {
  return Array.from({ length: 200 }, () => {
    const r = Math.random();
    // Realistic distribution: most 10-100ms, some 100-500ms outliers
    if (r < 0.65) return round(10 + Math.random() * 60, 1);
    if (r < 0.85) return round(60 + Math.random() * 80, 1);
    if (r < 0.95) return round(140 + Math.random() * 160, 1);
    return round(300 + Math.random() * 200, 1);
  });
}

// ── Query Heatmap Data ──────────────────────────────────────────────────────

export interface DgraphHeatmapCell {
  hour: number;
  queryType: string;
  count: number;
}

export function getDgraphHeatmapData(): DgraphHeatmapCell[] {
  const queryTypes = ["mutation", "query", "schema", "backup", "health"];
  const cells: DgraphHeatmapCell[] = [];

  for (let hour = 0; hour < 24; hour++) {
    for (const qt of queryTypes) {
      // Higher counts during business hours (9-18)
      const isBusinessHour = hour >= 9 && hour <= 18;
      let base: number;
      switch (qt) {
        case "query":
          base = isBusinessHour ? 180 : 40;
          break;
        case "mutation":
          base = isBusinessHour ? 120 : 20;
          break;
        case "schema":
          base = isBusinessHour ? 15 : 2;
          break;
        case "backup":
          base = hour === 2 || hour === 14 ? 50 : 3;
          break;
        case "health":
          base = 30; // constant health checks
          break;
        default:
          base = 10;
      }
      cells.push({
        hour,
        queryType: qt,
        count: Math.round(addJitter(base, 25)),
      });
    }
  }

  return cells;
}

// ── Error Log Data ──────────────────────────────────────────────────────────

export interface DgraphErrorLogEntry {
  timestamp: Date;
  severity: "error" | "warning" | "info";
  message: string;
  alpha: string;
}

export function getDgraphErrorLog(): DgraphErrorLogEntry[] {
  const now = Date.now();
  return [
    { timestamp: new Date(now - 2 * 60 * 1000), severity: "error", message: "Raft proposal timeout on Alpha-2", alpha: "sks-alpha-02" },
    { timestamp: new Date(now - 5 * 60 * 1000), severity: "error", message: "Out of memory: tablet eviction triggered", alpha: "sks-compute-03" },
    { timestamp: new Date(now - 8 * 60 * 1000), severity: "warning", message: "Schema update conflict detected", alpha: "sks-alpha-03" },
    { timestamp: new Date(now - 12 * 60 * 1000), severity: "warning", message: "Memory pressure warning (85% utilization)", alpha: "sks-alpha-03" },
    { timestamp: new Date(now - 18 * 60 * 1000), severity: "info", message: "Snapshot streaming completed successfully", alpha: "sks-alpha-01" },
    { timestamp: new Date(now - 25 * 60 * 1000), severity: "warning", message: "Slow mutation detected: 380ms (threshold: 200ms)", alpha: "sks-alpha-06" },
    { timestamp: new Date(now - 32 * 60 * 1000), severity: "error", message: "Connection refused: peer sks-compute-03 unreachable", alpha: "sks-alpha-05" },
    { timestamp: new Date(now - 40 * 60 * 1000), severity: "info", message: "Predicate move completed: Equipment -> Group 2", alpha: "sks-alpha-04" },
    { timestamp: new Date(now - 48 * 60 * 1000), severity: "warning", message: "Disk write latency spike: 65ms (avg: 12ms)", alpha: "sks-alpha-03" },
    { timestamp: new Date(now - 55 * 60 * 1000), severity: "info", message: "Leader election completed for Group 1", alpha: "sks-zero-01" },
    { timestamp: new Date(now - 68 * 60 * 1000), severity: "info", message: "Incremental backup completed (2.1 GB)", alpha: "sks-compute-01" },
    { timestamp: new Date(now - 75 * 60 * 1000), severity: "warning", message: "High pending proposal count: 24", alpha: "sks-alpha-02" },
    { timestamp: new Date(now - 90 * 60 * 1000), severity: "info", message: "Tablet size threshold reached, splitting shard", alpha: "sks-alpha-01" },
    { timestamp: new Date(now - 110 * 60 * 1000), severity: "error", message: "TLS handshake failed with peer sks-zero-03", alpha: "sks-zero-02" },
    { timestamp: new Date(now - 130 * 60 * 1000), severity: "info", message: "Cluster membership refreshed: 12 active nodes", alpha: "sks-zero-01" },
  ];
}

// ── Alpha Comparison Data ───────────────────────────────────────────────────

export interface DgraphAlphaMetrics {
  alpha: string;
  cpu: number;
  memory: number;
  disk: number;
  qps: number;
}

export function getDgraphAlphaComparison(): DgraphAlphaMetrics[] {
  return [
    { alpha: "Alpha-1", cpu: round(addJitter(45, 8), 1), memory: round(addJitter(62, 5), 1), disk: round(addJitter(55, 4), 1), qps: Math.round(addJitter(1200, 10)) },
    { alpha: "Alpha-2", cpu: round(addJitter(52, 8), 1), memory: round(addJitter(58, 5), 1), disk: round(addJitter(48, 4), 1), qps: Math.round(addJitter(1450, 10)) },
    { alpha: "Alpha-3", cpu: round(addJitter(79, 8), 1), memory: round(addJitter(85, 5), 1), disk: round(addJitter(72, 4), 1), qps: Math.round(addJitter(1800, 10)) },
  ];
}
