// =============================================================================
// eXemble Ontology Platform - Studio Page Data
// =============================================================================
// 6 ontology types with predicates, relations, and distribution data.
// =============================================================================

import type { OntologyType, OntologyRelation } from "@/types";

// ── Jitter Utility ──────────────────────────────────────────────────────────

function addJitter(value: number, percent: number = 5): number {
  const range = value * (percent / 100);
  return value + (Math.random() - 0.5) * 2 * range;
}

// ── Ontology Type Seed Data ─────────────────────────────────────────────────

interface OntologyTypeSeed {
  id: number;
  name: string;
  description: string;
  nodeCount: number;
  predicates: string[];
  relations: OntologyRelation[];
}

const typeSeedsData: OntologyTypeSeed[] = [
  {
    id: 1,
    name: "Equipment",
    description: "Semiconductor manufacturing equipment",
    nodeCount: 832,
    predicates: ["equipment_id", "name", "type", "manufacturer", "location", "status", "install_date"],
    relations: [
      { name: "runs", target: "Process", direction: "outbound" },
      { name: "located_at", target: "Equipment", direction: "outbound" },
      { name: "triggers", target: "Alert", direction: "outbound" },
    ],
  },
  {
    id: 2,
    name: "Process",
    description: "Manufacturing process steps",
    nodeCount: 24500,
    predicates: ["process_id", "name", "step_number", "duration", "temperature", "pressure"],
    relations: [
      { name: "produces", target: "Wafer", direction: "outbound" },
      { name: "uses", target: "Recipe", direction: "outbound" },
    ],
  },
  {
    id: 3,
    name: "Wafer",
    description: "Silicon wafer tracking",
    nodeCount: 156000,
    predicates: ["wafer_id", "lot_id", "diameter", "thickness", "grade", "status"],
    relations: [
      { name: "has_defect", target: "Defect", direction: "outbound" },
    ],
  },
  {
    id: 4,
    name: "Recipe",
    description: "Process recipes and parameters",
    nodeCount: 310,
    predicates: ["recipe_id", "name", "version", "parameters", "created_by"],
    relations: [
      { name: "applied_to", target: "Process", direction: "outbound" },
    ],
  },
  {
    id: 5,
    name: "Defect",
    description: "Wafer defect records",
    nodeCount: 48800,
    predicates: ["defect_id", "type", "location_x", "location_y", "size", "severity"],
    relations: [
      { name: "found_by", target: "Equipment", direction: "outbound" },
    ],
  },
  {
    id: 6,
    name: "MaintenanceRecord",
    description: "Equipment maintenance history",
    nodeCount: 3820,
    predicates: ["record_id", "type", "scheduled_date", "completed_date", "technician", "notes"],
    relations: [
      { name: "performed_on", target: "Equipment", direction: "outbound" },
    ],
  },
];

// ── Exported Functions ──────────────────────────────────────────────────────

export function getOntologyTypes(): OntologyType[] {
  return typeSeedsData.map((seed) => ({
    ...seed,
    nodeCount: Math.round(addJitter(seed.nodeCount, 2)),
  }));
}

// ── Type Distribution Chart Data ────────────────────────────────────────────

export interface TypeDistributionItem {
  name: string;
  records: number;
  queries: number;
  color: string;
}

const distributionColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
];

const queryBaseValues: Record<string, number> = {
  Equipment: 1250,
  Process: 8400,
  Wafer: 12300,
  Recipe: 620,
  Defect: 5800,
  MaintenanceRecord: 980,
};

export function getTypeDistribution(): TypeDistributionItem[] {
  return typeSeedsData.map((seed, i) => ({
    name: seed.name,
    records: Math.round(addJitter(seed.nodeCount, 2)),
    queries: Math.round(addJitter(queryBaseValues[seed.name] ?? 500, 5)),
    color: distributionColors[i] ?? "var(--color-chart-1)",
  }));
}

// ── Schema Statistics ────────────────────────────────────────────────────────

export interface SchemaStats {
  totalTypes: number;
  totalRelations: number;
  avgPredicatesPerType: number;
  relationDensity: number;
}

export function getSchemaStats(types?: OntologyType[]): SchemaStats {
  const t = types ?? getOntologyTypes();
  const totalTypes = t.length;
  const totalRelations = t.reduce((sum, type) => sum + type.relations.length, 0);
  const avgPredicatesPerType =
    totalTypes > 0
      ? t.reduce((sum, type) => sum + type.predicates.length, 0) / totalTypes
      : 0;
  const relationDensity = totalTypes > 0 ? totalRelations / totalTypes : 0;

  return { totalTypes, totalRelations, avgPredicatesPerType, relationDensity };
}
