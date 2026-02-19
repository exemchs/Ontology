import {
  getGpuCards,
  getGpuTimeSeries,
  getGpuHeatmap,
  getGpuComparison,
  getGpuHealthIssues,
  getGpuProcesses,
} from "@/data/gpu-data";
import { GpuSummaryHeader } from "@/components/gpu/GpuSummaryHeader";
import { GpuCardGrid } from "@/components/gpu/GpuCardGrid";
import { GpuPerformanceTrend } from "@/components/gpu/GpuPerformanceTrend";
import { GpuHeatmapRidgelineToggle } from "@/components/gpu/GpuHeatmapRidgelineToggle";
import { GpuComparisonBar } from "@/components/gpu/GpuComparisonBar";
import { GpuHealthIssues } from "@/components/gpu/GpuHealthIssues";
import { GpuProcessesTable } from "@/components/gpu/GpuProcessesTable";

export const metadata = {
  title: "GPU Monitoring - eXemble Ontology",
};

const gpus = getGpuCards();
const timeSeries = getGpuTimeSeries();
const heatmapData = getGpuHeatmap();
const comparisonData = getGpuComparison();
const healthIssues = getGpuHealthIssues();
const processes = getGpuProcesses();

export default function GpuPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <GpuSummaryHeader gpus={gpus} />
      <GpuCardGrid gpus={gpus} />
      <GpuPerformanceTrend series={timeSeries} />
      <GpuHeatmapRidgelineToggle
        heatmapData={heatmapData}
        timeSeriesData={timeSeries}
      />
      <GpuComparisonBar data={comparisonData} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GpuHealthIssues issues={healthIssues} />
        <GpuProcessesTable processes={processes} />
      </div>
    </div>
  );
}
