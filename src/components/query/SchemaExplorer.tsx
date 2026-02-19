"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Hash,
  ArrowRight,
  ChevronRight,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getOntologyTypes } from "@/data/studio-data";
import { cn } from "@/lib/utils";

interface SchemaExplorerProps {
  onInsert: (text: string) => void;
}

export function SchemaExplorer({ onInsert }: SchemaExplorerProps) {
  const types = useMemo(() => getOntologyTypes(), []);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const filteredTypes = useMemo(() => {
    if (!search.trim()) return types;
    const q = search.toLowerCase();
    return types.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.predicates.some((p) => p.toLowerCase().includes(q)) ||
        t.relations.some((r) => r.name.toLowerCase().includes(q))
    );
  }, [types, search]);

  return (
    <div className="flex flex-col h-full border-r border-border/40">
      <div className="px-2 py-1.5 border-b border-border/40">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Schema
        </span>
      </div>
      <div className="px-2 py-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <Input
            placeholder="Filter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-6 text-xs pl-7 pr-2"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-1 pb-2">
          {filteredTypes.map((type) => {
            const isExpanded = expanded.has(type.name);

            return (
              <div key={type.name}>
                {/* Type row */}
                <div className="flex items-center gap-1 group">
                  <button
                    onClick={() => toggleExpand(type.name)}
                    className="p-0.5 rounded hover:bg-muted/50"
                  >
                    <ChevronRight
                      className={cn(
                        "size-3 text-muted-foreground transition-transform",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </button>
                  <button
                    onClick={() => onInsert(type.name)}
                    className="flex items-center gap-1.5 flex-1 px-1 py-0.5 rounded text-left hover:bg-muted/50 transition-colors"
                  >
                    <Box className="size-3 text-blue-500 shrink-0" />
                    <span className="text-xs font-medium truncate">
                      {type.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">
                      {type.nodeCount.toLocaleString()}
                    </span>
                  </button>
                </div>

                {/* Predicates + Relations */}
                {isExpanded && (
                  <div className="ml-5 border-l border-border/30 pl-1.5">
                    {type.predicates.map((pred) => (
                      <button
                        key={pred}
                        onClick={() => onInsert(pred)}
                        className="flex items-center gap-1.5 w-full px-1 py-0.5 rounded text-left hover:bg-muted/50 transition-colors"
                      >
                        <Hash className="size-2.5 text-emerald-500 shrink-0" />
                        <span className="text-[11px] text-muted-foreground truncate">
                          {pred}
                        </span>
                      </button>
                    ))}
                    {type.relations.map((rel) => (
                      <button
                        key={rel.name}
                        onClick={() => onInsert(rel.name)}
                        className="flex items-center gap-1.5 w-full px-1 py-0.5 rounded text-left hover:bg-muted/50 transition-colors"
                      >
                        <ArrowRight className="size-2.5 text-amber-500 shrink-0" />
                        <span className="text-[11px] text-muted-foreground truncate">
                          {rel.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 ml-auto">
                          {rel.target}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
