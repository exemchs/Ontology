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
    dot: "bg-green-500",
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
    label: "Healthy",
  },
  warning: {
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    label: "Warning",
  },
  error: {
    dot: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
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
