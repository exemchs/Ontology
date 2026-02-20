"use client";

import { Database, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useNamespace } from "@/contexts/NamespaceContext";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-[var(--status-healthy)]",
  "read-only": "bg-[var(--status-warning)]",
  inactive: "bg-muted-foreground",
};

export function NamespaceSelector() {
  const { currentNamespace, setCurrentNamespace, namespaces } = useNamespace();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton tooltip={currentNamespace}>
          <Database className="size-4" />
          <span>{currentNamespace}</span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-[200px]">
        {namespaces.map((ns) => (
          <DropdownMenuItem
            key={ns.name}
            onClick={() => setCurrentNamespace(ns.name)}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span
                className={cn("w-1.5 h-1.5 rounded-full", STATUS_COLORS[ns.status])}
              />
              <span>{ns.name}</span>
            </div>
            {currentNamespace === ns.name && <Check className="size-3" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
