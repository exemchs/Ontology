"use client";

import { Button } from "@/components/ui/button";
import type { QueryType } from "@/types";

interface QueryModeToggleProps {
  mode: QueryType;
  onModeChange: (mode: QueryType) => void;
}

export function QueryModeToggle({ mode, onModeChange }: QueryModeToggleProps) {
  return (
    <div className="flex gap-1 rounded-md border p-0.5">
      <Button
        variant={mode === "graphql" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("graphql")}
        className="h-7 px-3 text-xs"
      >
        GraphQL
      </Button>
      <Button
        variant={mode === "dql" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("dql")}
        className="h-7 px-3 text-xs"
      >
        DQL
      </Button>
    </div>
  );
}
