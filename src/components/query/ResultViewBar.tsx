"use client";

import {
  Table2,
  Network,
  LayoutGrid,
  Activity,
  ScatterChart,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ViewType =
  | "table"
  | "graph"
  | "treemap"
  | "arc"
  | "scatter"
  | "distribution";

interface ResultViewBarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const viewOptions: { type: ViewType; icon: React.ElementType; label: string }[] = [
  { type: "table", icon: Table2, label: "Table" },
  { type: "graph", icon: Network, label: "Graph" },
  { type: "treemap", icon: LayoutGrid, label: "Treemap" },
  { type: "arc", icon: Activity, label: "Arc" },
  { type: "scatter", icon: ScatterChart, label: "Scatter" },
  { type: "distribution", icon: BarChart3, label: "Distribution" },
];

export function ResultViewBar({ activeView, onViewChange }: ResultViewBarProps) {
  return (
    <div className="flex items-center gap-0.5 px-2 py-1 border-b">
      {viewOptions.map(({ type, icon: Icon, label }) => (
        <Button
          key={type}
          variant={activeView === type ? "secondary" : "ghost"}
          size="xs"
          onClick={() => onViewChange(type)}
          className={cn(
            "gap-1 text-[10px]",
            activeView === type && "font-medium"
          )}
        >
          <Icon className="size-3" />
          {label}
        </Button>
      ))}
    </div>
  );
}
