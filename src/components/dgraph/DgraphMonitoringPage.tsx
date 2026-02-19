"use client";

import { useState, useMemo, useCallback } from "react";

import {
  getDgraphNodes,
  getDgraphLinks,
  type DgraphNode,
} from "@/data/dgraph-data";

import { PageShell } from "@/components/ds/PageShell";
import { ClusterTopology } from "@/components/dgraph/ClusterTopology";
import { QueryScatterPlot } from "@/components/dgraph/QueryScatterPlot";
import { ShardBarChart } from "@/components/dgraph/ShardBarChart";
import { NodePopover } from "@/components/dgraph/NodePopover";
import { NodeDetailPanel } from "@/components/dgraph/NodeDetailPanel";
import { RecentEvents } from "@/components/dgraph/RecentEvents";
import { LatencyHistogram } from "@/components/dgraph/LatencyHistogram";
import { QueryHeatmap } from "@/components/dgraph/QueryHeatmap";
import { ErrorTimeline } from "@/components/dgraph/ErrorTimeline";
import { AlphaComparisonBar } from "@/components/dgraph/AlphaComparisonBar";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface PopoverState {
  node: DgraphNode;
  x: number;
  y: number;
}

export default function DgraphMonitoringPage() {
  const [popoverState, setPopoverState] = useState<PopoverState | null>(null);
  const [detailNode, setDetailNode] = useState<DgraphNode | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const nodes = useMemo(() => getDgraphNodes(), []);
  const links = useMemo(() => getDgraphLinks(), []);

  const handleNodeClick = useCallback(
    (node: DgraphNode, screenX: number, screenY: number) => {
      if (!node || !node.id) {
        setPopoverState(null);
        return;
      }
      setPopoverState({ node, x: screenX, y: screenY });
    },
    []
  );

  const handlePopoverClose = useCallback(() => {
    setPopoverState(null);
  }, []);

  const handleExpand = useCallback((node: DgraphNode) => {
    setPopoverState(null);
    setDetailNode(node);
    setSheetOpen(true);
  }, []);

  const handleSheetClose = useCallback(() => {
    setSheetOpen(false);
    setDetailNode(null);
  }, []);

  return (
    <PageShell
      title="Graph Cluster"
      description="12-node cluster topology, query patterns, and shard distribution"
    >
      {/* Top row: Topology + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3" style={{ minHeight: 500 }}>
        <Card className="border-border/40 lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cluster Topology</CardTitle>
          </CardHeader>
          <CardContent className="p-0 relative" style={{ height: 460 }}>
            <ClusterTopology onNodeClick={handleNodeClick} />
          </CardContent>
        </Card>
        <Card className="border-border/40 overflow-hidden flex flex-col">
          <CardHeader className="pb-2 shrink-0">
            <CardTitle className="text-sm">Recent Events</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <RecentEvents className="h-full" />
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Scatter + Shard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Query Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <QueryScatterPlot />
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Shard Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ShardBarChart />
          </CardContent>
        </Card>
      </div>

      {/* Analytics row: Latency + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Latency Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <LatencyHistogram />
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Query Pattern Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <QueryHeatmap />
          </CardContent>
        </Card>
      </div>

      {/* Comparison row: Alpha Comparison + Error Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alpha Resource Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <AlphaComparisonBar />
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm">Error Log</CardTitle>
              <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                15 entries
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ErrorTimeline />
          </CardContent>
        </Card>
      </div>

      {/* Popover */}
      {popoverState && (
        <NodePopover
          node={popoverState.node}
          x={popoverState.x}
          y={popoverState.y}
          onClose={handlePopoverClose}
          onExpand={handleExpand}
        />
      )}

      {/* Side panel Sheet */}
      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) handleSheetClose();
        }}
      >
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Node Details</SheetTitle>
          </SheetHeader>
          {detailNode && (
            <NodeDetailPanel
              node={detailNode}
              allNodes={nodes}
              links={links}
            />
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
