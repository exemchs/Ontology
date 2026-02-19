# Ontology Product UX Improvement Design

**Date**: 2026-02-19
**Status**: Approved
**Scope**: UI/UX only (backend integration deferred)

## Context

Meeting notes identified 7 action items to improve the Ontology product from a Dgraph operator's perspective. The current dashboard over-emphasizes infrastructure metrics (CPU/Memory/Disk) at the expense of Dgraph-specific operational indicators. Query results lack simultaneous graph+table views. Data import and namespace management are missing entirely.

## Decisions

| Decision | Choice |
|----------|--------|
| Implementation scope | UI/UX with mock data, API connection points separated |
| Priority | All 7 items designed as unified system |
| Resource toggle UX | Collapsible section with chevron |
| Query result layout | Left-right split (Graph + Table) |
| Data Import placement | Workspace group (`/workspace/import`) |
| Namespace management | Integrated into existing UI (User Management tab + header dropdown) |

## 1. CollapsibleResourcePanel (Dashboard + GPU)

### Component: `CollapsibleResourcePanel`

Shared between Dashboard and GPU Monitoring pages.

**Collapsed state (default)**:
- Single-line header: "System Resources" + inline summary `CPU 45% · Memory 62% · Disk 78%` + chevron button
- Minimal height (~48px)

**Expanded state**:
- Header row with chevron
- Three horizontal progress bars (CPU, Memory, Disk) in a 3-column grid
- Compact height (~120px), replacing current tall RadialBarChart gauges
- Color thresholds: green (<70%), yellow (70-85%), red (>85%)

**Behavior**:
- Toggle state persisted in `localStorage` key `resource-panel-collapsed`
- Separate keys per page (`dashboard-resource-collapsed`, `gpu-resource-collapsed`)
- Smooth CSS transition on expand/collapse

### Dashboard changes
- Remove current gauge row (3x `ResourceGauge` RadialBarChart)
- Insert `CollapsibleResourcePanel` in its place
- KPI cards remain above, trend charts move up to fill reclaimed space

### GPU Monitoring changes
- Add `CollapsibleResourcePanel` below `GpuSummaryHeader`
- Same component, same behavior
- GPU-specific cards and charts remain unchanged below

## 2. Query Results: Split View + Result Stats

### Layout restructure

Current: Single result view with 6 view toggle buttons
New: Left-right split panel

```
+--------------------------------------------------+
| Results: 4 nodes, 6 edges · 12.3ms · GraphQL     |  <- Result info bar
+------------------------+-------------------------+
|                        |                         |
|   Graph View           |   Table View            |
|   (node-link diagram)  |   (scrollable table)    |
|                        |                         |
|   [Graph|Treemap|Arc|  |                         |
|    Scatter|Distrib]    |                         |
+------------------------+-------------------------+
```

### Result info bar
- Always visible above result panels
- Content: `Results: {nodeCount} nodes, {edgeCount} edges · {executionTime}ms · {queryType}`
- Added to each result tab

### Graph panel (left, 50%)
- Default view: Force-directed node-link diagram (existing `ForceGraphView`)
- Sub-view selector (small toggle pills inside the panel): Graph, Treemap, Arc, Scatter, Distribution
- Replaces the current top-level `ResultViewBar` 6-button toggle

### Table panel (right, 50%)
- Always shows tabular data
- Scrollable, fixed headers

### Interaction sync
- Click node in graph -> highlight corresponding row in table (scroll into view)
- Hover row in table -> highlight corresponding node in graph
- Shared selection state via React state (lifted to QueryConsole)

### Result tabs
- Keep existing multi-tab system (max 5 tabs)
- Each tab now shows the split view
- Add `resultCount` to tab badge: `Result 1 (4)`

## 3. Data Import Page

### Route: `/workspace/import`

### Navigation
- Add to Workspace group in sidebar after Query Console
- Icon: `Upload` from lucide-react
- Label: "Data Import"

### Page layout

Two tabs: **PostgreSQL** | **CSV File**

#### PostgreSQL tab
```
+--------------------------------------------------+
| Connection Settings                               |
|  Host: [________]  Port: [5432]                  |
|  Database: [________]  Schema: [public]          |
|  Username: [________]  Password: [________]      |
|  [Test Connection]                                |
+--------------------------------------------------+
| Available Tables               | Mapping Preview  |
|  [x] users                     | users -> User    |
|  [x] orders                    | orders -> Order  |
|  [ ] logs                      |                  |
+--------------------------------------------------+
| [Import Selected Tables]                          |
+--------------------------------------------------+
```

- Form fields with validation
- "Test Connection" button with success/error toast
- Table list with checkboxes (populated with mock data)
- Mapping preview showing PG table -> Dgraph type conversion
- Import button with progress bar (simulated)

#### CSV tab
```
+--------------------------------------------------+
| +----------------------------------------------+ |
| |                                              | |
| |   Drop CSV file here or click to browse      | |
| |                                              | |
| +----------------------------------------------+ |
+--------------------------------------------------+
| Column Preview                                    |
|  name (string) -> <predicate>  [text field]      |
|  age (number)  -> <predicate>  [text field]      |
|  email (string)-> <predicate>  [text field]      |
+--------------------------------------------------+
| Target Type: [________]                           |
| [Import CSV]                                      |
+--------------------------------------------------+
```

- Drag & drop zone with file input fallback
- Column detection from CSV header row (mock: parse first 5 rows for preview)
- Editable predicate mapping per column
- Target Dgraph type name input
- Import button with progress bar (simulated)

### Mock data
- PG: Pre-populated connection that "succeeds" test, shows 5 sample tables
- CSV: Sample preview data when file is "uploaded"

## 4. Namespace Management

### Super admin: User Management page tab

Add "Namespaces" tab to `UsersPage` (alongside existing user list).

```
+--------------------------------------------------+
| [Users] [Namespaces]                              |
+--------------------------------------------------+
| Namespace    | Nodes  | Created    | Status       |
| default      | 12,450 | 2025-01-15 | Active       |
| production   | 45,200 | 2025-03-01 | Active       |
| staging      | 3,100  | 2025-06-12 | Active       |
| archive      | 89,000 | 2024-11-30 | Read-only    |
+--------------------------------------------------+
```

- Table columns: Name, Node Count, Created Date, Status
- Status badges: Active (green), Read-only (yellow), Inactive (gray)
- Tab only visible when user role is `super_admin`

### Regular user: Header bar namespace selector

Add namespace indicator to `HeaderBar`, next to profile area.

```
+--------------------------------------------------+
| [breadcrumb...]          [ns: default ▼] [avatar]|
+--------------------------------------------------+
```

- Shows current namespace with dropdown chevron
- Click opens dropdown with available namespaces
- Selection triggers context switch (UI state only, no actual API call)
- Stored in React context + localStorage

## 5. Files to Create/Modify

### New files
- `src/components/ds/CollapsibleResourcePanel.tsx` — shared collapsible resource section
- `src/app/(authenticated)/workspace/import/page.tsx` — Data Import page
- `src/components/import/ImportPage.tsx` — Import page container
- `src/components/import/PostgresImportForm.tsx` — PG import form
- `src/components/import/CsvImportForm.tsx` — CSV import form
- `src/components/users/NamespaceTable.tsx` — Namespace list table (super admin)
- `src/components/layout/NamespaceSelector.tsx` — Header namespace dropdown

### Modified files
- `src/app/(authenticated)/page.tsx` — Replace gauge row with CollapsibleResourcePanel
- `src/app/(authenticated)/monitoring/gpu/page.tsx` — Add CollapsibleResourcePanel
- `src/components/query/QueryConsole.tsx` — Split view layout, result info bar
- `src/components/query/ResultViewBar.tsx` — Move into graph panel as sub-selector
- `src/components/users/UsersPage.tsx` — Add Namespaces tab
- `src/components/layout/header-bar.tsx` — Add NamespaceSelector
- `src/components/layout/app-sidebar.tsx` — (no change, reads from navigation.ts)
- `src/lib/navigation.ts` — Add Data Import menu item
