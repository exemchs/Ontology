// =============================================================================
// eXemble Ontology Platform - Ontology Relation Data Transformations
// =============================================================================
// Transforms OntologyType[] into ChordData, ForceData, and SankeyData
// for the 3-view ontology relation chart.
// =============================================================================

import type { OntologyType } from "@/types";

// ── Chord Diagram Data ──────────────────────────────────────────────────────

export interface ChordData {
  matrix: number[][];
  names: string[];
  colors: string[];
}

/**
 * Build a chord diagram adjacency matrix from ontology types.
 * matrix[sourceIdx][targetIdx] = Math.round(sourceType.nodeCount / 100) for each relation.
 * Diagonal = 0.
 */
export function buildChordData(types: OntologyType[]): ChordData {
  const names = types.map((t) => t.name);
  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
  ];

  // Initialize NxN matrix with zeros
  const n = types.length;
  const matrix: number[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => 0)
  );

  // Populate from relations
  types.forEach((type, sourceIdx) => {
    type.relations.forEach((rel) => {
      const targetIdx = names.indexOf(rel.target);
      if (targetIdx !== -1 && targetIdx !== sourceIdx) {
        matrix[sourceIdx][targetIdx] = Math.round(type.nodeCount / 100);
      }
    });
  });

  return { matrix, names, colors };
}

// ── Force Graph Data ────────────────────────────────────────────────────────

export interface ForceNode {
  id: string;
  name: string;
  nodeCount: number;
  color: string;
}

export interface ForceLink {
  source: string;
  target: string;
  label: string;
}

export interface ForceData {
  nodes: ForceNode[];
  links: ForceLink[];
}

/**
 * Build force-directed graph data from ontology types.
 * Nodes from types, links from all relations.
 */
export function buildForceData(types: OntologyType[]): ForceData {
  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
  ];

  const nodes: ForceNode[] = types.map((type, i) => ({
    id: type.name,
    name: type.name,
    nodeCount: type.nodeCount,
    color: colors[i] ?? "var(--chart-1)",
  }));

  const links: ForceLink[] = [];
  types.forEach((type) => {
    type.relations.forEach((rel) => {
      links.push({
        source: type.name,
        target: rel.target,
        label: rel.name,
      });
    });
  });

  return { nodes, links };
}

// ── Sankey Diagram Data ─────────────────────────────────────────────────────

export interface SankeyNodeData {
  name: string;
  color: string;
}

export interface SankeyLinkData {
  source: number;
  target: number;
  value: number;
  label: string;
}

export interface SankeyData {
  nodes: SankeyNodeData[];
  links: SankeyLinkData[];
}

/**
 * Build sankey diagram data from ontology types.
 * Supports direction filtering: "outbound" (direct), "inbound" (reversed), "all" (both).
 * Filters out self-referencing links (source === target).
 */
export function buildSankeyData(
  types: OntologyType[],
  direction: "all" | "inbound" | "outbound"
): SankeyData {
  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
  ];

  const names = types.map((t) => t.name);
  const nodes: SankeyNodeData[] = types.map((type, i) => ({
    name: type.name,
    color: colors[i] ?? "var(--chart-1)",
  }));

  if (direction === "outbound" || direction === "all") {
    // Outbound: direct mapping source->target
    const linkMap = new Map<string, SankeyLinkData>();

    types.forEach((type) => {
      const sourceIdx = names.indexOf(type.name);
      type.relations.forEach((rel) => {
        const targetIdx = names.indexOf(rel.target);
        if (targetIdx === -1 || sourceIdx === targetIdx) return;

        const key = `${sourceIdx}->${targetIdx}`;
        const existing = linkMap.get(key);
        if (existing) {
          existing.value += Math.round(type.nodeCount / 100);
          existing.label += `, ${rel.name}`;
        } else {
          linkMap.set(key, {
            source: sourceIdx,
            target: targetIdx,
            value: Math.round(type.nodeCount / 100),
            label: rel.name,
          });
        }
      });
    });

    if (direction === "outbound") {
      return { nodes, links: Array.from(linkMap.values()) };
    }

    // For "all": also add inbound
    types.forEach((type) => {
      const sourceIdx = names.indexOf(type.name);
      type.relations.forEach((rel) => {
        const targetIdx = names.indexOf(rel.target);
        if (targetIdx === -1 || sourceIdx === targetIdx) return;

        // Reversed: target -> source
        const key = `${targetIdx}->${sourceIdx}`;
        const existing = linkMap.get(key);
        if (existing) {
          existing.value += Math.round(type.nodeCount / 100);
          existing.label += `, ${rel.name} (in)`;
        } else {
          linkMap.set(key, {
            source: targetIdx,
            target: sourceIdx,
            value: Math.round(type.nodeCount / 100),
            label: `${rel.name} (in)`,
          });
        }
      });
    });

    return { nodes, links: Array.from(linkMap.values()) };
  }

  // Inbound: reversed source/target
  const linkMap = new Map<string, SankeyLinkData>();

  types.forEach((type) => {
    const sourceIdx = names.indexOf(type.name);
    type.relations.forEach((rel) => {
      const targetIdx = names.indexOf(rel.target);
      if (targetIdx === -1 || sourceIdx === targetIdx) return;

      // Reversed: target -> source
      const key = `${targetIdx}->${sourceIdx}`;
      const existing = linkMap.get(key);
      if (existing) {
        existing.value += Math.round(type.nodeCount / 100);
        existing.label += `, ${rel.name}`;
      } else {
        linkMap.set(key, {
          source: targetIdx,
          target: sourceIdx,
          value: Math.round(type.nodeCount / 100),
          label: rel.name,
        });
      }
    });
  });

  return { nodes, links: Array.from(linkMap.values()) };
}
