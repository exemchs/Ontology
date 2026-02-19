"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { QueryType } from "@/types";

interface QueryModeToggleProps {
  mode: QueryType;
  onModeChange: (mode: QueryType) => void;
}

export function QueryModeToggle({ mode, onModeChange }: QueryModeToggleProps) {
  return (
    <Tabs value={mode} onValueChange={(v) => onModeChange(v as QueryType)}>
      <TabsList className="h-7">
        <TabsTrigger value="graphql" className="text-xs px-2">
          GraphQL
        </TabsTrigger>
        <TabsTrigger value="dql" className="text-xs px-2">
          DQL
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
