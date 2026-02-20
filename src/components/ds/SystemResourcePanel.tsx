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
        <div className="grid grid-cols-[minmax(160px,1fr)_3fr] gap-4">
          {/* 왼쪽: 반원 게이지 3개 세로 배치 */}
          <div className="flex flex-col gap-1">
            {gauges.map((gauge) => (
              <HalfGauge key={gauge.label} data={gauge} className="w-full" />
            ))}
          </div>

          {/* 오른쪽: 트렌드 차트 3개 가로 배치 */}
          <div className="grid grid-cols-3 gap-2">
            <ResourceTrendChart
              title="CPU"
              series={trends.cpu}
              unit="Cores"
              className="w-full h-[140px]"
            />
            <ResourceTrendChart
              title="Memory"
              series={trends.memory}
              unit="GB"
              className="w-full h-[140px]"
            />
            <ResourceTrendChart
              title="Disk"
              series={trends.disk}
              unit="GB"
              className="w-full h-[140px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
