"use client";

import { ShieldCheck, Server, BarChart3, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Role } from "@/types";

// ── Role metadata ────────────────────────────────────────────────────────────

interface RoleMeta {
  label: string;
  description: string;
  icon: React.ReactNode;
}

const roleMetaMap: Record<Role, RoleMeta> = {
  super_admin: {
    label: "Super Admin",
    description: "Full access",
    icon: <ShieldCheck className="size-4 text-emerald-500" />,
  },
  service_app: {
    label: "Service App",
    description: "Service account",
    icon: <Server className="size-4 text-blue-500" />,
  },
  data_analyst: {
    label: "Data Analyst",
    description: "Analyst access",
    icon: <BarChart3 className="size-4 text-amber-500" />,
  },
  auditor: {
    label: "Auditor",
    description: "Audit access",
    icon: <Eye className="size-4 text-red-500" />,
  },
};

const roles: Role[] = ["super_admin", "service_app", "data_analyst", "auditor"];

// ── Component ────────────────────────────────────────────────────────────────

interface RoleSelectorProps {
  selectedRole: Role;
  onRoleChange: (role: Role) => void;
}

export function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  const meta = roleMetaMap[selectedRole];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Role:</span>
      <Select value={selectedRole} onValueChange={(v) => onRoleChange(v as Role)}>
        <SelectTrigger size="sm" className="w-[200px]">
          <SelectValue>
            {meta.icon}
            <span>{meta.label}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => {
            const rm = roleMetaMap[role];
            return (
              <SelectItem key={role} value={role}>
                <span className="flex items-center gap-2">
                  {rm.icon}
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{rm.label}</span>
                    <span className="text-xs text-muted-foreground">{rm.description}</span>
                  </span>
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
