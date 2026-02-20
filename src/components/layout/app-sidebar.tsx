"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut } from "lucide-react";

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
  useSidebar,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { navigationGroups } from "@/lib/navigation";
import { useAuth } from "@/hooks/use-auth";

export function AppSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/40">
      {/* Logo area */}
      <SidebarHeader className="pb-0">
        <div className="flex h-7 items-center px-2">
          {isCollapsed ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/logo-dark-collapse.svg"
                alt="eXemble"
                width={24}
                height={24}
                className="hidden dark:block"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/logo-light-collapse.svg"
                alt="eXemble"
                width={24}
                height={24}
                className="block dark:hidden"
              />
            </>
          ) : (
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
        </div>
      </SidebarHeader>

      {/* Navigation groups */}
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

      {/* Footer: theme toggle + logout */}
      <SidebarFooter className="gap-1">
        {/* Theme toggle — compact single row */}
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
