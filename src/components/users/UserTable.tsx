"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleTooltip } from "@/components/users/RoleTooltip";
import { useRole } from "@/contexts/RoleContext";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import type { Role, User } from "@/types";

// ── Role Color Dots ──────────────────────────────────────────────────────

const ROLE_DOT_COLORS: Record<Role, string> = {
  super_admin: "bg-red-500",
  service_app: "bg-blue-500",
  data_analyst: "bg-gray-400 dark:bg-gray-500",
  auditor: "bg-muted-foreground",
};

// ── Role Options ──────────────────────────────────────────────────────────

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "service_app", label: "Service App" },
  { value: "data_analyst", label: "Data Analyst" },
  { value: "auditor", label: "Auditor" },
];

// ── Relative Time Formatter ───────────────────────────────────────────────

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "Never";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// ── Component ─────────────────────────────────────────────────────────────

export function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { setCurrentRole } = useRole();

  // ── Fetch users from Supabase ─────────────────────────────────────

  useEffect(() => {
    async function fetchUsers() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("users")
        .select("id, username, email, role, last_login")
        .order("id");

      if (error) {
        console.error("Failed to fetch users:", error.message);
        setLoading(false);
        return;
      }

      // Map snake_case DB fields to camelCase TS
      const mapped: User[] = (data ?? []).map((row) => ({
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role as Role,
        lastLogin: row.last_login,
        createdAt: "",
      }));

      // Sort admins first for visual grouping
      mapped.sort((a, b) => {
        const aAdmin = a.role === "super_admin" ? 0 : 1;
        const bAdmin = b.role === "super_admin" ? 0 : 1;
        return aAdmin - bAdmin;
      });

      setUsers(mapped);
      setLoading(false);
    }

    fetchUsers();
  }, []);

  // ── Role Change Handler ───────────────────────────────────────────

  function handleRoleChange(userId: number, newRole: Role) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    // Update global role state to simulate "viewing as this role"
    setCurrentRole(newRole);
  }

  // ── Loading State ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-3" data-testid="user-table-skeleton">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <Table data-testid="user-table">
      <TableHeader>
        <TableRow>
          <TableHead>Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Last Login</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow
            key={user.id}
            className={cn(user.role === "super_admin" && "bg-primary/[0.03]")}
          >
            <TableCell className="font-medium">{user.username}</TableCell>
            <TableCell className="text-muted-foreground">
              {user.email}
            </TableCell>
            <TableCell>
              <RoleTooltip role={user.role}>
                <Select
                  value={user.role}
                  onValueChange={(value) =>
                    handleRoleChange(user.id, value as Role)
                  }
                >
                  <SelectTrigger size="sm" className="h-7 w-[140px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-1.5">
                          <span className={cn("w-2 h-2 rounded-full shrink-0", ROLE_DOT_COLORS[opt.value])} />
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </RoleTooltip>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatRelativeTime(user.lastLogin)}
            </TableCell>
          </TableRow>
        ))}
        {users.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
              No users found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
