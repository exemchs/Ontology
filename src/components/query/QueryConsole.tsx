"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { Play, Loader2, Download, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QueryEditor, type QueryEditorHandle } from "@/components/query/QueryEditor";
import { SchemaExplorer } from "@/components/query/SchemaExplorer";
import { QueryModeToggle } from "@/components/query/QueryModeToggle";
import { TemplateSelector } from "@/components/query/TemplateSelector";
import { QueryHistory } from "@/components/query/QueryHistory";
import { ResultTabs, type ResultTab } from "@/components/query/ResultTabs";
import { ResultInfoBar } from "@/components/query/ResultInfoBar";
import {
  GraphPanelViewSelector,
  type GraphViewType,
} from "@/components/query/GraphPanelViewSelector";
import { TableView } from "@/components/query/views/TableView";
import { ForceGraphView } from "@/components/query/views/ForceGraphView";
import { PiiDemo } from "@/components/query/pii/PiiDemo";
import { ChatbotPanel } from "@/components/query/ChatbotPanel";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { exportJson, exportCsv } from "@/lib/query-export";
import { PageShell } from "@/components/ds/PageShell";
import type { QueryType } from "@/types";

// -- Mock result generator ----------------------------------------------------
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

// -- QueryConsole -------------------------------------------------------------
export function QueryConsole() {
  const [queryText, setQueryText] = useState("");
  const [queryMode, setQueryMode] = useState<QueryType>("graphql");
  const [tabs, setTabs] = useState<ResultTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [graphView, setGraphView] = useState<GraphViewType>("graph");
  const [isExecuting, setIsExecuting] = useState(false);
  const [hiddenTypes, setHiddenTypes] = useState<string[]>([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const editorRef = useRef<QueryEditorHandle>(null);

  const handleSchemaInsert = useCallback((text: string) => {
    editorRef.current?.insertText(text);
  }, []);

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
      setHiddenTypes([]);
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

  const handleToggleType = useCallback((typeName: string) => {
    setHiddenTypes((prev) =>
      prev.includes(typeName)
        ? prev.filter((t) => t !== typeName)
        : [...prev, typeName]
    );
  }, []);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Extract unique type names from active tab data for graph type filter
  const typeNames = useMemo(() => {
    if (!activeTab) return [];
    const types = new Set<string>();
    activeTab.data.forEach((row) => {
      const t = row.type ?? row.step;
      if (t) types.add(String(t));
    });
    return Array.from(types).sort();
  }, [activeTab]);

  // Filter graph data by hidden types
  const filteredGraphData = useMemo(() => {
    if (!activeTab || hiddenTypes.length === 0) return activeTab?.data ?? [];
    return activeTab.data.filter((row) => {
      const t = String(row.type ?? row.step ?? "");
      return !hiddenTypes.includes(t);
    });
  }, [activeTab, hiddenTypes]);

  const handleExportJson = useCallback(() => {
    if (!activeTab) return;
    exportJson(activeTab.data, `query-result-${activeTab.id}`);
  }, [activeTab]);

  const handleExportCsv = useCallback(() => {
    if (!activeTab) return;
    exportCsv(activeTab.data, `query-result-${activeTab.id}`);
  }, [activeTab]);

  return (
    <PageShell
      title="Query Console"
      description="Execute GraphQL and DQL queries against the Dgraph cluster"
      className="h-full"
    >
    <div className="flex flex-1 min-h-0 bg-background">
      {/* Left: Schema Explorer */}
      <div className="w-[220px] shrink-0">
        <SchemaExplorer onInsert={handleSchemaInsert} />
      </div>

      {/* Right: Editor + Results */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Editor area */}
        <div className="flex flex-col gap-1.5 p-3 border-b border-border/40">
          {/* Toolbar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <QueryModeToggle mode={queryMode} onModeChange={setQueryMode} />
            <TemplateSelector mode={queryMode} onSelect={handleInsertQuery} />
            <div className="flex-1" />
            <QueryHistory onSelect={handleInsertQuery} />
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => setShowChatbot((prev) => !prev)}
            >
              <MessageCircle className="size-3.5" />
              Natural Language
            </Button>
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
            ref={editorRef}
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
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ResultInfoBar
                  tab={activeTab}
                  nodeCount={activeTab.data.length}
                  edgeCount={Math.max(0, activeTab.data.length - 1)}
                />
              </div>
              <div className="flex items-center gap-1 pr-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-6 gap-1 text-[10px]">
                      <Download className="size-3" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportCsv} className="text-xs">
                      Export CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportJson} className="text-xs">
                      Export JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex flex-1 min-h-0">
              {/* Left: Graph panel */}
              <div className="flex flex-col w-1/2 border-r border-border/40 min-h-0">
                <GraphPanelViewSelector
                  activeView={graphView}
                  onViewChange={setGraphView}
                  typeNames={typeNames}
                  hiddenTypes={hiddenTypes}
                  onToggleType={handleToggleType}
                />
                <div className="flex-1 overflow-auto p-2">
                  {graphView === "graph" && (
                    <ForceGraphView data={filteredGraphData} />
                  )}
                </div>
              </div>
              {/* Right: Table panel */}
              <div className="flex-1 overflow-auto p-2">
                <TableView data={activeTab.data} />
              </div>
            </div>
          </>
        )}
        {!activeTab && tabs.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Select a template or write a query, then click Run Query
          </div>
        )}
      </div>

        {/* PII Masking Demo section */}
        <Separator />
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="flex w-full items-center justify-between p-3 text-sm font-medium hover:bg-muted/50 transition-colors">
            PII Masking Demo
            <ChevronDown className="size-4 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 pb-3 overflow-auto">
              <PiiDemo />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Floating chatbot panel */}
      <ChatbotPanel
        isOpen={showChatbot}
        onToggle={() => setShowChatbot((prev) => !prev)}
      />
    </div>
    </PageShell>
  );
}
