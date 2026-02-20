"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  LogOut,
  Search,
  User2,
  ChevronsUpDown,
} from "lucide-react";

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
                    tooltip="Search (⌘K)"
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
                <span>Search...</span>
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
        {/* Namespace + Notifications */}
        <SidebarMenu>
          <SidebarMenuItem>
            <NamespaceSelector />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <AlertBell />
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User card (shadcn pattern) */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip="Admin"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                    <User2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-medium">Admin</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {formatRoleName(currentRole)}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                className="w-56"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                      <User2 className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left leading-tight">
                      <span className="truncate text-sm font-medium">Admin</span>
                      <Badge
                        variant={badgeCfg.variant}
                        className={`mt-0.5 w-fit text-[10px] px-1.5 py-0 ${badgeCfg.className}`}
                      >
                        {formatRoleName(currentRole)}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === "dark" ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                  <span>Theme</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
