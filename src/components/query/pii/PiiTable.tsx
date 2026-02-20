"use client";

import { useMemo } from "react";
import { EyeOff, ShieldAlert, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { PiiFieldRule, PiiAction } from "@/data/pii-config";
import { applyPiiMasking } from "@/data/pii-config";
import type { Role, PiiLevel } from "@/types";

// ── PII Level badge variant mapping ──────────────────────────────────────────

function getLevelBadgeVariant(
  level: PiiLevel
): "destructive" | "default" | "secondary" | "outline" {
  switch (level) {
    case "highest":
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    case "none":
      return "outline";
  }
}

// ── Cell styling by action ───────────────────────────────────────────────────

function getCellStyle(action: PiiAction): {
  bgClass: string;
  icon: React.ReactNode | null;
} {
  switch (action) {
    case "plain":
      return { bgClass: "", icon: null };
    case "masked":
      return {
        bgClass: "bg-[var(--status-warning)]/10",
        icon: <EyeOff className="size-3.5 text-[var(--status-warning)] shrink-0" />,
      };
    case "anonymized":
      return {
        bgClass: "bg-[var(--status-critical)]/10",
        icon: <ShieldAlert className="size-3.5 text-[var(--status-critical)] shrink-0" />,
      };
    case "denied":
      return {
        bgClass: "bg-[var(--status-critical)]/10",
        icon: <Lock className="size-3.5 text-[var(--status-critical)] shrink-0" />,
      };
  }
}

// ── Component ────────────────────────────────────────────────────────────────

interface PiiTableProps {
  data: Record<string, string>[];
  fieldConfigs: PiiFieldRule[];
  role: Role;
}

export function PiiTable({ data, fieldConfigs, role }: PiiTableProps) {
  // Compute masked data whenever role, data, or field configs change
  const maskedData = useMemo(
    () =>
      data.map((row) => {
        const maskedRow: Record<string, { value: string; action: PiiAction }> =
          {};
        for (const [field, value] of Object.entries(row)) {
          const config = fieldConfigs.find((c) => c.field === field);
          const action: PiiAction = config?.actions[role] ?? "plain";
          maskedRow[field] = {
            value: applyPiiMasking(value, field, action),
            action,
          };
        }
        return maskedRow;
      }),
    [data, fieldConfigs, role]
  );

  // Use field order from configs (ensures consistent column ordering)
  const fields = fieldConfigs.map((c) => c.field);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {fieldConfigs.map((config) => (
            <TableHead key={config.field}>
              <div className="flex items-center gap-1.5">
                <span>{config.field}</span>
                <Badge
                  variant={getLevelBadgeVariant(config.level)}
                  className="text-[10px] px-1.5 py-0"
                >
                  {config.level}
                </Badge>
              </div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {maskedData.map((row, rowIdx) => (
          <TableRow key={rowIdx}>
            {fields.map((field) => {
              const cell = row[field];
              if (!cell) return <TableCell key={field} />;
              const { bgClass, icon } = getCellStyle(cell.action);
              return (
                <TableCell
                  key={field}
                  className={cn(
                    "transition-colors duration-200",
                    bgClass
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    {icon}
                    <span className="truncate max-w-[200px]">{cell.value}</span>
                  </div>
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
