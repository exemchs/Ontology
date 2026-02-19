"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getQueryTemplates } from "@/data/query-data";
import type { QueryType } from "@/types";

interface TemplateSelectorProps {
  mode: QueryType;
  onSelect: (query: string) => void;
}

export function TemplateSelector({ mode, onSelect }: TemplateSelectorProps) {
  const templates = getQueryTemplates().filter((t) => t.type === mode);

  return (
    <Select
      onValueChange={(id) => {
        const template = templates.find((t) => t.id === id);
        if (template) onSelect(template.query);
      }}
    >
      <SelectTrigger size="sm" className="h-7 w-[200px] text-xs">
        <SelectValue placeholder="Template..." />
      </SelectTrigger>
      <SelectContent>
        {templates.map((t) => (
          <SelectItem key={t.id} value={t.id}>
            <div className="flex flex-col">
              <span className="text-xs font-medium">{t.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {t.description}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
