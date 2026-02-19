"use client";

import { Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SignalWidgetProps {
  label: string;
  value: number;
  status: "healthy" | "warning" | "error";
}

const statusColors: Record<SignalWidgetProps["status"], string> = {
  healthy: "text-green-500",
  warning: "text-amber-500",
  error: "text-red-500",
};

const statusLabels: Record<SignalWidgetProps["status"], string> = {
  healthy: "Healthy",
  warning: "Warning",
  error: "Error",
};

export default function SignalWidget({ label, value, status }: SignalWidgetProps) {
  return (
    <Card className="h-full py-3">
      <CardContent className="flex flex-col items-center justify-center gap-1 px-3">
        <Circle className={`h-5 w-5 fill-current ${statusColors[status]}`} />
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground truncate w-full text-center">
          {label}
        </span>
        <span className={`text-[10px] font-medium ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </CardContent>
    </Card>
  );
}
