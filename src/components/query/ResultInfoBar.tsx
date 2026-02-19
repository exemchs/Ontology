"use client";

import { Badge } from "@/components/ui/badge";
import type { ResultTab } from "@/components/query/ResultTabs";

interface ResultInfoBarProps {
  tab: ResultTab;
  nodeCount: number;
  edgeCount: number;
}

export function ResultInfoBar({ tab, nodeCount, edgeCount }: ResultInfoBarProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/40 bg-muted/30 text-xs">
      <span className="font-medium">
        Results: {nodeCount} nodes, {edgeCount} edges
      </span>
      <span className="text-muted-foreground">&middot;</span>
      <span className="tabular-nums text-muted-foreground">{tab.executionTime}ms</span>
      <span className="text-muted-foreground">&middot;</span>
      <Badge variant="outline" className="text-[10px] h-4 px-1.5 uppercase">
        {tab.queryType}
      </Badge>
    </div>
  );
}
