"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, Search } from "lucide-react";

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
import { breadcrumbMap } from "@/lib/navigation";
import { AlertBell } from "@/components/layout/AlertBell";

export function HeaderBar() {
  const pathname = usePathname();
  const crumb = breadcrumbMap[pathname];
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/40 px-4">
      {/* Left: sidebar trigger + breadcrumb */}
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

      {/* Center: search bar */}
      <div className="flex-1 flex justify-center">
        <button
          onClick={() => {
            document.dispatchEvent(
              new KeyboardEvent("keydown", {
                key: "k",
                metaKey: true,
                bubbles: true,
              })
            );
          }}
          className="flex h-8 w-full max-w-sm items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground hover:bg-accent transition-colors"
        >
          <Search className="size-3.5 shrink-0" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="ml-auto font-mono text-[10px] text-muted-foreground/60">⌘K</kbd>
        </button>
      </div>

      {/* Right: theme toggle + alert bell */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
        <AlertBell />
      </div>
    </header>
  );
}
