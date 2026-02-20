"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight, ArrowLeft, Pencil, X, Plus, Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatNumber } from "@/components/charts/shared/chart-utils";
import type { OntologyType, OntologyRelation } from "@/types";

export type EdgeFilter = "all" | "outbound" | "inbound";

interface TypeDetailProps {
  type: OntologyType | null;
  allTypes?: OntologyType[];
  edgeFilter: EdgeFilter;
  onEdgeFilterChange: (filter: EdgeFilter) => void;
  onAddPredicate: (predicate: string) => void;
  onUpdatePredicate: (oldPred: string, newPred: string) => void;
  onDeletePredicate: (predicate: string) => void;
  onAddRelation: (relation: OntologyRelation) => void;
  onDeleteRelation: (relationName: string, target: string) => void;
}

function getInboundRelations(
  targetName: string,
  allTypes: OntologyType[]
): OntologyRelation[] {
  const inbound: OntologyRelation[] = [];
  for (const t of allTypes) {
    if (t.name === targetName) continue;
    for (const rel of t.relations) {
      if (rel.target === targetName && rel.direction === "outbound") {
        inbound.push({
          name: rel.name,
          target: t.name,
          direction: "inbound",
        });
      }
    }
  }
  return inbound;
}

// ── Editable Predicate Badge ────────────────────────────────────────────────

function PredicateBadge({
  name,
  allPredicates,
  onUpdate,
  onDelete,
}: {
  name: string;
  allPredicates: string[];
  onUpdate: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function handleSave() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== name && !allPredicates.includes(trimmed)) {
      onUpdate(name, trimmed);
    }
    setEditing(false);
    setEditValue(name);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setEditing(false);
      setEditValue(name);
    }
  }

  if (editing) {
    return (
      <div className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-muted/50 px-1.5 py-0.5">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="h-5 w-24 border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleSave}
          className="rounded p-0.5 hover:bg-primary/10"
        >
          <Check className="size-3 text-primary" />
        </button>
      </div>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="group/pred gap-0 pr-1 text-xs transition-all"
    >
      <span className="pr-1">{name}</span>
      <span className="hidden items-center gap-0.5 group-hover/pred:inline-flex">
        <button
          type="button"
          onClick={() => {
            setEditValue(name);
            setEditing(true);
          }}
          className="rounded p-0.5 hover:bg-muted-foreground/20"
        >
          <Pencil className="size-2.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(name)}
          className="rounded p-0.5 hover:bg-[var(--status-critical)]/20"
        >
          <X className="size-2.5" />
        </button>
      </span>
    </Badge>
  );
}

// ── Add Predicate Badge ─────────────────────────────────────────────────────

function AddPredicateBadge({
  existingPredicates,
  onAdd,
}: {
  existingPredicates: string[];
  onAdd: (name: string) => void;
}) {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active) inputRef.current?.focus();
  }, [active]);

  function handleAdd() {
    const trimmed = value.trim();
    if (trimmed && !existingPredicates.includes(trimmed)) {
      onAdd(trimmed);
      setValue("");
      // Keep input open for rapid adding
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === "Escape") {
      setActive(false);
      setValue("");
    }
  }

  if (active) {
    return (
      <div className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-muted/50 px-1.5 py-0.5">
        <Input
          ref={inputRef}
          placeholder="predicate name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!value.trim()) setActive(false);
          }}
          className="h-5 w-28 border-0 bg-transparent p-0 text-xs shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleAdd}
          className="rounded p-0.5 hover:bg-primary/10"
          disabled={!value.trim()}
        >
          <Check className="size-3 text-primary" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setActive(false);
            setValue("");
          }}
          className="rounded p-0.5 hover:bg-muted-foreground/20"
        >
          <X className="size-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className="inline-flex items-center justify-center rounded-md border border-dashed border-border bg-muted/30 px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
    >
      <Plus className="mr-0.5 size-3" />
    </button>
  );
}

// ── Add Relation Row ────────────────────────────────────────────────────────

function AddRelationRow({
  typeNames,
  onAdd,
}: {
  typeNames: string[];
  onAdd: (relation: OntologyRelation) => void;
}) {
  const [active, setActive] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active) nameRef.current?.focus();
  }, [active]);

  function handleAdd() {
    const trimmed = name.trim();
    if (trimmed && target) {
      onAdd({ name: trimmed, target, direction: "outbound" });
      setName("");
      setTarget("");
      setActive(false);
    }
  }

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className="flex items-center justify-center gap-1 rounded-md border border-dashed border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      >
        <Plus className="size-3" />
        <span>Add Relation</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-muted/30 px-2 py-1.5">
      <Input
        ref={nameRef}
        placeholder="relation name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setActive(false);
            setName("");
            setTarget("");
          }
        }}
        className="h-5 w-24 border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
      />
      <ArrowRight className="size-3 text-muted-foreground shrink-0" />
      <Select value={target} onValueChange={setTarget}>
        <SelectTrigger size="sm" className="h-5 w-28 border-0 bg-transparent text-xs shadow-none">
          <SelectValue placeholder="target" />
        </SelectTrigger>
        <SelectContent>
          {typeNames.map((tn) => (
            <SelectItem key={tn} value={tn}>
              {tn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <button
        type="button"
        onClick={handleAdd}
        disabled={!name.trim() || !target}
        className="rounded p-0.5 hover:bg-primary/10 disabled:opacity-30"
      >
        <Check className="size-3 text-primary" />
      </button>
      <button
        type="button"
        onClick={() => {
          setActive(false);
          setName("");
          setTarget("");
        }}
        className="rounded p-0.5 hover:bg-muted-foreground/20"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export function TypeDetail({
  type,
  allTypes = [],
  edgeFilter,
  onEdgeFilterChange,
  onAddPredicate,
  onUpdatePredicate,
  onDeletePredicate,
  onAddRelation,
  onDeleteRelation,
}: TypeDetailProps) {
  if (!type) {
    return (
      <div
        data-testid="type-detail"
        className="text-muted-foreground flex h-full items-center justify-center text-sm"
      >
        Select a type to view details
      </div>
    );
  }

  const outboundRelations = type.relations.filter(
    (r) => r.direction === "outbound"
  );
  const inboundRelations = getInboundRelations(type.name, allTypes);

  const filteredRelations =
    edgeFilter === "outbound"
      ? outboundRelations
      : edgeFilter === "inbound"
        ? inboundRelations
        : [...outboundRelations, ...inboundRelations];

  return (
    <div data-testid="type-detail" className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 className="text-sm font-semibold">{type.name}</h3>
        <span className="text-xs text-muted-foreground">
          {type.description}
        </span>
      </div>

      <Tabs defaultValue="predicates" className="flex flex-1 flex-col min-h-0">
        <TabsList className="mx-4 mt-2 shrink-0">
          <TabsTrigger value="predicates">Predicates</TabsTrigger>
          <TabsTrigger value="relations">Relations</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="predicates" className="flex-1 min-h-0 mt-0 px-4 pt-3">
          <ScrollArea className="h-full">
            <div className="flex flex-wrap gap-1.5 pb-2">
              {type.predicates.map((pred) => (
                <PredicateBadge
                  key={pred}
                  name={pred}
                  allPredicates={type.predicates}
                  onUpdate={onUpdatePredicate}
                  onDelete={onDeletePredicate}
                />
              ))}
              <AddPredicateBadge
                existingPredicates={type.predicates}
                onAdd={onAddPredicate}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="relations" className="flex flex-1 flex-col min-h-0 mt-0 px-4 pt-3">
          <div className="mb-3 flex items-center gap-2 shrink-0">
            <span className="text-muted-foreground text-xs">Filter:</span>
            <Select
              value={edgeFilter}
              onValueChange={(v) => onEdgeFilterChange(v as EdgeFilter)}
            >
              <SelectTrigger size="sm" className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="outbound">Outbound</SelectItem>
                <SelectItem value="inbound">Inbound</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="flex-1 min-h-0">
            <div className="flex flex-col gap-2 pb-2">
              {filteredRelations.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  No relations for this filter
                </p>
              ) : (
                filteredRelations.map((rel, i) => (
                  <div
                    key={`${rel.name}-${rel.target}-${i}`}
                    className="group/rel bg-muted/50 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs"
                  >
                    {rel.direction === "outbound" ? (
                      <>
                        <span className="font-medium">{rel.name}</span>
                        <ArrowRight className="text-muted-foreground size-3" />
                        <span className="text-muted-foreground">
                          {rel.target}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-muted-foreground">
                          {rel.target}
                        </span>
                        <ArrowLeft className="text-muted-foreground size-3" />
                        <span className="font-medium">{rel.name}</span>
                      </>
                    )}
                    {rel.direction === "outbound" && (
                      <button
                        type="button"
                        onClick={() => onDeleteRelation(rel.name, rel.target)}
                        className="ml-auto hidden rounded p-0.5 hover:bg-[var(--status-critical)]/20 group-hover/rel:block"
                      >
                        <X className="size-3 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                ))
              )}
              <AddRelationRow
                typeNames={allTypes.map((t) => t.name).filter((n) => n !== type.name)}
                onAdd={onAddRelation}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="statistics" className="flex-1 min-h-0 mt-0 overflow-auto px-4 pt-3">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-muted-foreground text-xs">Node Count</p>
              <p className="text-3xl font-bold tracking-tight">
                {formatNumber(type.nodeCount)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Relations</p>
              <p className="text-lg font-semibold">
                {outboundRelations.length} outbound, {inboundRelations.length}{" "}
                inbound
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Predicates</p>
              <p className="text-lg font-semibold">
                {type.predicates.length} fields
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
