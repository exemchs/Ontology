"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────

interface Group {
  name: string;
  description: string;
  members: number;
  created: string;
}

type Permission =
  | "read_schema"
  | "write_schema"
  | "execute_query"
  | "view_pii"
  | "manage_users"
  | "system_config";

const PERMISSIONS: { key: Permission; label: string }[] = [
  { key: "read_schema", label: "Read Schema" },
  { key: "write_schema", label: "Write Schema" },
  { key: "execute_query", label: "Execute Query" },
  { key: "view_pii", label: "View PII" },
  { key: "manage_users", label: "Manage Users" },
  { key: "system_config", label: "System Config" },
];

// ── Mock Data ────────────────────────────────────────────────────────────

const INITIAL_GROUPS: Group[] = [
  { name: "Administrators", description: "Full system access", members: 3, created: "2025-01-15" },
  { name: "Data Engineers", description: "Schema and query access", members: 5, created: "2025-02-01" },
  { name: "Analysts", description: "Read and query access", members: 8, created: "2025-03-10" },
  { name: "Auditors", description: "Read and PII audit access", members: 2, created: "2025-04-22" },
];

const INITIAL_PERMISSIONS: Record<string, Set<Permission>> = {
  Administrators: new Set(["read_schema", "write_schema", "execute_query", "view_pii", "manage_users", "system_config"]),
  "Data Engineers": new Set(["read_schema", "write_schema", "execute_query"]),
  Analysts: new Set(["read_schema", "execute_query"]),
  Auditors: new Set(["read_schema", "view_pii"]),
};

// ── Component ────────────────────────────────────────────────────────────

export function AccessControlTab() {
  const [permissionMap, setPermissionMap] = useState<Record<string, Set<Permission>>>(() => {
    // Deep clone the initial data
    const clone: Record<string, Set<Permission>> = {};
    for (const [key, val] of Object.entries(INITIAL_PERMISSIONS)) {
      clone[key] = new Set(val);
    }
    return clone;
  });

  function handlePermissionToggle(group: string, perm: Permission) {
    setPermissionMap((prev) => {
      const next = { ...prev };
      const perms = new Set(prev[group]);
      if (perms.has(perm)) {
        perms.delete(perm);
      } else {
        perms.add(perm);
      }
      next[group] = perms;
      return next;
    });
    toast.info("Changes not persisted in POC");
  }

  function handleAction() {
    toast.info("Action not available in POC");
  }

  return (
    <div className="space-y-6">
      {/* ── Groups Section ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Groups</CardTitle>
              <CardDescription>Manage user groups and their members</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={handleAction}>
              Add Group
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Members</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INITIAL_GROUPS.map((group) => (
                <TableRow key={group.name}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell className="text-muted-foreground">{group.description}</TableCell>
                  <TableCell className="text-right tabular-nums">{group.members}</TableCell>
                  <TableCell className="text-muted-foreground">{group.created}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleAction}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={handleAction}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Permissions Matrix ──────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Permissions Matrix</CardTitle>
          <CardDescription>Configure group permissions across system capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Group</TableHead>
                {PERMISSIONS.map((p) => (
                  <TableHead key={p.key} className="text-center text-xs">
                    {p.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {INITIAL_GROUPS.map((group) => (
                <TableRow key={group.name}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  {PERMISSIONS.map((p) => (
                    <TableCell key={p.key} className="text-center">
                      <Checkbox
                        checked={permissionMap[group.name]?.has(p.key) ?? false}
                        onCheckedChange={() => handlePermissionToggle(group.name, p.key)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
