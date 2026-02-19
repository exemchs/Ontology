"use client";

import { Network, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type GraphViewType = "graph";

interface GraphPanelViewSelectorProps {
  activeView: GraphViewType;
  onViewChange: (view: GraphViewType) => void;
  /** Available type names in graph data */
  typeNames?: string[];
  /** Currently hidden types */
  hiddenTypes?: string[];
  /** Toggle a type's visibility */
  onToggleType?: (typeName: string) => void;
}

export function GraphPanelViewSelector({
  activeView: _activeView,
  onViewChange: _onViewChange,
  typeNames = [],
  hiddenTypes = [],
  onToggleType,
}: GraphPanelViewSelectorProps) {
  return (
    <div className="px-2 py-1 border-b border-border/40">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Network className="size-3" />
          Graph View
        </div>
        {typeNames.length > 0 && (
          <>
            <span className="text-muted-foreground/50 text-xs">|</span>
            <div className="flex items-center gap-1 flex-wrap">
              {typeNames.map((typeName) => {
                const isHidden = hiddenTypes.includes(typeName);
                return (
                  <Button
                    key={typeName}
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 gap-1 text-[10px]"
                    onClick={() => onToggleType?.(typeName)}
                  >
                    {isHidden ? (
                      <EyeOff className="size-2.5 text-muted-foreground" />
                    ) : (
                      <Eye className="size-2.5" />
                    )}
                    <Badge
                      variant={isHidden ? "outline" : "secondary"}
                      className="text-[10px] h-4 px-1.5"
                    >
                      {typeName}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
