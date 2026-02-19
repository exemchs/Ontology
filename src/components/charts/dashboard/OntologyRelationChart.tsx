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

type ViewType = "chord" | "force" | "sankey";
type Direction = "all" | "inbound" | "outbound";

interface OntologyRelationChartProps {
  viewType?: ViewType;
  className?: string;
}

export function OntologyRelationChart({ viewType: controlledView, className }: OntologyRelationChartProps) {
  const [internalView, setInternalView] = useState<ViewType>("force");
  const [direction, setDirection] = useState<Direction>("all");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const viewType = controlledView ?? internalView;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = createDebouncedResizeObserver((width, height) => {
      setDimensions({ width, height });
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const types = getOntologyTypes();
  const chordData = buildChordData(types);
  const forceData = buildForceData(types, direction);
  const sankeyData = buildSankeyData(types, direction);

  const { width, height } = dimensions;
  const showDirection = viewType === "force" || viewType === "sankey";

  return (
    <div
      ref={containerRef}
      data-testid="ontology-relation-chart"
      className={className}
      style={{ width: "100%", minHeight: 300, position: "relative" }}
    >
      {showDirection && (
        <div className="absolute top-1 left-0 z-10">
          <Tabs
            value={direction}
            onValueChange={(v) => setDirection(v as Direction)}
          >
            <TabsList className="h-7">
              <TabsTrigger value="all" className="text-xs px-2">All</TabsTrigger>
              <TabsTrigger value="inbound" className="text-xs px-2">Inbound</TabsTrigger>
              <TabsTrigger value="outbound" className="text-xs px-2">Outbound</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}
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
              direction={direction}
            />
          )}
        </>
      )}
    </div>
  );
}
