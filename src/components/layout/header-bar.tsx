"use client";

import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { breadcrumbMap } from "@/lib/navigation";
import { NamespaceSelector } from "@/components/layout/NamespaceSelector";
import { AlertBell } from "@/components/layout/AlertBell";
import { useRole } from "@/contexts/RoleContext";
import type { Role } from "@/types";

// ── Role badge color mapping ────────────────────────────────────────────────

const roleBadgeConfig: Record<Role, { variant: "destructive" | "default" | "secondary" | "outline"; className: string }> = {
  super_admin: { variant: "destructive", className: "" },
  service_app: { variant: "default", className: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400" },
  data_analyst: { variant: "secondary", className: "" },
  auditor: { variant: "outline", className: "" },
};

function formatRoleName(role: Role): string {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function HeaderBar() {
  const pathname = usePathname();
  const crumb = breadcrumbMap[pathname];
  const { currentRole } = useRole();
  const badgeCfg = roleBadgeConfig[currentRole];

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/40 px-4">
      {/* Left side: sidebar trigger + breadcrumb */}
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-2 h-4" />
      {crumb && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>{crumb.group}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{crumb.page}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Right side: namespace + role badge + bell + Cmd+K hint */}
      <div className="ml-auto flex items-center gap-2">
        <NamespaceSelector />
        <Badge
          variant={badgeCfg.variant}
          className={`text-[10px] px-1.5 py-0 ${badgeCfg.className}`}
        >
          {formatRoleName(currentRole)}
        </Badge>
        <AlertBell />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            document.dispatchEvent(
              new KeyboardEvent("keydown", {
                key: "k",
                metaKey: true,
                bubbles: true,
              })
            );
          }}
          className="h-7 gap-1 px-2 text-xs text-muted-foreground"
        >
          <kbd className="font-mono text-[10px]">⌘K</kbd>
        </Button>
      </div>
    </header>
  );
}
