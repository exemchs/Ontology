"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TypeList } from "@/components/studio/TypeList";
import { TypeDetail, type EdgeFilter } from "@/components/studio/TypeDetail";
import { TypeEditDialog } from "@/components/studio/TypeEditDialog";
import { OntologyGraph } from "@/components/charts/studio/OntologyGraph";
import { TypeDistributionChart } from "@/components/charts/studio/TypeDistributionChart";
import { getOntologyTypes } from "@/data/studio-data";
import type { OntologyType } from "@/types";

export function StudioPage() {
  const types = useMemo(() => getOntologyTypes(), []);
  const [selectedType, setSelectedType] = useState<OntologyType | null>(
    types[0] ?? null
  );
  const [edgeFilter, setEdgeFilter] = useState<EdgeFilter>("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  return (
    <div data-testid="studio-page" className="flex h-full gap-3 p-3">
      {/* Left Panel (~35%) */}
      <div className="flex w-[35%] min-w-[280px] flex-col gap-3">
        <Card className="border-border/40 flex-[4] overflow-hidden py-0">
          <TypeList
            types={types}
            selectedType={selectedType}
            onSelect={setSelectedType}
          />
        </Card>
        <Card className="border-border/40 flex-[6] overflow-hidden py-0">
          <TypeDetail
            type={selectedType}
            allTypes={types}
            edgeFilter={edgeFilter}
            onEdgeFilterChange={setEdgeFilter}
            onEdit={() => setEditDialogOpen(true)}
          />
        </Card>
      </div>

      {/* Right Panel (~65%) */}
      <div className="flex flex-1 flex-col gap-3">
        <Card className="border-border/40 flex-[6] overflow-hidden">
          <OntologyGraph
            types={types}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            edgeFilter={edgeFilter}
          />
        </Card>
        <Card className="border-border/40 flex-[4] overflow-hidden">
          <TypeDistributionChart />
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
