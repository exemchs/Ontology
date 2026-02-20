// src/components/ds/SystemResourcePanel.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HalfGauge } from "@/components/charts/shared/HalfGauge";
import { ResourceTrendChart } from "@/components/charts/shared/ResourceTrendChart";
import type { SystemResourceGauge, SystemResourceTrends } from "@/data/system-resource-data";

interface SystemResourcePanelProps {
  gauges: SystemResourceGauge[];
  trends: SystemResourceTrends;
}

export function SystemResourcePanel({ gauges, trends }: SystemResourcePanelProps) {
  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">System Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* 왼쪽: 반원 게이지 3개 세로 배치 (고정 폭) */}
          <div className="flex flex-col gap-0 shrink-0" style={{ width: 130 }}>
            {gauges.map((gauge) => (
              <HalfGauge key={gauge.label} data={gauge} />
            ))}
          </div>

          {/* 오른쪽: 트렌드 차트 3개 가로 배치 (나머지 영역) */}
          <div className="grid grid-cols-3 gap-2 flex-1 min-w-0">
            <ResourceTrendChart
              title="CPU"
              series={trends.cpu}
              unit="Cores"
              className="w-full h-full"
            />
            <ResourceTrendChart
              title="Memory"
              series={trends.memory}
              unit="GB"
              className="w-full h-full"
            />
            <ResourceTrendChart
              title="Disk"
              series={trends.disk}
              unit="GB"
              className="w-full h-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
