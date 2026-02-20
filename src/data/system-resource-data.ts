// src/data/system-resource-data.ts

import type { TimeSeriesPoint } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SystemResourceGauge {
  label: string;          // "CPU", "Memory", "Disk"
  percent: number;        // 0-100
  used: number;           // 현재 사용량 (실제 단위)
  total: number;          // 전체 용량 (실제 단위)
  unit: string;           // "Cores", "GB", "GB"
  color: string;          // CSS variable
}

export interface ServerResourceTrend {
  serverName: string;
  color: string;
  data: TimeSeriesPoint[];
}

export interface SystemResourceTrends {
  cpu: ServerResourceTrend[];
  memory: ServerResourceTrend[];
  disk: ServerResourceTrend[];
}

// ── Jitter Utility ─────────────────────────────────────────────────────────

function addJitter(value: number, percent: number = 5): number {
  const range = value * (percent / 100);
  return value + (Math.random() - 0.5) * 2 * range;
}

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ── Server Definitions ─────────────────────────────────────────────────────

interface ServerSeed {
  name: string;
  cpuTotal: number;      // Cores
  cpuUsed: number;       // Cores
  memoryTotal: number;   // GB
  memoryUsed: number;    // GB
  diskTotal: number;     // GB
  diskUsed: number;      // GB
}

const serverSeeds: ServerSeed[] = [
  { name: "Server-A", cpuTotal: 8, cpuUsed: 0.12, memoryTotal: 32, memoryUsed: 25.6, diskTotal: 500, diskUsed: 1.2 },
  { name: "Server-B", cpuTotal: 8, cpuUsed: 0.10, memoryTotal: 32, memoryUsed: 23.8, diskTotal: 500, diskUsed: 1.0 },
  { name: "Server-C", cpuTotal: 8, cpuUsed: 0.08, memoryTotal: 16, memoryUsed: 12.4, diskTotal: 250, diskUsed: 0.8 },
  { name: "Server-D", cpuTotal: 4, cpuUsed: 0.06, memoryTotal: 16, memoryUsed: 13.1, diskTotal: 250, diskUsed: 0.6 },
  { name: "Server-E", cpuTotal: 4, cpuUsed: 0.04, memoryTotal: 16, memoryUsed: 10.9, diskTotal: 200, diskUsed: 0.4 },
];

const serverColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

// ── Gauge Data (Aggregated) ────────────────────────────────────────────────

export function getSystemResourceGauges(): SystemResourceGauge[] {
  const totalCpu = serverSeeds.reduce((sum, s) => sum + s.cpuTotal, 0);
  const usedCpu = serverSeeds.reduce((sum, s) => sum + s.cpuUsed, 0);
  const totalMem = serverSeeds.reduce((sum, s) => sum + s.memoryTotal, 0);
  const usedMem = serverSeeds.reduce((sum, s) => sum + s.memoryUsed, 0);
  const totalDisk = serverSeeds.reduce((sum, s) => sum + s.diskTotal, 0);
  const usedDisk = serverSeeds.reduce((sum, s) => sum + s.diskUsed, 0);

  return [
    {
      label: "CPU",
      percent: round((usedCpu / totalCpu) * 100, 1),
      used: round(addJitter(usedCpu, 5), 2),
      total: totalCpu,
      unit: "Cores",
      color: "var(--color-chart-1)",
    },
    {
      label: "Memory",
      percent: round((usedMem / totalMem) * 100, 1),
      used: round(addJitter(usedMem, 5), 1),
      total: totalMem,
      unit: "GB",
      color: "var(--color-chart-2)",
    },
    {
      label: "Disk",
      percent: round((usedDisk / totalDisk) * 100, 1),
      used: round(addJitter(usedDisk, 5), 1),
      total: totalDisk,
      unit: "GB",
      color: "var(--color-chart-3)",
    },
  ];
}

// ── Trend Time Series (per-server) ─────────────────────────────────────────

function generateServerTimeSeries(
  baseValue: number,
  points: number,
  intervalMinutes: number = 1
): TimeSeriesPoint[] {
  const now = new Date();
  return Array.from({ length: points }, (_, i) => {
    const time = new Date(now.getTime() - (points - 1 - i) * intervalMinutes * 60 * 1000);
    const drift = Math.sin((i / points) * Math.PI * 3) * baseValue * 0.08;
    const value = round(Math.max(0, addJitter(baseValue + drift, 5)), 3);
    return { time, value };
  });
}

export function getSystemResourceTrends(): SystemResourceTrends {
  const points = 8; // 7분 범위 (0~7), 1분 간격

  return {
    cpu: serverSeeds.map((s, i) => ({
      serverName: s.name,
      color: serverColors[i],
      data: generateServerTimeSeries(s.cpuUsed, points, 1),
    })),
    memory: serverSeeds.map((s, i) => ({
      serverName: s.name,
      color: serverColors[i],
      data: generateServerTimeSeries(s.memoryUsed, points, 1),
    })),
    disk: serverSeeds.map((s, i) => ({
      serverName: s.name,
      color: serverColors[i],
      data: generateServerTimeSeries(s.diskUsed, points, 1),
    })),
  };
}
