"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

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
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { navigationGroups } from "@/lib/navigation";
import { useAuth } from "@/hooks/use-auth";
import { NamespaceSelector } from "@/components/layout/NamespaceSelector";

export function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/40">
      {/* Logo — height matches HeaderBar h-12 so border lines up */}
      <SidebarHeader className="h-12 shrink-0 border-b border-border/40 justify-center pb-0">
        <div className="flex h-7 items-center px-2">
          {!isCollapsed && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/logo-dark.png"
                alt="eXemble"
                className="hidden dark:block h-5 w-auto"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/logo-light.png"
                alt="eXemble"
                className="block dark:hidden h-5 w-auto"
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

      {/* Footer */}
      <SidebarFooter className="gap-1">
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <NamespaceSelector />
          </SidebarMenuItem>
        </SidebarMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start gap-2 h-8"
        >
          <LogOut className="size-3.5" />
          {!isCollapsed && <span className="text-xs">Log out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
