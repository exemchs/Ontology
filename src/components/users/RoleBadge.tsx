"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

// ── Role Display Config ───────────────────────────────────────────────────

const ROLE_CONFIG: Record<
  Role,
  { label: string; className: string }
> = {
  super_admin: {
    label: "Super Admin",
    className:
      "bg-red-100 text-red-700 border-transparent dark:bg-red-900/30 dark:text-red-400",
  },
  service_app: {
    label: "Service App",
    className:
      "bg-blue-100 text-blue-700 border-transparent dark:bg-blue-900/30 dark:text-blue-400",
  },
  data_analyst: {
    label: "Data Analyst",
    className:
      "bg-gray-100 text-gray-700 border-transparent dark:bg-gray-800 dark:text-gray-300",
  },
  auditor: {
    label: "Auditor",
    className:
      "border-current bg-transparent text-muted-foreground",
  },
};

// ── Component ─────────────────────────────────────────────────────────────

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role];

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
      data-testid={`role-badge-${role}`}
    >
      {config.label}
    </Badge>
  );
}
