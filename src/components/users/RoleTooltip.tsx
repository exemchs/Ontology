"use client";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import type { Role } from "@/types";

// ── PII Permission Summaries ──────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<Role, string> = {
  super_admin: "Full access to all PII fields (Plain text)",
  service_app: "API access, masked PII for phone/email",
  data_analyst: "Masked names/emails, denied phone/address",
  auditor: "Read-only audit, denied all PII fields",
};

// ── Component ─────────────────────────────────────────────────────────────

interface RoleTooltipProps {
  role: Role;
  children: React.ReactNode;
}

export function RoleTooltip({ role, children }: RoleTooltipProps) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild data-testid={`role-tooltip-${role}`}>
        <span className="cursor-help">{children}</span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={4}>
        <p className="text-xs">{ROLE_PERMISSIONS[role]}</p>
      </TooltipContent>
    </Tooltip>
  );
}
