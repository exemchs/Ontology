"use client";

import { useState, useCallback } from "react";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QueryEditor } from "@/components/query/QueryEditor";
import { QueryModeToggle } from "@/components/query/QueryModeToggle";
import { TemplateSelector } from "@/components/query/TemplateSelector";
import { QueryHistory } from "@/components/query/QueryHistory";
import { ResultTabs, type ResultTab } from "@/components/query/ResultTabs";
import { ResultViewBar, type ViewType } from "@/components/query/ResultViewBar";
import { TableView } from "@/components/query/views/TableView";
import type { QueryType } from "@/types";

// ── Mock result generator ─────────────────────────────────────────────────
function generateMockResult(queryType: QueryType): Record<string, unknown>[] {
  if (queryType === "graphql") {
    return [
      { equipment_id: "CVD-001", name: "CVD Chamber A", type: "CVD", manufacturer: "Applied Materials", location: "FAB1-BAY03", status: "active" },
      { equipment_id: "CVD-002", name: "CVD Chamber B", type: "CVD", manufacturer: "Applied Materials", location: "FAB1-BAY03", status: "active" },
      { equipment_id: "Etcher-001", name: "Plasma Etcher 1", type: "Etcher", manufacturer: "Lam Research", location: "FAB1-BAY05", status: "active" },
      { equipment_id: "Etcher-002", name: "Plasma Etcher 2", type: "Etcher", manufacturer: "Lam Research", location: "FAB1-BAY05", status: "maintenance" },
      { equipment_id: "Furnace-001", name: "Diffusion Furnace A", type: "Furnace", manufacturer: "Tokyo Electron", location: "FAB1-BAY07", status: "active" },
      { equipment_id: "Furnace-002", name: "Diffusion Furnace B", type: "Furnace", manufacturer: "Tokyo Electron", location: "FAB1-BAY07", status: "active" },
      { equipment_id: "CMP-001", name: "CMP System 1", type: "CMP", manufacturer: "Ebara", location: "FAB1-BAY04", status: "active" },
      { equipment_id: "Litho-001", name: "ArF Scanner", type: "Lithography", manufacturer: "ASML", location: "FAB1-BAY02", status: "active" },
    ];
  }
  return [
    { wafer_id: "W-2024-0847-01", lot_id: "LOT-2024-0847", step: "Oxidation", step_number: 1, duration: "45min", temperature: "1050C" },
    { wafer_id: "W-2024-0847-01", lot_id: "LOT-2024-0847", step: "CVD Deposition", step_number: 2, duration: "30min", temperature: "680C" },
    { wafer_id: "W-2024-0847-01", lot_id: "LOT-2024-0847", step: "Photolithography", step_number: 3, duration: "25min", temperature: "23C" },
    { wafer_id: "W-2024-0847-01", lot_id: "LOT-2024-0847", step: "Plasma Etch", step_number: 4, duration: "15min", temperature: "65C" },
    { wafer_id: "W-2024-0847-01", lot_id: "LOT-2024-0847", step: "Ion Implant", step_number: 5, duration: "20min", temperature: "350C" },
    { wafer_id: "W-2024-0847-01", lot_id: "LOT-2024-0847", step: "CMP Polish", step_number: 6, duration: "35min", temperature: "25C" },
  ];
}

// ── QueryConsole ──────────────────────────────────────────────────────────
export function QueryConsole() {
  const [queryText, setQueryText] = useState("");
  const [queryMode, setQueryMode] = useState<QueryType>("graphql");
  const [tabs, setTabs] = useState<ResultTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("table");
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRunQuery = useCallback(() => {
    if (!queryText.trim() || isExecuting) return;

    setIsExecuting(true);
    const delay = 200 + Math.random() * 600;

    setTimeout(() => {
      const data = generateMockResult(queryMode);
      const newTab: ResultTab = {
        id: crypto.randomUUID(),
        label: `Result ${tabs.length + 1}`,
        executionTime: Math.round(delay),
        resultCount: data.length,
        queryText,
        queryType: queryMode,
        timestamp: new Date().toISOString(),
        data,
      };

      setTabs((prev) => {
        const updated = [...prev, newTab];
        // FIFO eviction: max 5 tabs
        if (updated.length > 5) {
          return updated.slice(updated.length - 5);
        }
        return updated;
      });
      setActiveTabId(newTab.id);
      setIsExecuting(false);
    }, delay);
  }, [queryText, queryMode, isExecuting, tabs.length]);

  const handleTabClose = useCallback(
    (id: string) => {
      setTabs((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        if (activeTabId === id) {
          setActiveTabId(updated.length > 0 ? updated[updated.length - 1].id : null);
        }
        return updated;
      });
    },
    [activeTabId]
  );

  const handleInsertQuery = useCallback((query: string) => {
    setQueryText(query);
  }, []);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="flex flex-col h-full">
      {/* Editor area */}
      <div className="flex flex-col gap-2 p-4 border-b">
        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <QueryModeToggle mode={queryMode} onModeChange={setQueryMode} />
          <TemplateSelector mode={queryMode} onSelect={handleInsertQuery} />
          <div className="flex-1" />
          <QueryHistory onSelect={handleInsertQuery} />
          <Button
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={handleRunQuery}
            disabled={!queryText.trim() || isExecuting}
          >
            {isExecuting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5" />
            )}
            {isExecuting ? "Running..." : "Run Query"}
          </Button>
        </div>
        {/* CodeMirror Editor */}
        <QueryEditor
          value={queryText}
          onChange={setQueryText}
          mode={queryMode}
        />
      </div>

      {/* Results area */}
      <div className="flex flex-col flex-1 min-h-0">
        <ResultTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          onTabClose={handleTabClose}
        />
        {activeTab && (
          <>
            <ResultViewBar activeView={activeView} onViewChange={setActiveView} />
            <div className="flex-1 overflow-auto p-2">
              {activeView === "table" ? (
                <TableView data={activeTab.data} />
              ) : (
                <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                  {activeView.charAt(0).toUpperCase() + activeView.slice(1)} view coming soon (Plan 02)
                </div>
              )}
            </div>
          </>
        )}
        {!activeTab && tabs.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Select a template or write a query, then click Run Query
          </div>
        )}
      </div>
    </div>
  );
}
