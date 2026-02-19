"use client";

import { useState, useMemo, useCallback } from "react";

import {
  getDgraphNodes,
  getDgraphLinks,
  type DgraphNode,
  type DgraphLink,
} from "@/data/dgraph-data";

import { ClusterTopology } from "@/components/dgraph/ClusterTopology";
import { QueryScatterPlot } from "@/components/dgraph/QueryScatterPlot";
import { ShardBarChart } from "@/components/dgraph/ShardBarChart";
import { NodePopover } from "@/components/dgraph/NodePopover";
import { NodeDetailPanel } from "@/components/dgraph/NodeDetailPanel";
import { RecentEvents } from "@/components/dgraph/RecentEvents";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// ── Types ────────────────────────────────────────────────────────────────────

interface PopoverState {
  node: DgraphNode;
  x: number;
  y: number;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function DgraphMonitoringPage() {
  // Shared state
  const [popoverState, setPopoverState] = useState<PopoverState | null>(null);
  const [detailNode, setDetailNode] = useState<DgraphNode | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Data (loaded once)
  const nodes = useMemo(() => getDgraphNodes(), []);
  const links = useMemo(() => getDgraphLinks(), []);

  // ── Event Handlers ────────────────────────────────────────────────────────

  const handleNodeClick = useCallback(
    (node: DgraphNode, screenX: number, screenY: number) => {
      // ClusterTopology passes null-ish node to signal close
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">DGraph Monitoring</h1>
        <p className="text-sm text-muted-foreground">
          12-node cluster topology, query patterns, and shard distribution
        </p>
      </div>

      {/* Top row: Topology + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cluster Topology</CardTitle>
          </CardHeader>
          <CardContent className="p-0 relative" style={{ height: 500 }}>
            <ClusterTopology onNodeClick={handleNodeClick} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentEvents />
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Scatter + Shard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Query Performance</CardTitle>
            <CardDescription>Latency vs Throughput -- brush to filter</CardDescription>
          </CardHeader>
          <CardContent>
            <QueryScatterPlot />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Shard Distribution</CardTitle>
            <CardDescription>Predicate sizes by group</CardDescription>
          </CardHeader>
          <CardContent>
            <ShardBarChart />
          </CardContent>
        </Card>
      </div>

      {/* Popover (fixed position, rendered when node clicked) */}
      {popoverState && (
        <NodePopover
          node={popoverState.node}
          x={popoverState.x}
          y={popoverState.y}
          onClose={handlePopoverClose}
          onExpand={handleExpand}
        />
      )}

      {/* Side panel Sheet (Tier 2 detail) */}
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
    </div>
  );
}
