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
    <div data-testid="studio-page" className="flex h-full gap-4 p-4">
      {/* Left Panel (~35%) */}
      <div className="flex w-[35%] min-w-[280px] flex-col gap-4">
        {/* Type List */}
        <Card className="flex-[4] overflow-hidden py-0">
          <TypeList
            types={types}
            selectedType={selectedType}
            onSelect={setSelectedType}
          />
        </Card>

        {/* Type Detail */}
        <Card className="flex-[6] overflow-hidden py-0">
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
      <div className="flex flex-1 flex-col gap-4">
        {/* OntologyGraph (~60%) */}
        <Card className="flex-[6] overflow-hidden">
          <OntologyGraph
            types={types}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            edgeFilter={edgeFilter}
          />
        </Card>

        {/* TypeDistributionChart (~40%) */}
        <Card className="flex-[4] overflow-hidden">
          <TypeDistributionChart />
        </Card>
      </div>

      {/* Edit Dialog */}
      <TypeEditDialog
        type={selectedType}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
}
