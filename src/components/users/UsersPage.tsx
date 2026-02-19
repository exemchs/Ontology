"use client";

import { PageShell } from "@/components/ds/PageShell";
import { UserTable } from "@/components/users/UserTable";
import { NamespaceTable } from "@/components/users/NamespaceTable";
import { AccessControlTab } from "@/components/users/AccessControlTab";
import { MenuConfigTab } from "@/components/users/MenuConfigTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRole } from "@/contexts/RoleContext";
import { ShieldAlert } from "lucide-react";

function AdminGate({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
      <ShieldAlert className="size-8" />
      <p className="text-sm font-medium">Requires admin access</p>
      <p className="text-xs">{label} settings are restricted to administrators.</p>
    </div>
  );
}

export function UsersPage() {
  const { currentRole } = useRole();
  const isSuperAdmin = currentRole === "super_admin";

  return (
    <PageShell
      title="User Management"
      description="Manage user roles, PII access permissions, and namespaces."
    >
      <Tabs defaultValue="users">
        <TabsList className="h-8">
          <TabsTrigger value="namespaces" className="text-xs px-3">
            Namespaces
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs px-3">
            Users
          </TabsTrigger>
          <TabsTrigger value="access-control" className="text-xs px-3">
            Access Control
          </TabsTrigger>
          <TabsTrigger value="menu-config" className="text-xs px-3">
            Menu Config
          </TabsTrigger>
        </TabsList>
        <TabsContent value="namespaces" className="mt-3">
          <NamespaceTable />
        </TabsContent>
        <TabsContent value="users" className="mt-3">
          <UserTable />
        </TabsContent>
        <TabsContent value="access-control" className="mt-3">
          {isSuperAdmin ? <AccessControlTab /> : <AdminGate label="Access Control" />}
        </TabsContent>
        <TabsContent value="menu-config" className="mt-3">
          {isSuperAdmin ? <MenuConfigTab /> : <AdminGate label="Menu Config" />}
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
