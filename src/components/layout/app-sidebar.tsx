"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut, Search, User2, ChevronsUpDown } from "lucide-react";

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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { navigationGroups } from "@/lib/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/contexts/RoleContext";
import { NamespaceSelector } from "@/components/layout/NamespaceSelector";
import { AlertBell } from "@/components/layout/AlertBell";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";

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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/40">
      {/* ── Header: Logo + collapse trigger ────────────────────────────── */}
      <SidebarHeader>
        <div
          className={cn(
            "flex h-7 items-center px-2",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
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

      {/* ── Content: Search + Navigation ────────────────────────────────── */}
      <SidebarContent>
        {/* Search trigger (opens ⌘K) */}
        <SidebarGroup>
          <SidebarGroupContent>
            {isCollapsed ? (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="검색 (⌘K)"
                    onClick={openCommandPalette}
                  >
                    <Search className="size-4" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
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

        {/* Navigation groups */}
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

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <SidebarFooter>
        {/* Namespace selector */}
        <SidebarMenu>
          <SidebarMenuItem>
            <NamespaceSelector />
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Alert + Theme */}
        <SidebarMenu>
          <SidebarMenuItem>
            <AlertBell />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleTheme} tooltip="테마 전환">
              {theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
              <span>테마 전환</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User account */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={formatRoleName(currentRole)}
                >
                  <User2 className="size-4" />
                  <div className="flex flex-1 flex-col text-left leading-tight">
                    <span className="text-xs font-medium truncate">Admin</span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {formatRoleName(currentRole)}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-3 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                className="w-48"
              >
                <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal">
                  <User2 className="size-3.5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-medium">Admin</span>
                    <Badge
                      variant={badgeCfg.variant}
                      className={`mt-0.5 w-fit text-[10px] px-1.5 py-0 ${badgeCfg.className}`}
                    >
                      {formatRoleName(currentRole)}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="size-3.5" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
