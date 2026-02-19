"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ResultTab {
  id: string;
  label: string;
  executionTime: number;
  resultCount: number;
  queryText: string;
  queryType: "graphql" | "dql";
  timestamp: string;
  data: Record<string, unknown>[];
}

interface ResultTabsProps {
  tabs: ResultTab[];
  activeTabId: string | null;
  onTabChange: (id: string) => void;
  onTabClose: (id: string) => void;
}

/** Compute unique node types from result data */
function countNodes(data: Record<string, unknown>[]): number {
  const types = new Set<string>();
  data.forEach((row) => {
    const t = row.type ?? row.equipment_id ?? row.wafer_id ?? row.name;
    if (t) types.add(String(t));
  });
  return types.size;
}

export function ResultTabs({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
}: ResultTabsProps) {
  if (tabs.length === 0) {
    return (
      <div className="flex items-center justify-center h-10 border-b text-sm text-muted-foreground">
        Run a query to see results here
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5 border-b px-1 overflow-x-auto">
      {tabs.map((tab) => {
        const nodeCount = countNodes(tab.data);
        const recordCount = tab.data.length;

        return (
          <div
            key={tab.id}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 text-xs cursor-pointer border-b-2 transition-colors shrink-0",
              activeTabId === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
            )}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="font-medium">{tab.label}</span>
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              Nodes: {nodeCount} / Records: {recordCount}
            </Badge>
            <Badge variant="outline" className="text-[10px] h-4 px-1.5">
              {tab.executionTime}ms
            </Badge>
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-4 ml-0.5"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
            >
              <X className="size-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
