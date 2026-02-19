// =============================================================================
// eXemble Ontology Platform - Domain Type Definitions
// =============================================================================
// All domain types for the semiconductor FAB graph DB monitoring platform.
// TypeScript types use camelCase properties; Supabase DB uses snake_case.
// Mapping between the two is handled at the data layer.
// =============================================================================

// ─── RBAC Types ─────────────────────────────────────────────────────────────

export type Role = "super_admin" | "service_app" | "data_analyst" | "auditor";

export type PiiLevel = "highest" | "high" | "medium" | "low" | "none";

// ─── Cluster & Node Types ───────────────────────────────────────────────────

export type NodeType = "zero" | "alpha" | "shard";

export type NodeStatus = "healthy" | "warning" | "error";

export type ClusterStatus = "healthy" | "warning" | "error";

export interface Cluster {
  id: number;
  name: string;
  status: ClusterStatus;
  version: string;
  nodeCount: number;
  replicationFactor: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClusterNode {
  id: number;
  clusterId: number;
  name: string;
  type: NodeType;
  status: NodeStatus;
  host: string;
  port: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

// ─── GPU Types ──────────────────────────────────────────────────────────────

export type GpuStatus = "healthy" | "warning" | "error";

export interface Gpu {
  id: number;
  nodeId: number;
  name: string;
  model: string;
  status: GpuStatus;
  utilization: number;
  memoryUsed: number;
  memoryTotal: number;
  temperature: number;
  powerUsage: number;
  powerLimit: number;
}

// ─── Ontology Types ─────────────────────────────────────────────────────────

export interface OntologyRelation {
  name: string;
  target: string;
  direction: "outbound" | "inbound";
}

export interface OntologyType {
  id: number;
  name: string;
  description: string;
  nodeCount: number;
  predicates: string[];
  relations: OntologyRelation[];
}

// ─── Query Types ────────────────────────────────────────────────────────────

export type QueryType = "graphql" | "dql";

export type QueryStatus = "pending" | "completed" | "error";

export interface Query {
  id: number;
  userId: number;
  queryText: string;
  queryType: QueryType;
  status: QueryStatus;
  executionTime: number | null;
  resultCount: number | null;
  createdAt: string;
}

// ─── Alert Types ────────────────────────────────────────────────────────────

export type AlertSeverity = "error" | "warning" | "info";

export interface Alert {
  id: number;
  clusterId: number;
  nodeId: number | null;
  severity: AlertSeverity;
  title: string;
  message: string;
  resolved: boolean;
  resolvedAt: string | null;
}

// ─── User Types ─────────────────────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  lastLogin: string | null;
  createdAt: string;
}

// ─── Metric Types ───────────────────────────────────────────────────────────

export interface Metric {
  id: number;
  clusterId?: number;
  nodeId?: number;
  gpuId?: number;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
}

// ─── PII Types ──────────────────────────────────────────────────────────────

export interface PiiFieldConfig {
  field: string;
  level: PiiLevel;
  maskFn: Record<Role, (value: string) => string>;
}

// ─── Chart Data Types ───────────────────────────────────────────────────────

export interface TimeSeriesPoint {
  time: Date;
  value: number;
}

export interface GaugeData {
  label: string;
  value: number;
  max: number;
  color: string;
}
