"use client";

import { ArrowRight, ArrowLeft, Pencil } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  onEdit: () => void;
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

export function TypeDetail({
  type,
  allTypes = [],
  edgeFilter,
  onEdgeFilterChange,
  onEdit,
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
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="mr-1 size-3.5" />
          Edit
        </Button>
      </div>

      <Tabs defaultValue="predicates" className="flex-1">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="predicates">Predicates</TabsTrigger>
          <TabsTrigger value="relations">Relations</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="predicates" className="px-4 pt-3">
          <ScrollArea className="h-[180px]">
            <div className="flex flex-wrap gap-1.5">
              {type.predicates.map((pred) => (
                <Badge key={pred} variant="secondary" className="text-xs">
                  {pred}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="relations" className="px-4 pt-3">
          <div className="mb-3 flex items-center gap-2">
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
          <ScrollArea className="h-[140px]">
            <div className="flex flex-col gap-2">
              {filteredRelations.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  No relations for this filter
                </p>
              ) : (
                filteredRelations.map((rel, i) => (
                  <div
                    key={`${rel.name}-${rel.target}-${i}`}
                    className="bg-muted/50 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs"
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
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="statistics" className="px-4 pt-3">
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
