"use client";

import { useEffect, useRef, useState } from "react";

import { getOntologyTypes } from "@/data/studio-data";
import {
  buildChordData,
  buildForceData,
  buildSankeyData,
} from "@/lib/ontology-relation-data";
import { createDebouncedResizeObserver } from "@/components/charts/shared/chart-utils";
import { OntologyChordView } from "@/components/charts/dashboard/OntologyChordView";
import { OntologyForceView } from "@/components/charts/dashboard/OntologyForceView";
import { OntologySankeyView } from "@/components/charts/dashboard/OntologySankeyView";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ViewType = "chord" | "force" | "sankey";
type SankeyDirection = "all" | "inbound" | "outbound";

export function OntologyRelationChart() {
  const [viewType, setViewType] = useState<ViewType>("force");
  const [sankeyDirection, setSankeyDirection] = useState<SankeyDirection>("all");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Observe container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = createDebouncedResizeObserver((width, height) => {
      setDimensions({ width, height });
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Build data from ontology types
  const types = getOntologyTypes();
  const chordData = buildChordData(types);
  const forceData = buildForceData(types);
  const sankeyData = buildSankeyData(types, sankeyDirection);

  const { width, height } = dimensions;

  return (
    <Card data-testid="ontology-relation-chart">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Ontology Relations</CardTitle>
          <Tabs
            value={viewType}
            onValueChange={(v) => setViewType(v as ViewType)}
          >
            <TabsList className="h-7">
              <TabsTrigger value="chord" className="px-2 py-0.5 text-xs">
                Chord
              </TabsTrigger>
              <TabsTrigger value="force" className="px-2 py-0.5 text-xs">
                Force
              </TabsTrigger>
              <TabsTrigger value="sankey" className="px-2 py-0.5 text-xs">
                Sankey
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Direction filter - only for Sankey view */}
        {viewType === "sankey" && (
          <div className="flex gap-1 pt-1">
            {(["all", "inbound", "outbound"] as const).map((dir) => (
              <Button
                key={dir}
                variant={sankeyDirection === dir ? "default" : "outline"}
                size="sm"
                className="h-6 px-2 text-xs capitalize"
                onClick={() => setSankeyDirection(dir)}
              >
                {dir}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="min-h-[300px] w-full"
        >
          {width > 0 && height > 0 && (
            <>
              {viewType === "chord" && (
                <OntologyChordView data={chordData} width={width} height={height} />
              )}
              {viewType === "force" && (
                <OntologyForceView data={forceData} width={width} height={height} />
              )}
              {viewType === "sankey" && (
                <OntologySankeyView
                  data={sankeyData}
                  width={width}
                  height={height}
                  direction={sankeyDirection}
                />
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
