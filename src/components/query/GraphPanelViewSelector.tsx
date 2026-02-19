"use client";

import {
  Network,
  LayoutGrid,
  Activity,
  ScatterChart,
  BarChart3,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type GraphViewType = "graph" | "treemap" | "arc" | "scatter" | "distribution";

interface GraphPanelViewSelectorProps {
  activeView: GraphViewType;
  onViewChange: (view: GraphViewType) => void;
}

const viewOptions: { type: GraphViewType; icon: React.ElementType; label: string }[] = [
  { type: "graph", icon: Network, label: "Graph" },
  { type: "treemap", icon: LayoutGrid, label: "Treemap" },
  { type: "arc", icon: Activity, label: "Arc" },
  { type: "scatter", icon: ScatterChart, label: "Scatter" },
  { type: "distribution", icon: BarChart3, label: "Distribution" },
];

export function GraphPanelViewSelector({
  activeView,
  onViewChange,
}: GraphPanelViewSelectorProps) {
  return (
    <div className="px-2 py-1 border-b border-border/40">
      <Tabs value={activeView} onValueChange={(v) => onViewChange(v as GraphViewType)}>
        <TabsList className="h-6">
          {viewOptions.map(({ type, icon: Icon, label }) => (
            <TabsTrigger key={type} value={type} className="text-[10px] px-1.5 gap-0.5 h-5">
              <Icon className="size-2.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
