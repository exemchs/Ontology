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
import { breadcrumbMap } from "@/lib/navigation";

export function HeaderBar() {
  const pathname = usePathname();
  const crumb = breadcrumbMap[pathname];

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
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

      {/* Right side: Cmd+K hint */}
      <div className="ml-auto">
        <button
          type="button"
          onClick={() => {
            document.dispatchEvent(
              new KeyboardEvent("keydown", {
                key: "k",
                metaKey: true,
                bubbles: true,
              })
            );
          }}
          className="inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <kbd className="font-mono text-xs">⌘K</kbd>
        </button>
      </div>
    </header>
  );
}
