"use client";

import { UserTable } from "@/components/users/UserTable";
import { TooltipProvider } from "@/components/ui/tooltip";

export function UsersPage() {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-6 p-6" data-testid="users-page">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user roles and PII access permissions. Role changes are
            reflected in client state only (POC).
          </p>
        </div>

        {/* User Table */}
        <UserTable />
      </div>
    </TooltipProvider>
  );
}
