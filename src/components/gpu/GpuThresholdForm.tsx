"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// ── Types ────────────────────────────────────────────────────────────────────

interface ThresholdRow {
  metric: string;
  unit: string;
  warning: number;
  critical: number;
}

// ── Default thresholds ───────────────────────────────────────────────────────

const defaultThresholds: ThresholdRow[] = [
  { metric: "Utilization", unit: "%", warning: 80, critical: 95 },
  { metric: "Temperature", unit: "\u00b0C", warning: 75, critical: 85 },
  { metric: "Memory", unit: "%", warning: 85, critical: 95 },
  { metric: "Power", unit: "W", warning: 250, critical: 300 },
];

// ── Component ────────────────────────────────────────────────────────────────

export function GpuThresholdForm() {
  const [thresholds, setThresholds] = useState<ThresholdRow[]>(defaultThresholds);

  function updateThreshold(
    index: number,
    field: "warning" | "critical",
    value: string
  ) {
    setThresholds((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: Number(value) || 0 } : row
      )
    );
  }

  function handleSave() {
    toast.success("Thresholds saved (mock)");
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Alert Thresholds</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_100px_100px_40px] gap-2 items-center text-xs text-muted-foreground">
            <span>Metric</span>
            <span className="text-center">Warning</span>
            <span className="text-center">Critical</span>
            <span>Unit</span>
          </div>

          {/* Metric rows */}
          {thresholds.map((row, i) => (
            <div
              key={row.metric}
              className="grid grid-cols-[1fr_100px_100px_40px] gap-2 items-center"
            >
              <Label className="text-sm font-medium">{row.metric}</Label>
              <Input
                type="number"
                value={row.warning}
                onChange={(e) => updateThreshold(i, "warning", e.target.value)}
                className="h-8 text-sm text-center"
              />
              <Input
                type="number"
                value={row.critical}
                onChange={(e) => updateThreshold(i, "critical", e.target.value)}
                className="h-8 text-sm text-center"
              />
              <span className="text-xs text-muted-foreground">{row.unit}</span>
            </div>
          ))}

          <Button onClick={handleSave} size="sm" className="mt-2 w-full">
            Save Thresholds
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
