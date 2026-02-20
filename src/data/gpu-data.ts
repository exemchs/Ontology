// =============================================================================
// eXemble Ontology Platform - GPU Monitoring Page Data
// =============================================================================
// Hardcoded data for GPU cards, performance trends, heatmap, and comparison.
// =============================================================================

import type { Gpu, GpuStatus, TimeSeriesPoint, GpuHealthIssue, GpuProcess } from "@/types";

// ── Jitter Utility ──────────────────────────────────────────────────────────

function addJitter(value: number, percent: number = 5): number {
  const range = value * (percent / 100);
  return value + (Math.random() - 0.5) * 2 * range;
}

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ── GPU Seed Data ───────────────────────────────────────────────────────────

interface GpuSeed {
  id: number;
  nodeId: number;
  name: string;
  model: string;
  status: GpuStatus;
  utilization: number;
  memoryUsed: number;
  memoryTotal: number;
  temperature: number;
  powerUsage: number;
  powerLimit: number;
}

const gpuSeeds: GpuSeed[] = [
  { id: 1, nodeId: 10, name: "GPU-0", model: "NVIDIA A100 80GB", status: "healthy", utilization: 72.5, memoryUsed: 48.2, memoryTotal: 80.0, temperature: 67.0, powerUsage: 285.0, powerLimit: 400.0 },
  { id: 2, nodeId: 10, name: "GPU-1", model: "NVIDIA A100 80GB", status: "healthy", utilization: 68.3, memoryUsed: 45.1, memoryTotal: 80.0, temperature: 64.0, powerUsage: 270.0, powerLimit: 400.0 },
  { id: 3, nodeId: 11, name: "GPU-2", model: "NVIDIA A100 40GB", status: "warning", utilization: 85.1, memoryUsed: 35.8, memoryTotal: 40.0, temperature: 78.0, powerUsage: 245.0, powerLimit: 300.0 },
  { id: 4, nodeId: 11, name: "GPU-3", model: "NVIDIA A100 40GB", status: "healthy", utilization: 55.7, memoryUsed: 22.4, memoryTotal: 40.0, temperature: 58.0, powerUsage: 180.0, powerLimit: 300.0 },
];

// ── Exported Functions ──────────────────────────────────────────────────────

export function getGpuCards(): Gpu[] {
  return gpuSeeds.map((seed) => ({
    id: seed.id,
    nodeId: seed.nodeId,
    name: seed.name,
    model: seed.model,
    status: seed.status,
    utilization: round(addJitter(seed.utilization, 3), 1),
    memoryUsed: round(addJitter(seed.memoryUsed, 3), 1),
    memoryTotal: seed.memoryTotal,
    temperature: round(addJitter(seed.temperature, 3), 0),
    powerUsage: round(addJitter(seed.powerUsage, 3), 0),
    powerLimit: seed.powerLimit,
  }));
}

// ── GPU Time Series (Multi-metric) ──────────────────────────────────────────

export type GpuMetricType = "utilization" | "temperature" | "power" | "memory";

export interface GpuTimeSeries {
  gpuName: string;
  metric: GpuMetricType;
  color: string;
  data: TimeSeriesPoint[];
}

function generateGpuTimeSeries(
  baseValue: number,
  points: number,
  intervalMinutes: number = 5
): TimeSeriesPoint[] {
  const now = new Date();
  return Array.from({ length: points }, (_, i) => {
    const time = new Date(
      now.getTime() - (points - 1 - i) * intervalMinutes * 60 * 1000
    );
    const drift = Math.sin((i / points) * Math.PI * 3) * baseValue * 0.05;
    const value = round(addJitter(baseValue + drift, 4), 1);
    return { time, value: Math.max(0, value) };
  });
}

const metricColors: Record<GpuMetricType, string> = {
  utilization: "var(--color-chart-1)",
  temperature: "var(--color-chart-3)",
  power: "var(--color-chart-5)",
  memory: "var(--color-chart-2)",
};

export function getGpuTimeSeries(): GpuTimeSeries[] {
  const series: GpuTimeSeries[] = [];
  const metrics: { type: GpuMetricType; seedKey: keyof GpuSeed }[] = [
    { type: "utilization", seedKey: "utilization" },
    { type: "temperature", seedKey: "temperature" },
    { type: "power", seedKey: "powerUsage" },
    { type: "memory", seedKey: "memoryUsed" },
  ];

  for (const gpu of gpuSeeds) {
    for (const metric of metrics) {
      series.push({
        gpuName: gpu.name,
        metric: metric.type,
        color: metricColors[metric.type],
        data: generateGpuTimeSeries(gpu[metric.seedKey] as number, 24, 5),
      });
    }
  }

  return series;
}

// ── GPU Heatmap (GPU x Time matrix) ─────────────────────────────────────────

export interface GpuHeatmapCell {
  gpuName: string;
  timeIndex: number;
  time: Date;
  utilization: number;
}

export function getGpuHeatmap(): GpuHeatmapCell[] {
  const now = new Date();
  const cells: GpuHeatmapCell[] = [];

  for (const gpu of gpuSeeds) {
    for (let t = 0; t < 24; t++) {
      const time = new Date(now.getTime() - (23 - t) * 5 * 60 * 1000);
      const drift = Math.sin((t / 24) * Math.PI * 2) * gpu.utilization * 0.1;
      cells.push({
        gpuName: gpu.name,
        timeIndex: t,
        time,
        utilization: round(addJitter(gpu.utilization + drift, 5), 1),
      });
    }
  }

  return cells;
}

// ── GPU Comparison Bar Chart ────────────────────────────────────────────────

export interface GpuComparisonItem {
  gpuName: string;
  model: string;
  utilization: number;
  memoryPercent: number;
  temperature: number;
  powerPercent: number;
}

export function getGpuComparison(): GpuComparisonItem[] {
  return gpuSeeds.map((gpu) => ({
    gpuName: gpu.name,
    model: gpu.model,
    utilization: round(addJitter(gpu.utilization, 3), 1),
    memoryPercent: round(addJitter((gpu.memoryUsed / gpu.memoryTotal) * 100, 3), 1),
    temperature: round(addJitter(gpu.temperature, 3), 0),
    powerPercent: round(addJitter((gpu.powerUsage / gpu.powerLimit) * 100, 3), 1),
  }));
}

// ── GPU Health Issues ──────────────────────────────────────────────────────

export function getGpuHealthIssues(): GpuHealthIssue[] {
  const now = new Date();
  return [
    {
      id: 1,
      gpuName: "GPU-2",
      severity: "error",
      message: "Temperature exceeding threshold (78\u00b0C > 75\u00b0C limit)",
      timestamp: new Date(now.getTime() - 25 * 60 * 1000), // 25 min ago
    },
    {
      id: 2,
      gpuName: "GPU-2",
      severity: "warning",
      message: "Memory utilization approaching capacity (89.5%)",
      timestamp: new Date(now.getTime() - 1.2 * 60 * 60 * 1000), // ~1h ago
    },
    {
      id: 3,
      gpuName: "GPU-0",
      severity: "warning",
      message: "ECC single-bit error count increased to 14 in last 24h",
      timestamp: new Date(now.getTime() - 2.5 * 60 * 60 * 1000), // ~2.5h ago
    },
    {
      id: 4,
      gpuName: "GPU-1",
      severity: "info",
      message: "Driver update available: 535.129.03 \u2192 535.154.05",
      timestamp: new Date(now.getTime() - 3.1 * 60 * 60 * 1000), // ~3h ago
    },
    {
      id: 5,
      gpuName: "GPU-3",
      severity: "info",
      message: "Power efficiency improved 3.2% after thermal throttle cleared",
      timestamp: new Date(now.getTime() - 4.0 * 60 * 60 * 1000), // ~4h ago
    },
    {
      id: 6,
      gpuName: "GPU-0",
      severity: "info",
      message: "NVLink bandwidth test completed: 248.3 GB/s (nominal)",
      timestamp: new Date(now.getTime() - 5.5 * 60 * 60 * 1000), // ~5.5h ago
    },
  ];
}

// ── GPU Processes ──────────────────────────────────────────────────────────

const processSeedData: Omit<GpuProcess, "memoryUsed" | "gpuUtilization">[] = [
  { pid: 48291, gpuName: "GPU-0", processName: "python3 train_model.py", type: "C" },
  { pid: 48305, gpuName: "GPU-0", processName: "tensorboard", type: "G" },
  { pid: 51023, gpuName: "GPU-1", processName: "python3 inference.py", type: "C" },
  { pid: 51102, gpuName: "GPU-1", processName: "nvidia-smi monitor", type: "C" },
  { pid: 53410, gpuName: "GPU-2", processName: "python3 fine_tune.py", type: "C" },
  { pid: 53488, gpuName: "GPU-2", processName: "python3 data_preprocess.py", type: "C" },
  { pid: 55102, gpuName: "GPU-3", processName: "python3 evaluate.py", type: "C" },
];

const processMemorySeeds = [31200, 450, 24500, 210, 32000, 8900, 18200];
const processUtilSeeds = [72, 2, 65, 1, 82, 35, 48];

export function getGpuProcesses(): GpuProcess[] {
  return processSeedData.map((proc, i) => ({
    ...proc,
    memoryUsed: round(addJitter(processMemorySeeds[i], 5), 0),
    gpuUtilization: round(addJitter(processUtilSeeds[i], 5), 1),
  }));
}

// ── GPU Funnel Data ─────────────────────────────────────────────────────────

export interface GpuFunnelStage {
  label: string;
  value: number;
  color: string;
}

export function getGpuFunnelData(): GpuFunnelStage[] {
  return [
    { label: "Total GPUs", value: 16, color: "var(--color-chart-1)" },
    { label: "Allocated", value: 12, color: "var(--color-chart-2)" },
    { label: "Active", value: 9, color: "var(--color-chart-3)" },
    { label: "Effective", value: 6, color: "var(--color-chart-4)" },
  ];
}

// ── GPU Detail Data (DCGM Extended Metrics) ──────────────────────────────────

export interface GpuDetailData {
  gpuId: number;
  smClock: number;       // MHz
  memoryClock: number;   // MHz
  pcieTxBandwidth: number; // GB/s
  pcieRxBandwidth: number; // GB/s
  eccSingleBit: number;
  eccDoubleBit: number;
  persistenceMode: boolean;
}

export function getGpuDetailData(gpuId: string): GpuDetailData {
  const id = parseInt(gpuId, 10);
  const seeds: Record<number, Omit<GpuDetailData, "gpuId">> = {
    1: { smClock: 1410, memoryClock: 1215, pcieTxBandwidth: 22.4, pcieRxBandwidth: 21.8, eccSingleBit: 14, eccDoubleBit: 0, persistenceMode: true },
    2: { smClock: 1395, memoryClock: 1215, pcieTxBandwidth: 21.9, pcieRxBandwidth: 22.1, eccSingleBit: 3, eccDoubleBit: 0, persistenceMode: true },
    3: { smClock: 1380, memoryClock: 1215, pcieTxBandwidth: 20.5, pcieRxBandwidth: 19.8, eccSingleBit: 7, eccDoubleBit: 0, persistenceMode: false },
    4: { smClock: 1410, memoryClock: 1215, pcieTxBandwidth: 22.0, pcieRxBandwidth: 21.5, eccSingleBit: 1, eccDoubleBit: 0, persistenceMode: true },
  };

  const seed = seeds[id] ?? seeds[1];
  return {
    gpuId: id,
    smClock: round(addJitter(seed.smClock, 2), 0),
    memoryClock: round(addJitter(seed.memoryClock, 1), 0),
    pcieTxBandwidth: round(addJitter(seed.pcieTxBandwidth, 3), 1),
    pcieRxBandwidth: round(addJitter(seed.pcieRxBandwidth, 3), 1),
    eccSingleBit: seed.eccSingleBit,
    eccDoubleBit: seed.eccDoubleBit,
    persistenceMode: seed.persistenceMode,
  };
}
