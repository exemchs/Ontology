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
import { breadcrumbMap } from "@/lib/navigation";
import { NamespaceSelector } from "@/components/layout/NamespaceSelector";

export function HeaderBar() {
  const pathname = usePathname();
  const crumb = breadcrumbMap[pathname];

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

      {/* Right side: namespace + Cmd+K hint */}
      <div className="ml-auto flex items-center gap-2">
        <NamespaceSelector />
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
