"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GpuList } from "@/components/gpu/GpuList";
import { GpuCardGrid } from "@/components/gpu/GpuCardGrid";
import { GpuDetailInfo } from "@/components/gpu/GpuDetailInfo";
import type { Gpu, GpuProcess } from "@/types";
import type { GpuDetailData } from "@/data/gpu-data";

type GpuListView = "list" | "grid";

interface GpuListDetailWidgetProps {
  gpus: Gpu[];
  processes: GpuProcess[];
  selectedGpu: number;
  onGpuSelect: (id: number) => void;
  activeGpu: Gpu;
  activeDetailData: GpuDetailData | null;
  className?: string;
}

export function GpuListDetailWidget({
  gpus,
  processes,
  selectedGpu,
  onGpuSelect,
  activeGpu,
  activeDetailData,
  className,
}: GpuListDetailWidgetProps) {
  const [gpuListView, setGpuListView] = useState<GpuListView>("list");

  return (
    <Card className={cn("border-border/40 h-full flex flex-col", className)}>
      <CardHeader className="pb-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">
            GPU List
            <span className="text-xs text-muted-foreground font-normal ml-2">
              {gpus.length}
            </span>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant={gpuListView === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setGpuListView("list")}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={gpuListView === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setGpuListView("grid")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <div className="flex gap-4 h-full">
          {/* Left: GPU List */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            {gpuListView === "list" ? (
              <GpuList
                gpus={gpus}
                processes={processes}
                selectedId={selectedGpu}
                onSelect={onGpuSelect}
              />
            ) : (
              <GpuCardGrid
                gpus={gpus}
                onGpuClick={onGpuSelect}
              />
            )}
          </div>
          {/* Divider */}
          <div className="w-px self-stretch bg-border/40 shrink-0" />
          {/* Right: Detail Info */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <GpuDetailInfo
              gpu={activeGpu}
              detailData={activeDetailData}
              embedded
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
