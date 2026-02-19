"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RoleSelector } from "@/components/query/pii/RoleSelector";
import { RoleInfoBanner } from "@/components/query/pii/RoleInfoBanner";
import { PiiTable } from "@/components/query/pii/PiiTable";
import { getPiiDemoData } from "@/data/query-data";
import { fabPiiFieldConfigs, generalPiiFieldConfigs } from "@/data/pii-config";
import type { Role } from "@/types";

// ── Load demo data ───────────────────────────────────────────────────────────

const piiDemoData = getPiiDemoData();

// ── Component ────────────────────────────────────────────────────────────────

export function PiiDemo() {
  const [selectedRole, setSelectedRole] = useState<Role>("super_admin");

  return (
    <div className="flex flex-col gap-3">
      {/* Header: Role Selector */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold">PII Masking Demo</h3>
        <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
      </div>

      {/* Info Banner */}
      <RoleInfoBanner role={selectedRole} />

      {/* Tabs: FAB Equipment / General PII */}
      <Tabs defaultValue="fab" className="w-full">
        <TabsList>
          <TabsTrigger value="fab">
            FAB Equipment ({piiDemoData.fab.length})
          </TabsTrigger>
          <TabsTrigger value="general">
            General PII ({piiDemoData.general.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="fab">
          <PiiTable
            data={piiDemoData.fab as unknown as Record<string, string>[]}
            fieldConfigs={fabPiiFieldConfigs}
            role={selectedRole}
          />
        </TabsContent>
        <TabsContent value="general">
          <PiiTable
            data={piiDemoData.general as unknown as Record<string, string>[]}
            fieldConfigs={generalPiiFieldConfigs}
            role={selectedRole}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
