"use client";

import { PageShell } from "@/components/ds/PageShell";
import { UserTable } from "@/components/users/UserTable";
import { NamespaceTable } from "@/components/users/NamespaceTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRole } from "@/contexts/RoleContext";

export function UsersPage() {
  const { currentRole } = useRole();
  const isSuperAdmin = currentRole === "super_admin";

  return (
    <PageShell
      title="User Management"
      description="Manage user roles, PII access permissions, and namespaces."
    >
      {isSuperAdmin ? (
        <Tabs defaultValue="users">
          <TabsList className="h-8">
            <TabsTrigger value="users" className="text-xs px-3">
              Users
            </TabsTrigger>
            <TabsTrigger value="namespaces" className="text-xs px-3">
              Namespaces
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="mt-3">
            <UserTable />
          </TabsContent>
          <TabsContent value="namespaces" className="mt-3">
            <NamespaceTable />
          </TabsContent>
        </Tabs>
      ) : (
        <UserTable />
      )}
    </PageShell>
  );
}
