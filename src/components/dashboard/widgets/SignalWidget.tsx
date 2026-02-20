"use client";

import { Card, CardContent } from "@/components/ui/card";

interface SignalWidgetProps {
  label: string;
  value: number;
  status: "healthy" | "warning" | "error";
}

const statusConfig: Record<
  SignalWidgetProps["status"],
  { dot: string; text: string; bg: string; label: string }
> = {
  healthy: {
    dot: "bg-[var(--status-healthy)]",
    text: "text-[var(--status-healthy)]",
    bg: "bg-[var(--status-healthy)]/10",
    label: "Healthy",
  },
  warning: {
    dot: "bg-[var(--status-warning)]",
    text: "text-[var(--status-warning)]",
    bg: "bg-[var(--status-warning)]/10",
    label: "Warning",
  },
  error: {
    dot: "bg-[var(--status-critical)]",
    text: "text-[var(--status-critical)]",
    bg: "bg-[var(--status-critical)]/10",
    label: "Error",
  },
};

export default function SignalWidget({ label, value, status }: SignalWidgetProps) {
  const cfg = statusConfig[status];

  return (
    <Card className={`h-full py-3 ${cfg.bg}`}>
      <CardContent className="flex flex-col items-center justify-center gap-1.5 px-3">
        <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground truncate w-full text-center">
          {label}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.text} ${cfg.bg}`}
        >
          {cfg.label}
        </span>
      </CardContent>
    </Card>
  );
}
