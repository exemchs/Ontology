"use client";

import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { SchemaTreeView } from "@/components/studio/SchemaTreeView";
import { SchemaHealthScore } from "@/components/studio/SchemaHealthScore";
import { TypeDetail, type EdgeFilter } from "@/components/studio/TypeDetail";
import { TypeEditDialog } from "@/components/studio/TypeEditDialog";
import { OntologyGraph } from "@/components/charts/studio/OntologyGraph";
import {
  OntologyMinimap,
  type MinimapNode,
  type MinimapTransform,
} from "@/components/studio/OntologyMinimap";
import { TypeDistributionTreemap } from "@/components/charts/studio/TypeDistributionTreemap";
import { getOntologyTypes } from "@/data/studio-data";
import type { OntologyType } from "@/types";

export function StudioPage() {
  const types = useMemo(() => getOntologyTypes(), []);
  const [selectedType, setSelectedType] = useState<OntologyType | null>(
    types[0] ?? null
  );
  const [edgeFilter, setEdgeFilter] = useState<EdgeFilter>("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  return (
    <div data-testid="studio-page" className="flex h-full gap-3 p-3">
      {/* Left Panel (~35%) */}
      <div className="flex w-[35%] min-w-[280px] flex-col gap-3">
        <Card className="border-border/40 flex-[3] overflow-hidden py-0">
          <SchemaTreeView
            types={types}
            selectedType={selectedType?.name ?? null}
            onSelectType={handleTreeSelect}
          />
        </Card>
        <Card className="border-border/40 flex-[4] overflow-hidden py-0">
          <TypeDetail
            type={selectedType}
            allTypes={types}
            edgeFilter={edgeFilter}
            onEdgeFilterChange={setEdgeFilter}
            onEdit={() => setEditDialogOpen(true)}
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

      <TypeEditDialog
        type={selectedType}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
}
