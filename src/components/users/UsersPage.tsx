"use client";

import { PageShell } from "@/components/ds/PageShell";
import { UserTable } from "@/components/users/UserTable";

export function UsersPage() {
  return (
    <PageShell
      title="User Management"
      description="Manage user roles and PII access permissions. Role changes are reflected in client state only (POC)."
    >
      <UserTable />
    </PageShell>
  );
}
