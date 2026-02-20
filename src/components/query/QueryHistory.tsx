"use client";

import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getQueryHistory } from "@/data/query-data";

interface QueryHistoryProps {
  onSelect: (query: string) => void;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function QueryHistory({ onSelect }: QueryHistoryProps) {
  const history = getQueryHistory();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
          <History className="size-3.5" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle>Query History</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)] px-4">
          <div className="flex flex-col gap-2 pb-4">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.queryText)}
                className="flex flex-col gap-1.5 rounded-md border p-3 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      item.queryType === "graphql" ? "default" : "secondary"
                    }
                    className="text-[10px] h-4 px-1.5"
                  >
                    {item.queryType.toUpperCase()}
                  </Badge>
                  <Badge
                    variant={
                      item.status === "completed" ? "outline" : "destructive"
                    }
                    className="text-[10px] h-4 px-1.5"
                  >
                    {item.status}
                  </Badge>
                  {item.executionTime > 0 && (
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {item.executionTime}ms
                    </span>
                  )}
                </div>
                <code className="text-xs text-muted-foreground font-mono line-clamp-2">
                  {item.queryText}
                </code>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{item.user}</span>
                  <span>{formatRelativeTime(item.createdAt)}</span>
                  {item.resultCount > 0 && (
                    <span className="ml-auto">
                      {item.resultCount.toLocaleString()} rows
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
