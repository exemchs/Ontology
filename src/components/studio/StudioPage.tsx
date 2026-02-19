"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TypeList } from "@/components/studio/TypeList";
import { TypeDetail, type EdgeFilter } from "@/components/studio/TypeDetail";
import { TypeEditDialog } from "@/components/studio/TypeEditDialog";
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
        {/* OntologyGraph Placeholder (~60%) */}
        <Card className="flex flex-[6] items-center justify-center border-dashed">
          <CardContent className="flex flex-col items-center gap-2">
            <p className="text-muted-foreground text-sm font-medium">
              OntologyGraph
            </p>
            <p className="text-muted-foreground/60 text-xs">
              Force / Radial / Hierarchy modes (Plan 02)
            </p>
            {selectedType && (
              <p className="text-muted-foreground/40 mt-1 text-xs">
                Selected: {selectedType.name} | Filter: {edgeFilter}
              </p>
            )}
          </CardContent>
        </Card>

        {/* TypeDistributionChart Placeholder (~40%) */}
        <Card className="flex flex-[4] items-center justify-center border-dashed">
          <CardContent className="flex flex-col items-center gap-2">
            <p className="text-muted-foreground text-sm font-medium">
              TypeDistributionChart
            </p>
            <p className="text-muted-foreground/60 text-xs">
              Stacked / Grouped bar chart (Plan 02)
            </p>
          </CardContent>
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
