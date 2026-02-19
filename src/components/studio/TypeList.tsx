"use client";

import {
  Box,
  Workflow,
  Circle,
  FileText,
  AlertTriangle,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatNumber } from "@/components/charts/shared/chart-utils";
import type { OntologyType } from "@/types";

const typeIcons: Record<string, LucideIcon> = {
  Equipment: Box,
  Process: Workflow,
  Wafer: Circle,
  Recipe: FileText,
  Defect: AlertTriangle,
  MaintenanceRecord: Wrench,
};

interface TypeListProps {
  types: OntologyType[];
  selectedType: OntologyType | null;
  onSelect: (type: OntologyType) => void;
}

export function TypeList({ types, selectedType, onSelect }: TypeListProps) {
  return (
    <ScrollArea className="h-full" data-testid="type-list">
      <div className="flex flex-col gap-2 p-3">
        {types.map((type) => {
          const Icon = typeIcons[type.name] ?? Box;
          const isSelected = selectedType?.name === type.name;

          return (
            <Card
              key={type.name}
              data-testid={`type-item-${type.name}`}
              data-selected={isSelected}
              onClick={() => onSelect(type)}
              className={`cursor-pointer gap-3 px-4 py-3 transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "hover:border-muted-foreground/30 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="text-muted-foreground size-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">
                      {type.name}
                    </span>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {formatNumber(type.nodeCount)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground truncate text-xs">
                    {type.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
