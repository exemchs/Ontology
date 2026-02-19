"use client";

import { Table2, Network } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ViewType = "table" | "graph";

interface ResultViewBarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const viewOptions: { type: ViewType; icon: React.ElementType; label: string }[] = [
  { type: "table", icon: Table2, label: "Table" },
  { type: "graph", icon: Network, label: "Graph" },
];

export function ResultViewBar({ activeView, onViewChange }: ResultViewBarProps) {
  return (
    <div className="px-2 py-0.5 border-b">
      <Tabs value={activeView} onValueChange={(v) => onViewChange(v as ViewType)}>
        <TabsList className="h-7">
          {viewOptions.map(({ type, icon: Icon, label }) => (
            <TabsTrigger key={type} value={type} className="text-xs px-2 gap-1">
              <Icon className="size-3" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
