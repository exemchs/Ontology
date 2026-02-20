"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut, Search } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { navigationGroups } from "@/lib/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/contexts/RoleContext";
import { NamespaceSelector } from "@/components/layout/NamespaceSelector";
import { AlertBell } from "@/components/layout/AlertBell";
import type { Role } from "@/types";

// ── Role badge config ─────────────────────────────────────────────────────────

const roleBadgeConfig: Record<
  Role,
  { variant: "destructive" | "default" | "secondary" | "outline"; className: string }
> = {
  super_admin: { variant: "destructive", className: "" },
  service_app: {
    variant: "default",
    className:
      "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400",
  },
  data_analyst: { variant: "secondary", className: "" },
  auditor: { variant: "outline", className: "" },
};

function formatRoleName(role: Role): string {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AppSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const { state } = useSidebar();
  const { currentRole } = useRole();
  const isCollapsed = state === "collapsed";
  const badgeCfg = roleBadgeConfig[currentRole];

  const openCommandPalette = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        bubbles: true,
      })
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/40">
      {/* ── Header: Logo + collapse trigger ────────────────────────────── */}
      <SidebarHeader className="pb-0">
        <div className="flex h-7 items-center justify-between px-2">
          {!isCollapsed && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/logo-dark.png"
                alt="eXemble"
                className="hidden dark:block h-6 w-auto"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/logo-light.png"
                alt="eXemble"
                className="block dark:hidden h-6 w-auto"
              />
            </>
          )}
          <SidebarTrigger className="size-6" />
        </div>
      </SidebarHeader>

      {/* ── Search trigger (opens ⌘K) ──────────────────────────────────── */}
      <SidebarGroup className="py-0 px-2 pt-2">
        <SidebarGroupContent>
          {isCollapsed ? (
            <SidebarMenuButton
              tooltip="검색 (⌘K)"
              onClick={openCommandPalette}
              className="h-8"
            >
              <Search className="size-4" />
            </SidebarMenuButton>
          ) : (
            <button
              onClick={openCommandPalette}
              className="flex h-8 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-xs text-muted-foreground hover:bg-accent transition-colors"
            >
              <Search className="size-3.5 shrink-0" />
              <span>검색...</span>
              <kbd className="ml-auto font-mono text-[10px]">⌘K</kbd>
            </button>
          )}
        </SidebarGroupContent>
      </SidebarGroup>

      {/* ── Navigation groups ──────────────────────────────────────────── */}
      <SidebarContent>
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ── Footer: Namespace / Alert+Role / Theme / Logout ────────────── */}
      <SidebarFooter className="gap-1">
        <SidebarSeparator />

        {/* Namespace selector */}
        <SidebarMenu>
          <SidebarMenuItem>
            <NamespaceSelector />
          </SidebarMenuItem>
        </SidebarMenu>

        {/* AlertBell + RoleBadge row */}
        <div className="flex items-center gap-1 px-2 py-0.5">
          <AlertBell />
          {!isCollapsed && (
            <Badge
              variant={badgeCfg.variant}
              className={`text-[10px] px-1.5 py-0 ${badgeCfg.className}`}
            >
              {formatRoleName(currentRole)}
            </Badge>
          )}
        </div>

        {/* Theme toggle */}
        <div className="flex items-center gap-2 px-2 py-0.5">
          <Sun className="size-3.5 shrink-0 text-muted-foreground" />
          {!isCollapsed && (
            <>
              <Switch
                size="sm"
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
                aria-label="Toggle dark mode"
              />
              <Moon className="size-3.5 shrink-0 text-muted-foreground" />
            </>
          )}
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start gap-2 h-8"
        >
          <LogOut className="size-3.5" />
          {!isCollapsed && <span className="text-xs">로그아웃</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
