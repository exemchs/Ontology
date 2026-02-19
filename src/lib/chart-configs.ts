import type { ChartConfig } from "@/components/ui/chart"

export const timeSeriesConfig = {
  requestRate: { label: "Agent Request Rate", color: "var(--chart-1)" },
  queryQps: { label: "Query QPS", color: "var(--chart-2)" },
} satisfies ChartConfig

export const resourceConfig = {
  cpu: { label: "CPU", color: "var(--chart-1)" },
  memory: { label: "Memory", color: "var(--chart-2)" },
  disk: { label: "Disk", color: "var(--chart-3)" },
} satisfies ChartConfig

export const gaugeConfig = {
  value: { label: "Usage", color: "var(--chart-1)" },
} satisfies ChartConfig

export const gpuConfig = {
  "GPU-0": { label: "GPU-0", color: "var(--chart-1)" },
  "GPU-1": { label: "GPU-1", color: "var(--chart-2)" },
  "GPU-2": { label: "GPU-2", color: "var(--chart-3)" },
  "GPU-3": { label: "GPU-3", color: "var(--chart-4)" },
} satisfies ChartConfig

export const gpuComparisonConfig = {
  utilization: { label: "Utilization", color: "var(--chart-1)" },
  memory: { label: "Memory", color: "var(--chart-2)" },
  temperature: { label: "Temperature", color: "var(--chart-3)" },
  power: { label: "Power", color: "var(--chart-4)" },
} satisfies ChartConfig

export const shardConfig = {
  predicates: { label: "Predicates", color: "var(--chart-1)" },
  size: { label: "Size (MB)", color: "var(--chart-2)" },
} satisfies ChartConfig

export const typeDistributionConfig = {
  records: { label: "Records", color: "var(--chart-1)" },
  queries: { label: "Queries", color: "var(--chart-2)" },
} satisfies ChartConfig
