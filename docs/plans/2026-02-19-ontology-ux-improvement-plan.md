# Ontology Product UX Improvement — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement 7 UX improvements from the product planning meeting: collapsible resource panel, query split view with result stats, Data Import page, and namespace management.

**Architecture:** All changes are UI/UX only with mock data. Each feature is a self-contained component that integrates into existing pages. Shared state uses React context; persistence uses localStorage.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Radix UI (Collapsible, DropdownMenu, Tabs), D3 (force graph), shadcn/ui components, Lucide icons.

---

## Task 1: CollapsibleResourcePanel Component

**Files:**
- Create: `src/components/ds/CollapsibleResourcePanel.tsx`

**Step 1: Create the CollapsibleResourcePanel component**

This component is shared between Dashboard and GPU pages. It shows CPU/Memory/Disk as collapsible horizontal bars.

```tsx
"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { GaugeData } from "@/types";

interface CollapsibleResourcePanelProps {
  gauges: GaugeData[];
  storageKey?: string;
}

function getBarColor(percentage: number): string {
  if (percentage > 85) return "bg-[var(--status-critical)]";
  if (percentage > 70) return "bg-[var(--status-warning)]";
  return "bg-[var(--status-healthy)]";
}

export function CollapsibleResourcePanel({
  gauges,
  storageKey = "resource-panel-collapsed",
}: CollapsibleResourcePanelProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored === "open") setOpen(true);
  }, [storageKey]);

  function handleToggle(next: boolean) {
    setOpen(next);
    localStorage.setItem(storageKey, next ? "open" : "closed");
  }

  const summary = gauges
    .map((g) => `${g.label} ${Math.round((g.value / g.max) * 100)}%`)
    .join(" · ");

  return (
    <Collapsible open={open} onOpenChange={handleToggle}>
      <div className="rounded-lg border border-border/40 bg-card">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <ChevronRight
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                open && "rotate-90"
              )}
            />
            <span className="font-medium">System Resources</span>
            {!open && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {summary}
              </span>
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 pb-4">
            {gauges.map((gauge) => {
              const pct = Math.round((gauge.value / gauge.max) * 100);
              return (
                <div key={gauge.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{gauge.label}</span>
                    <span className="font-medium tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        getBarColor(pct)
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
```

**Step 2: Verify it renders**

Run: `npm run dev`
Navigate to Dashboard — component will be integrated in Task 2.

**Step 3: Commit**

```bash
git add src/components/ds/CollapsibleResourcePanel.tsx
git commit -m "feat: add CollapsibleResourcePanel component"
```

---

## Task 2: Replace Dashboard Gauges with CollapsibleResourcePanel

**Files:**
- Modify: `src/app/(authenticated)/page.tsx`

**Step 1: Replace the gauge section**

Remove the `ResourceGauge` import and the gauge grid (lines 11, 86-98). Replace with `CollapsibleResourcePanel`.

Changes to imports — remove:
```tsx
import { ResourceGauge } from "@/components/charts/dashboard/ResourceGauge";
```
Add:
```tsx
import { CollapsibleResourcePanel } from "@/components/ds/CollapsibleResourcePanel";
```

Replace the gauge section (lines 86-98):
```tsx
      {/* Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {gauges.map((gauge) => (
          <Card key={gauge.label} className="border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{gauge.label} Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceGauge data={gauge} className="aspect-square max-h-[200px]" />
            </CardContent>
          </Card>
        ))}
      </div>
```

With:
```tsx
      {/* System Resources (collapsible) */}
      <CollapsibleResourcePanel
        gauges={gauges}
        storageKey="dashboard-resource-collapsed"
      />
```

The `Card`, `CardContent`, `CardHeader`, `CardTitle` imports can stay (used elsewhere on the page).

**Step 2: Verify**

Run: `npm run dev`
Navigate to `/` — should see collapsed "System Resources" bar with inline summary. Click to expand and see three horizontal progress bars.

**Step 3: Commit**

```bash
git add src/app/\(authenticated\)/page.tsx
git commit -m "feat: replace dashboard gauges with CollapsibleResourcePanel"
```

---

## Task 3: Add CollapsibleResourcePanel to GPU Monitoring

**Files:**
- Modify: `src/app/(authenticated)/monitoring/gpu/page.tsx`

**Step 1: Add imports and mock data**

Add import:
```tsx
import { CollapsibleResourcePanel } from "@/components/ds/CollapsibleResourcePanel";
import { getDashboardGauges } from "@/data/dashboard-data";
```

Add inside `GpuPage()` component, after existing useMemo calls:
```tsx
const systemGauges = useMemo(() => getDashboardGauges(), []);
```

**Step 2: Insert panel below GpuSummaryHeader**

After `<GpuSummaryHeader gpus={gpus} />` and before `<GpuCardGrid>`, add:
```tsx
      <CollapsibleResourcePanel
        gauges={systemGauges}
        storageKey="gpu-resource-collapsed"
      />
```

**Step 3: Verify**

Run: `npm run dev`
Navigate to `/monitoring/gpu` — should see CollapsibleResourcePanel between summary header and GPU cards.

**Step 4: Commit**

```bash
git add src/app/\(authenticated\)/monitoring/gpu/page.tsx
git commit -m "feat: add system resource panel to GPU monitoring page"
```

---

## Task 4: Query Result Info Bar

**Files:**
- Modify: `src/components/query/ResultTabs.tsx`

**Step 1: Add result count badge to tabs**

In `ResultTabs`, update the tab label display (line 53) to include result count:

Replace:
```tsx
          <span className="font-medium">{tab.label}</span>
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
            {tab.executionTime}ms
          </Badge>
```

With:
```tsx
          <span className="font-medium">{tab.label}</span>
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
            {tab.resultCount}
          </Badge>
          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
            {tab.executionTime}ms
          </Badge>
```

**Step 2: Commit**

```bash
git add src/components/query/ResultTabs.tsx
git commit -m "feat: add result count badge to query tabs"
```

---

## Task 5: Query Console Split View Layout

**Files:**
- Create: `src/components/query/ResultInfoBar.tsx`
- Create: `src/components/query/GraphPanelViewSelector.tsx`
- Modify: `src/components/query/QueryConsole.tsx`

**Step 1: Create ResultInfoBar component**

```tsx
// src/components/query/ResultInfoBar.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import type { ResultTab } from "@/components/query/ResultTabs";

interface ResultInfoBarProps {
  tab: ResultTab;
  nodeCount: number;
  edgeCount: number;
}

export function ResultInfoBar({ tab, nodeCount, edgeCount }: ResultInfoBarProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/40 bg-muted/30 text-xs">
      <span className="font-medium">
        Results: {nodeCount} nodes, {edgeCount} edges
      </span>
      <span className="text-muted-foreground">·</span>
      <span className="tabular-nums text-muted-foreground">{tab.executionTime}ms</span>
      <span className="text-muted-foreground">·</span>
      <Badge variant="outline" className="text-[10px] h-4 px-1.5 uppercase">
        {tab.queryType}
      </Badge>
    </div>
  );
}
```

**Step 2: Create GraphPanelViewSelector component**

This replaces the top-level `ResultViewBar` but without the "table" option (table is always visible on the right).

```tsx
// src/components/query/GraphPanelViewSelector.tsx
"use client";

import {
  Network,
  LayoutGrid,
  Activity,
  ScatterChart,
  BarChart3,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type GraphViewType = "graph" | "treemap" | "arc" | "scatter" | "distribution";

interface GraphPanelViewSelectorProps {
  activeView: GraphViewType;
  onViewChange: (view: GraphViewType) => void;
}

const viewOptions: { type: GraphViewType; icon: React.ElementType; label: string }[] = [
  { type: "graph", icon: Network, label: "Graph" },
  { type: "treemap", icon: LayoutGrid, label: "Treemap" },
  { type: "arc", icon: Activity, label: "Arc" },
  { type: "scatter", icon: ScatterChart, label: "Scatter" },
  { type: "distribution", icon: BarChart3, label: "Distribution" },
];

export function GraphPanelViewSelector({
  activeView,
  onViewChange,
}: GraphPanelViewSelectorProps) {
  return (
    <div className="px-2 py-1 border-b border-border/40">
      <Tabs value={activeView} onValueChange={(v) => onViewChange(v as GraphViewType)}>
        <TabsList className="h-6">
          {viewOptions.map(({ type, icon: Icon, label }) => (
            <TabsTrigger key={type} value={type} className="text-[10px] px-1.5 gap-0.5 h-5">
              <Icon className="size-2.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
```

**Step 3: Rewrite QueryConsole results area for split view**

In `src/components/query/QueryConsole.tsx`, make these changes:

Replace imports — remove `ResultViewBar` and `ViewType`, add new components:
```tsx
// Remove:
import { ResultViewBar, type ViewType } from "@/components/query/ResultViewBar";

// Add:
import { ResultInfoBar } from "@/components/query/ResultInfoBar";
import {
  GraphPanelViewSelector,
  type GraphViewType,
} from "@/components/query/GraphPanelViewSelector";
```

Replace state:
```tsx
// Remove:
const [activeView, setActiveView] = useState<ViewType>("table");

// Add:
const [graphView, setGraphView] = useState<GraphViewType>("graph");
```

Replace the results area (lines 144-182) with:

```tsx
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
            <ResultInfoBar
              tab={activeTab}
              nodeCount={activeTab.data.length}
              edgeCount={Math.max(0, activeTab.data.length - 1)}
            />
            <div className="flex flex-1 min-h-0">
              {/* Left: Graph panel */}
              <div className="flex flex-col w-1/2 border-r border-border/40 min-h-0">
                <GraphPanelViewSelector
                  activeView={graphView}
                  onViewChange={setGraphView}
                />
                <div className="flex-1 overflow-auto p-2">
                  {graphView === "graph" && (
                    <ForceGraphView data={activeTab.data} />
                  )}
                  {graphView === "treemap" && (
                    <TreemapView data={activeTab.data} />
                  )}
                  {graphView === "arc" && (
                    <ArcDiagramView data={activeTab.data} />
                  )}
                  {graphView === "scatter" && (
                    <ScatterView data={activeTab.data} />
                  )}
                  {graphView === "distribution" && (
                    <DistributionView data={activeTab.data} />
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
```

**Step 4: Verify**

Run: `npm run dev`
Navigate to `/workspace/query`, run a query. Should see split view: graph on left, table on right, with result info bar above.

**Step 5: Commit**

```bash
git add src/components/query/ResultInfoBar.tsx src/components/query/GraphPanelViewSelector.tsx src/components/query/QueryConsole.tsx
git commit -m "feat: query results split view with graph + table and result info bar"
```

---

## Task 6: Data Import — Navigation and Page Shell

**Files:**
- Modify: `src/lib/navigation.ts`
- Create: `src/app/(authenticated)/workspace/import/page.tsx`
- Create: `src/data/import-data.ts`

**Step 1: Add Data Import to navigation**

In `src/lib/navigation.ts`, add `Upload` to the import list:
```tsx
import {
  LayoutDashboard,
  Cpu,
  Network,
  Workflow,
  Terminal,
  Upload,
  Users,
} from "lucide-react";
```

Add to the Workspace group items array, after Query Console:
```tsx
      { title: "Data Import", url: "/workspace/import", icon: Upload },
```

Add to `breadcrumbMap`:
```tsx
  "/workspace/import": { group: "Workspace", page: "Data Import" },
```

**Step 2: Create mock data for import**

```tsx
// src/data/import-data.ts

export interface PgTable {
  name: string;
  rowCount: number;
  columns: { name: string; type: string }[];
  dgraphType: string;
}

export function getMockPgTables(): PgTable[] {
  return [
    {
      name: "equipment",
      rowCount: 1240,
      columns: [
        { name: "id", type: "serial" },
        { name: "name", type: "varchar(255)" },
        { name: "type", type: "varchar(100)" },
        { name: "status", type: "varchar(50)" },
        { name: "location", type: "varchar(255)" },
      ],
      dgraphType: "Equipment",
    },
    {
      name: "wafer_lots",
      rowCount: 8420,
      columns: [
        { name: "lot_id", type: "varchar(50)" },
        { name: "product", type: "varchar(100)" },
        { name: "quantity", type: "integer" },
        { name: "start_date", type: "timestamp" },
      ],
      dgraphType: "WaferLot",
    },
    {
      name: "process_steps",
      rowCount: 34500,
      columns: [
        { name: "step_id", type: "serial" },
        { name: "lot_id", type: "varchar(50)" },
        { name: "step_name", type: "varchar(100)" },
        { name: "duration_min", type: "integer" },
        { name: "temperature", type: "numeric(6,1)" },
      ],
      dgraphType: "ProcessStep",
    },
    {
      name: "sensors",
      rowCount: 560,
      columns: [
        { name: "sensor_id", type: "serial" },
        { name: "equipment_id", type: "integer" },
        { name: "sensor_type", type: "varchar(50)" },
        { name: "unit", type: "varchar(20)" },
      ],
      dgraphType: "Sensor",
    },
    {
      name: "measurements",
      rowCount: 1250000,
      columns: [
        { name: "id", type: "bigserial" },
        { name: "sensor_id", type: "integer" },
        { name: "value", type: "numeric(10,4)" },
        { name: "timestamp", type: "timestamp" },
      ],
      dgraphType: "Measurement",
    },
  ];
}

export interface CsvColumn {
  name: string;
  detectedType: "string" | "number" | "date";
  sampleValues: string[];
  predicate: string;
}

export function getMockCsvColumns(): CsvColumn[] {
  return [
    {
      name: "equipment_name",
      detectedType: "string",
      sampleValues: ["CVD Chamber A", "Plasma Etcher 1", "Furnace B"],
      predicate: "Equipment.name",
    },
    {
      name: "equipment_type",
      detectedType: "string",
      sampleValues: ["CVD", "Etcher", "Furnace"],
      predicate: "Equipment.type",
    },
    {
      name: "temperature",
      detectedType: "number",
      sampleValues: ["1050", "65", "680"],
      predicate: "Equipment.temperature",
    },
    {
      name: "install_date",
      detectedType: "date",
      sampleValues: ["2024-01-15", "2024-03-22", "2023-11-08"],
      predicate: "Equipment.installedAt",
    },
  ];
}
```

**Step 3: Create the page route**

```tsx
// src/app/(authenticated)/workspace/import/page.tsx
import { ImportPage } from "@/components/import/ImportPage";

export default function DataImportPage() {
  return <ImportPage />;
}
```

**Step 4: Commit**

```bash
git add src/lib/navigation.ts src/data/import-data.ts src/app/\(authenticated\)/workspace/import/page.tsx
git commit -m "feat: add Data Import route, navigation, and mock data"
```

---

## Task 7: Data Import — PostgreSQL Form

**Files:**
- Create: `src/components/import/PostgresImportForm.tsx`

**Step 1: Create the PostgreSQL import form**

```tsx
// src/components/import/PostgresImportForm.tsx
"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { getMockPgTables, type PgTable } from "@/data/import-data";

type ConnectionStatus = "idle" | "testing" | "success" | "error";

export function PostgresImportForm() {
  const [host, setHost] = useState("db.example.com");
  const [port, setPort] = useState("5432");
  const [database, setDatabase] = useState("fab_production");
  const [schema, setSchema] = useState("public");
  const [username, setUsername] = useState("readonly_user");
  const [password, setPassword] = useState("");

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [tables, setTables] = useState<PgTable[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  function handleTestConnection() {
    setConnectionStatus("testing");
    setTimeout(() => {
      setConnectionStatus("success");
      setTables(getMockPgTables());
      setSelected(new Set(["equipment", "wafer_lots", "process_steps"]));
    }, 1200);
  }

  function toggleTable(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function handleImport() {
    setImporting(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setImporting(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 400);
  }

  return (
    <div className="space-y-4">
      {/* Connection Settings */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="size-4" />
            Connection Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Host</Label>
              <Input value={host} onChange={(e) => setHost(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Port</Label>
              <Input value={port} onChange={(e) => setPort(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Database</Label>
              <Input value={database} onChange={(e) => setDatabase(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Schema</Label>
              <Input value={schema} onChange={(e) => setSchema(e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Username</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleTestConnection}
              disabled={connectionStatus === "testing"}
            >
              {connectionStatus === "testing" && <Loader2 className="size-3 animate-spin mr-1" />}
              Test Connection
            </Button>
            {connectionStatus === "success" && (
              <span className="flex items-center gap-1 text-xs text-[var(--status-healthy)]">
                <CheckCircle2 className="size-3.5" /> Connected
              </span>
            )}
            {connectionStatus === "error" && (
              <span className="flex items-center gap-1 text-xs text-[var(--status-critical)]">
                <XCircle className="size-3.5" /> Connection failed
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table Selection + Mapping Preview */}
      {tables.length > 0 && (
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Available Tables</CardTitle>
              <span className="text-xs text-muted-foreground">
                {selected.size} of {tables.length} selected
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="text-xs">Table</TableHead>
                  <TableHead className="text-xs">Rows</TableHead>
                  <TableHead className="text-xs">Columns</TableHead>
                  <TableHead className="text-xs">Dgraph Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((t) => (
                  <TableRow key={t.name}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(t.name)}
                        onCheckedChange={() => toggleTable(t.name)}
                      />
                    </TableCell>
                    <TableCell className="text-sm font-medium">{t.name}</TableCell>
                    <TableCell className="text-sm tabular-nums text-muted-foreground">
                      {t.rowCount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {t.columns.length}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {t.dgraphType}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Import Action */}
      {tables.length > 0 && (
        <div className="space-y-2">
          {importing && <Progress value={Math.min(progress, 100)} className="h-2" />}
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={handleImport}
            disabled={selected.size === 0 || importing}
          >
            {importing ? (
              <>
                <Loader2 className="size-3 animate-spin mr-1" />
                Importing... {Math.min(Math.round(progress), 100)}%
              </>
            ) : (
              `Import ${selected.size} Table${selected.size !== 1 ? "s" : ""}`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/import/PostgresImportForm.tsx
git commit -m "feat: add PostgreSQL import form component"
```

---

## Task 8: Data Import — CSV Form

**Files:**
- Create: `src/components/import/CsvImportForm.tsx`

**Step 1: Create the CSV import form**

```tsx
// src/components/import/CsvImportForm.tsx
"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getMockCsvColumns, type CsvColumn } from "@/data/import-data";

export function CsvImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<CsvColumn[]>([]);
  const [targetType, setTargetType] = useState("Equipment");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    // Simulate CSV parsing — use mock columns
    setColumns(getMockCsvColumns());
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith(".csv")) handleFile(f);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function updatePredicate(colName: string, predicate: string) {
    setColumns((prev) =>
      prev.map((c) => (c.name === colName ? { ...c, predicate } : c))
    );
  }

  function handleImport() {
    setImporting(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setImporting(false);
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 300);
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card className="border-border/40">
        <CardContent className="pt-6">
          {!file ? (
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <Upload className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drop a CSV file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground/60">
                Supports .csv files up to 100MB
              </p>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileInput}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-border/40 p-3">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{file.name}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {(file.size / 1024).toFixed(1)} KB
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                className="size-6"
                onClick={() => { setFile(null); setColumns([]); }}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Column Mapping */}
      {columns.length > 0 && (
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Column Mapping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">CSV Column</TableHead>
                  <TableHead className="text-xs">Detected Type</TableHead>
                  <TableHead className="text-xs">Sample Values</TableHead>
                  <TableHead className="text-xs">Dgraph Predicate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {columns.map((col) => (
                  <TableRow key={col.name}>
                    <TableCell className="text-sm font-medium">{col.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {col.detectedType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {col.sampleValues.join(", ")}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={col.predicate}
                        onChange={(e) => updatePredicate(col.name, e.target.value)}
                        className="h-7 text-xs w-[180px]"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center gap-3 pt-2">
              <div className="space-y-1">
                <Label className="text-xs">Target Dgraph Type</Label>
                <Input
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="h-8 text-sm w-[200px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Action */}
      {columns.length > 0 && (
        <div className="space-y-2">
          {importing && <Progress value={Math.min(progress, 100)} className="h-2" />}
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={handleImport}
            disabled={importing || !targetType.trim()}
          >
            {importing ? (
              <>
                <Loader2 className="size-3 animate-spin mr-1" />
                Importing... {Math.min(Math.round(progress), 100)}%
              </>
            ) : (
              "Import CSV"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/import/CsvImportForm.tsx
git commit -m "feat: add CSV import form component"
```

---

## Task 9: Data Import — ImportPage Container

**Files:**
- Create: `src/components/import/ImportPage.tsx`

**Step 1: Create the container with tab switching**

```tsx
// src/components/import/ImportPage.tsx
"use client";

import { PageShell } from "@/components/ds/PageShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostgresImportForm } from "@/components/import/PostgresImportForm";
import { CsvImportForm } from "@/components/import/CsvImportForm";

export function ImportPage() {
  return (
    <PageShell
      title="Data Import"
      description="Import data from PostgreSQL or CSV files into Dgraph"
    >
      <Tabs defaultValue="postgres">
        <TabsList className="h-8">
          <TabsTrigger value="postgres" className="text-xs px-3">
            PostgreSQL
          </TabsTrigger>
          <TabsTrigger value="csv" className="text-xs px-3">
            CSV File
          </TabsTrigger>
        </TabsList>
        <TabsContent value="postgres" className="mt-3">
          <PostgresImportForm />
        </TabsContent>
        <TabsContent value="csv" className="mt-3">
          <CsvImportForm />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
```

**Step 2: Verify**

Run: `npm run dev`
Navigate to `/workspace/import`. Should see two tabs (PostgreSQL, CSV File) with full forms.

**Step 3: Commit**

```bash
git add src/components/import/ImportPage.tsx
git commit -m "feat: add ImportPage container with tab switching"
```

---

## Task 10: Namespace Management — Context and Mock Data

**Files:**
- Create: `src/contexts/NamespaceContext.tsx`
- Create: `src/data/namespace-data.ts`

**Step 1: Create namespace context**

```tsx
// src/contexts/NamespaceContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface Namespace {
  name: string;
  nodeCount: number;
  createdAt: string;
  status: "active" | "read-only" | "inactive";
}

interface NamespaceContextType {
  currentNamespace: string;
  setCurrentNamespace: (ns: string) => void;
  namespaces: Namespace[];
}

const NamespaceContext = createContext<NamespaceContextType | undefined>(undefined);

const STORAGE_KEY = "ontology-namespace";

export function NamespaceProvider({
  children,
  namespaces,
}: {
  children: ReactNode;
  namespaces: Namespace[];
}) {
  const [currentNamespace, setCurrentNs] = useState("default");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && namespaces.some((ns) => ns.name === stored)) {
      setCurrentNs(stored);
    }
  }, [namespaces]);

  function setCurrentNamespace(ns: string) {
    setCurrentNs(ns);
    localStorage.setItem(STORAGE_KEY, ns);
  }

  return (
    <NamespaceContext.Provider
      value={{ currentNamespace, setCurrentNamespace, namespaces }}
    >
      {children}
    </NamespaceContext.Provider>
  );
}

export function useNamespace() {
  const context = useContext(NamespaceContext);
  if (!context) {
    throw new Error("useNamespace must be used within a NamespaceProvider");
  }
  return context;
}
```

**Step 2: Create mock namespace data**

```tsx
// src/data/namespace-data.ts
import type { Namespace } from "@/contexts/NamespaceContext";

export function getNamespaces(): Namespace[] {
  return [
    { name: "default", nodeCount: 12450, createdAt: "2025-01-15", status: "active" },
    { name: "production", nodeCount: 45200, createdAt: "2025-03-01", status: "active" },
    { name: "staging", nodeCount: 3100, createdAt: "2025-06-12", status: "active" },
    { name: "archive", nodeCount: 89000, createdAt: "2024-11-30", status: "read-only" },
  ];
}
```

**Step 3: Commit**

```bash
git add src/contexts/NamespaceContext.tsx src/data/namespace-data.ts
git commit -m "feat: add NamespaceContext and mock namespace data"
```

---

## Task 11: Namespace Management — Wire Provider into Layout

**Files:**
- Modify: `src/app/(authenticated)/layout.tsx`

**Step 1: Read current layout**

Read `src/app/(authenticated)/layout.tsx` to see current provider structure.

**Step 2: Wrap children with NamespaceProvider**

Add imports:
```tsx
import { NamespaceProvider } from "@/contexts/NamespaceContext";
import { getNamespaces } from "@/data/namespace-data";
```

Wrap the existing children inside `NamespaceProvider`:
```tsx
<NamespaceProvider namespaces={getNamespaces()}>
  {/* existing layout content */}
</NamespaceProvider>
```

Note: `NamespaceProvider` must be inside `RoleProvider` if `RoleProvider` exists in this layout. Nest it inside the existing providers.

**Step 3: Commit**

```bash
git add src/app/\(authenticated\)/layout.tsx
git commit -m "feat: wire NamespaceProvider into authenticated layout"
```

---

## Task 12: Namespace Management — NamespaceSelector in Header

**Files:**
- Create: `src/components/layout/NamespaceSelector.tsx`
- Modify: `src/components/layout/header-bar.tsx`

**Step 1: Create NamespaceSelector dropdown**

```tsx
// src/components/layout/NamespaceSelector.tsx
"use client";

import { Database, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
        >
          <Database className="size-3" />
          <span className="max-w-[100px] truncate">{currentNamespace}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
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
```

**Step 2: Add to HeaderBar**

In `src/components/layout/header-bar.tsx`, add import:
```tsx
import { NamespaceSelector } from "@/components/layout/NamespaceSelector";
```

Add `<NamespaceSelector />` before the `⌘K` button in the right side area. Replace:
```tsx
      {/* Right side: Cmd+K hint */}
      <div className="ml-auto">
```

With:
```tsx
      {/* Right side: namespace + Cmd+K hint */}
      <div className="ml-auto flex items-center gap-2">
        <NamespaceSelector />
```

The closing `</div>` stays the same.

**Step 3: Verify**

Run: `npm run dev`
Should see namespace selector in the header bar showing "default". Click to see dropdown with 4 namespaces.

**Step 4: Commit**

```bash
git add src/components/layout/NamespaceSelector.tsx src/components/layout/header-bar.tsx
git commit -m "feat: add namespace selector to header bar"
```

---

## Task 13: Namespace Management — NamespaceTable for Super Admin

**Files:**
- Create: `src/components/users/NamespaceTable.tsx`
- Modify: `src/components/users/UsersPage.tsx`

**Step 1: Create NamespaceTable component**

```tsx
// src/components/users/NamespaceTable.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useNamespace } from "@/contexts/NamespaceContext";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-[var(--status-healthy)]/10 text-[var(--status-healthy)] border-[var(--status-healthy)]/20" },
  "read-only": { label: "Read-only", className: "bg-[var(--status-warning)]/10 text-[var(--status-warning)] border-[var(--status-warning)]/20" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground" },
};

export function NamespaceTable() {
  const { namespaces } = useNamespace();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Namespace</TableHead>
          <TableHead>Node Count</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {namespaces.map((ns) => {
          const status = STATUS_VARIANT[ns.status] ?? STATUS_VARIANT.inactive;
          return (
            <TableRow key={ns.name}>
              <TableCell className="font-medium">{ns.name}</TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {ns.nodeCount.toLocaleString()}
              </TableCell>
              <TableCell className="text-muted-foreground">{ns.createdAt}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("text-xs", status.className)}>
                  {status.label}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
```

**Step 2: Add tabs to UsersPage**

Replace `src/components/users/UsersPage.tsx` content:

```tsx
"use client";

import { PageShell } from "@/components/ds/PageShell";
import { UserTable } from "@/components/users/UserTable";
import { NamespaceTable } from "@/components/users/NamespaceTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRole } from "@/contexts/RoleContext";

export function UsersPage() {
  const { currentRole } = useRole();
  const isSuperAdmin = currentRole === "super_admin";

  return (
    <PageShell
      title="User Management"
      description="Manage user roles, PII access permissions, and namespaces."
    >
      {isSuperAdmin ? (
        <Tabs defaultValue="users">
          <TabsList className="h-8">
            <TabsTrigger value="users" className="text-xs px-3">
              Users
            </TabsTrigger>
            <TabsTrigger value="namespaces" className="text-xs px-3">
              Namespaces
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="mt-3">
            <UserTable />
          </TabsContent>
          <TabsContent value="namespaces" className="mt-3">
            <NamespaceTable />
          </TabsContent>
        </Tabs>
      ) : (
        <UserTable />
      )}
    </PageShell>
  );
}
```

**Step 3: Verify**

Run: `npm run dev`
Navigate to `/admin/users`. Should see Users/Namespaces tabs (when role is super_admin). Namespaces tab shows 4 namespaces with status badges.

**Step 4: Commit**

```bash
git add src/components/users/NamespaceTable.tsx src/components/users/UsersPage.tsx
git commit -m "feat: add namespace management tab for super admin"
```

---

## Task 14: Ensure Missing UI Components Exist

**Files:**
- Possibly create: `src/components/ui/progress.tsx`
- Possibly create: `src/components/ui/checkbox.tsx`
- Possibly create: `src/components/ui/label.tsx`
- Possibly create: `src/components/ui/input.tsx`

**Step 1: Check which shadcn/ui components are missing**

Run:
```bash
ls src/components/ui/
```

For any missing component needed by the import forms (Progress, Checkbox, Label, Input), add them using:
```bash
npx shadcn@latest add progress checkbox label input
```

Only run this for components that don't already exist.

**Step 2: Commit**

```bash
git add src/components/ui/
git commit -m "chore: add missing shadcn/ui components for import forms"
```

---

## Task 15: Build Verification

**Step 1: Run lint**

```bash
npm run lint
```

Fix any lint errors found.

**Step 2: Run production build**

```bash
npm run build
```

Fix any TypeScript or build errors.

**Step 3: Manual verification checklist**

Run `npm run dev` and verify each feature:

- [ ] Dashboard: CollapsibleResourcePanel shows collapsed by default, expands with progress bars
- [ ] GPU Monitoring: Same CollapsibleResourcePanel appears below summary header
- [ ] Query Console: Split view with graph (left) + table (right), result info bar shows counts
- [ ] Data Import: PostgreSQL form with test connection and table selection works
- [ ] Data Import: CSV form with drag-and-drop and column mapping works
- [ ] Header: Namespace selector dropdown works and persists selection
- [ ] User Management: Namespaces tab visible for super_admin role
- [ ] Sidebar: Data Import menu item appears under Workspace

**Step 4: Final commit**

```bash
git add -A
git commit -m "fix: resolve build and lint issues from UX improvement implementation"
```
