"use client";

import { useState, useMemo } from "react";
import {
  Workflow,
  ChevronRight,
  ChevronDown,
  GitBranch,
  Tag,
  Search,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { OntologyType } from "@/types";

interface SchemaTreeViewProps {
  types: OntologyType[];
  selectedType: string | null;
  onSelectType: (name: string) => void;
}

export function SchemaTreeView({
  types,
  selectedType,
  onSelectType,
}: SchemaTreeViewProps) {
  const [filter, setFilter] = useState("");
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  const filteredTypes = useMemo(() => {
    if (!filter.trim()) return types;
    const q = filter.toLowerCase();
    return types.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.predicates.some((p) => p.toLowerCase().includes(q)) ||
        t.relations.some(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.target.toLowerCase().includes(q)
        )
    );
  }, [types, filter]);

  function toggleType(name: string) {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function expandAll(typeName: string) {
    setExpandedTypes((prev) => new Set([...prev, typeName]));
    toast.info(`Expanded ${typeName}`);
  }

  return (
    <div className="flex h-full flex-col" data-testid="schema-tree-view">
      {/* Search filter */}
      <div className="shrink-0 border-b p-2">
        <div className="relative">
          <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-3.5" />
          <Input
            placeholder="Filter types..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* Tree */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-0.5 p-2">
          {filteredTypes.map((type) => {
            const isExpanded = expandedTypes.has(type.name);
            const isSelected = selectedType === type.name;

            return (
              <Collapsible
                key={type.name}
                open={isExpanded}
                onOpenChange={() => toggleType(type.name)}
              >
                {/* Type node with context menu */}
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <CollapsibleTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectType(type.name);
                        }}
                        className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted/50"
                        }`}
                        data-testid={`tree-type-${type.name}`}
                      >
                        {isExpanded ? (
                          <ChevronDown className="size-3.5 shrink-0" />
                        ) : (
                          <ChevronRight className="size-3.5 shrink-0" />
                        )}
                        <Workflow className="text-muted-foreground size-3.5 shrink-0" />
                        <span className="truncate">{type.name}</span>
                        <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                          {type.nodeCount.toLocaleString()}
                        </span>
                      </button>
                    </CollapsibleTrigger>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() => {
                        onSelectType(type.name);
                        toast.info(`Viewing ${type.name} details`);
                      }}
                    >
                      View Details
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => toast.info(`Edit ${type.name} (POC)`)}
                    >
                      Edit Type
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => expandAll(type.name)}>
                      Expand All
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>

                {/* Collapsible children */}
                <CollapsibleContent>
                  <div className="ml-5 flex flex-col gap-0.5 border-l pl-2">
                    {/* Predicates group */}
                    {type.predicates.length > 0 && (
                      <PredicatesGroup
                        predicates={type.predicates}
                        typeName={type.name}
                      />
                    )}

                    {/* Relations group */}
                    {type.relations.length > 0 && (
                      <RelationsGroup
                        relations={type.relations}
                        typeName={type.name}
                        onNavigateTarget={onSelectType}
                      />
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}

          {filteredTypes.length === 0 && (
            <p className="text-muted-foreground py-4 text-center text-xs">
              No types match &quot;{filter}&quot;
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ── Predicates Sub-group ──────────────────────────────────────────────────

function PredicatesGroup({
  predicates,
  typeName,
}: {
  predicates: string[];
  typeName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground flex w-full items-center gap-1 rounded px-1.5 py-1 text-left text-xs transition-colors">
          {open ? (
            <ChevronDown className="size-3 shrink-0" />
          ) : (
            <ChevronRight className="size-3 shrink-0" />
          )}
          <Tag className="size-3 shrink-0" />
          <span>Predicates</span>
          <span className="ml-auto tabular-nums opacity-60">
            {predicates.length}
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 flex flex-col">
          {predicates.map((pred) => (
            <ContextMenu key={pred}>
              <ContextMenuTrigger asChild>
                <div className="text-muted-foreground hover:text-foreground cursor-default rounded px-1.5 py-0.5 text-xs transition-colors">
                  {pred}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(pred);
                    toast.success(`Copied "${pred}"`);
                  }}
                >
                  Copy Name
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() =>
                    toast.info(`Filter by ${typeName}.${pred} (POC)`)
                  }
                >
                  Filter by Predicate
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ── Relations Sub-group ───────────────────────────────────────────────────

function RelationsGroup({
  relations,
  typeName,
  onNavigateTarget,
}: {
  relations: { name: string; target: string; direction: string }[];
  typeName: string;
  onNavigateTarget: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground flex w-full items-center gap-1 rounded px-1.5 py-1 text-left text-xs transition-colors">
          {open ? (
            <ChevronDown className="size-3 shrink-0" />
          ) : (
            <ChevronRight className="size-3 shrink-0" />
          )}
          <GitBranch className="size-3 shrink-0" />
          <span>Relations</span>
          <span className="ml-auto tabular-nums opacity-60">
            {relations.length}
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 flex flex-col">
          {relations.map((rel) => (
            <ContextMenu key={`${typeName}-${rel.name}-${rel.target}`}>
              <ContextMenuTrigger asChild>
                <div className="text-muted-foreground hover:text-foreground flex cursor-default items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors">
                  <span>{rel.name}</span>
                  <span className="opacity-40">&rarr;</span>
                  <span className="text-primary/70">{rel.target}</span>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onClick={() => {
                    onNavigateTarget(rel.target);
                    toast.info(`Navigated to ${rel.target}`);
                  }}
                >
                  Navigate to Target
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(rel.name);
                    toast.success(`Copied "${rel.name}"`);
                  }}
                >
                  Copy Name
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
