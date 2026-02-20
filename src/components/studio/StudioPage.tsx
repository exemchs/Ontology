"use client";

import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { SchemaTreeView } from "@/components/studio/SchemaTreeView";
import { SchemaHealthScore } from "@/components/studio/SchemaHealthScore";
import { TypeDetail, type EdgeFilter } from "@/components/studio/TypeDetail";
import { TypeAddDialog } from "@/components/studio/TypeAddDialog";
import { OntologyGraph } from "@/components/charts/studio/OntologyGraph";
import {
  OntologyMinimap,
  type MinimapNode,
  type MinimapTransform,
} from "@/components/studio/OntologyMinimap";
import { TypeDistributionTreemap } from "@/components/charts/studio/TypeDistributionTreemap";
import { getOntologyTypes } from "@/data/studio-data";
import { toast } from "sonner";
import type { OntologyType } from "@/types";

export function StudioPage() {
  const [types, setTypes] = useState<OntologyType[]>(() => getOntologyTypes());
  const [selectedType, setSelectedType] = useState<OntologyType | null>(
    types[0] ?? null
  );
  const [edgeFilter, setEdgeFilter] = useState<EdgeFilter>("all");
  const [addTypeDialogOpen, setAddTypeDialogOpen] = useState(false);

  // Minimap state
  const [minimapNodes, setMinimapNodes] = useState<MinimapNode[]>([]);
  const [minimapTransform, setMinimapTransform] = useState<MinimapTransform>({
    x: 0,
    y: 0,
    k: 1,
  });

  const handleZoomChange = useCallback(
    (transform: { x: number; y: number; k: number }, nodes: { x: number; y: number; name: string }[]) => {
      setMinimapTransform(transform);
      setMinimapNodes(nodes);
    },
    []
  );

  // Bridge SchemaTreeView (name-based) to OntologyType selection
  const handleTreeSelect = useCallback(
    (name: string) => {
      const found = types.find((t) => t.name === name);
      if (found) setSelectedType(found);
    },
    [types]
  );

  // ── Type CRUD ──────────────────────────────────────────────────────────────

  const handleAddType = useCallback((name: string, description: string) => {
    setTypes((prev) => {
      const maxId = prev.reduce((max, t) => Math.max(max, t.id), 0);
      const newType: OntologyType = {
        id: maxId + 1,
        name,
        description,
        nodeCount: 0,
        predicates: [],
        relations: [],
      };
      return [...prev, newType];
    });
    toast.success(`Type "${name}" added`);
  }, []);

  const handleDeleteType = useCallback(
    (name: string) => {
      setTypes((prev) => prev.filter((t) => t.name !== name));
      if (selectedType?.name === name) {
        setSelectedType((prev) => {
          const remaining = types.filter((t) => t.name !== name);
          return remaining[0] ?? null;
        });
      }
      toast.success(`Type "${name}" deleted`);
    },
    [selectedType, types]
  );

  const handleRenameType = useCallback(
    (oldName: string, newName: string) => {
      setTypes((prev) =>
        prev.map((t) => (t.name === oldName ? { ...t, name: newName } : t))
      );
      if (selectedType?.name === oldName) {
        setSelectedType((prev) => (prev ? { ...prev, name: newName } : null));
      }
      toast.success(`Type renamed to "${newName}"`);
    },
    [selectedType]
  );

  // ── Predicate CRUD ─────────────────────────────────────────────────────────

  const handleAddPredicate = useCallback(
    (typeName: string, predicate: string) => {
      setTypes((prev) =>
        prev.map((t) =>
          t.name === typeName
            ? { ...t, predicates: [...t.predicates, predicate] }
            : t
        )
      );
      // Sync selectedType
      setSelectedType((prev) =>
        prev?.name === typeName
          ? { ...prev, predicates: [...prev.predicates, predicate] }
          : prev
      );
    },
    []
  );

  const handleUpdatePredicate = useCallback(
    (typeName: string, oldPred: string, newPred: string) => {
      setTypes((prev) =>
        prev.map((t) =>
          t.name === typeName
            ? {
                ...t,
                predicates: t.predicates.map((p) =>
                  p === oldPred ? newPred : p
                ),
              }
            : t
        )
      );
      setSelectedType((prev) =>
        prev?.name === typeName
          ? {
              ...prev,
              predicates: prev.predicates.map((p) =>
                p === oldPred ? newPred : p
              ),
            }
          : prev
      );
    },
    []
  );

  const handleDeletePredicate = useCallback(
    (typeName: string, predicate: string) => {
      setTypes((prev) =>
        prev.map((t) =>
          t.name === typeName
            ? { ...t, predicates: t.predicates.filter((p) => p !== predicate) }
            : t
        )
      );
      setSelectedType((prev) =>
        prev?.name === typeName
          ? {
              ...prev,
              predicates: prev.predicates.filter((p) => p !== predicate),
            }
          : prev
      );
    },
    []
  );

  // ── Relation CRUD ───────────────────────────────────────────────────────

  const handleAddRelation = useCallback(
    (typeName: string, relation: import("@/types").OntologyRelation) => {
      setTypes((prev) =>
        prev.map((t) =>
          t.name === typeName
            ? { ...t, relations: [...t.relations, relation] }
            : t
        )
      );
      setSelectedType((prev) =>
        prev?.name === typeName
          ? { ...prev, relations: [...prev.relations, relation] }
          : prev
      );
    },
    []
  );

  const handleDeleteRelation = useCallback(
    (typeName: string, relationName: string, target: string) => {
      setTypes((prev) =>
        prev.map((t) =>
          t.name === typeName
            ? {
                ...t,
                relations: t.relations.filter(
                  (r) => !(r.name === relationName && r.target === target)
                ),
              }
            : t
        )
      );
      setSelectedType((prev) =>
        prev?.name === typeName
          ? {
              ...prev,
              relations: prev.relations.filter(
                (r) => !(r.name === relationName && r.target === target)
              ),
            }
          : prev
      );
    },
    []
  );

  const typeNames = useMemo(() => types.map((t) => t.name), [types]);

  return (
    <div data-testid="studio-page" className="flex h-full gap-3 p-3">
      {/* Left Panel (~35%) */}
      <div className="flex w-[35%] min-w-[280px] flex-col gap-3">
        <Card className="border-border/40 flex-[3] overflow-hidden py-0">
          <SchemaTreeView
            types={types}
            selectedType={selectedType?.name ?? null}
            onSelectType={handleTreeSelect}
            onAddType={() => setAddTypeDialogOpen(true)}
            onDeleteType={handleDeleteType}
            onRenameType={handleRenameType}
          />
        </Card>
        <Card className="border-border/40 flex-[4] overflow-hidden py-0">
          <TypeDetail
            type={selectedType}
            allTypes={types}
            edgeFilter={edgeFilter}
            onEdgeFilterChange={setEdgeFilter}
            onAddPredicate={(pred) =>
              selectedType && handleAddPredicate(selectedType.name, pred)
            }
            onUpdatePredicate={(oldPred, newPred) =>
              selectedType &&
              handleUpdatePredicate(selectedType.name, oldPred, newPred)
            }
            onDeletePredicate={(pred) =>
              selectedType && handleDeletePredicate(selectedType.name, pred)
            }
            onAddRelation={(rel) =>
              selectedType && handleAddRelation(selectedType.name, rel)
            }
            onDeleteRelation={(relName, target) =>
              selectedType &&
              handleDeleteRelation(selectedType.name, relName, target)
            }
          />
        </Card>
        <SchemaHealthScore types={types} />
      </div>

      {/* Right Panel (~65%) */}
      <div className="flex flex-1 flex-col gap-3">
        <Card className="border-border/40 relative flex-[6] overflow-hidden">
          <OntologyGraph
            types={types}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            edgeFilter={edgeFilter}
            onZoomChange={handleZoomChange}
          />
          {/* Minimap overlay */}
          <div className="absolute bottom-2 right-2 z-10">
            <OntologyMinimap
              nodes={minimapNodes}
              viewportTransform={minimapTransform}
              graphWidth={800}
              graphHeight={500}
            />
          </div>
        </Card>
        <Card className="border-border/40 flex-[4] overflow-hidden">
          <TypeDistributionTreemap types={types} />
        </Card>
      </div>

      <TypeAddDialog
        open={addTypeDialogOpen}
        onOpenChange={setAddTypeDialogOpen}
        onAdd={handleAddType}
        existingNames={typeNames}
      />
    </div>
  );
}
