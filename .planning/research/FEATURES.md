# Feature Landscape

**Domain:** Graph Database Monitoring & Visualization Platform (Semiconductor FAB POC)
**Researched:** 2026-02-19
**Confidence:** MEDIUM (web research tools unavailable; analysis based on training data knowledge of Neo4j Browser/Bloom, Dgraph Ratel, Grafana, Datadog, Cytoscape, and the PRD v1.3)

---

## Comparable Platform Feature Matrix

Before categorizing features, here is what the competitive landscape actually offers. This matrix informed the table-stakes vs. differentiator classification below.

| Feature | Dgraph Ratel | Neo4j Browser | Neo4j Bloom | Grafana | Datadog | This PRD |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|
| Query editor with syntax | Y | Y | N (NLP) | N | N | Y |
| Graph result visualization | Y | Y | Y | N | N | Y (6 views) |
| Schema/type browser | Y | Y (metadata) | Y | N | N | Y (Studio) |
| Cluster health dashboard | N | N | N | Y | Y | Y |
| Node-level metrics drill-down | N | N | N | Y | Y | Y |
| Force-directed topology | N | Partial | Y | N | N | Y |
| GPU monitoring | N | N | N | Plugin | Y | Y |
| RBAC data masking demo | N | N | N | N | N | Y |
| Dark/light theme | N | Y | Y | Y | Y | Y |
| Keyboard shortcuts / Cmd+K | N | Y | N | Y | Y | Y |
| Multi-tab results | N | Y (frames) | N | N | N | Y (5 tabs) |
| Export results | Y (JSON) | Y (CSV/JSON) | Y (CSV/PNG) | Y | Y | N |
| Real-time streaming | N | N | N | Y | Y | N |
| Alerting rules engine | N | N | N | Y | Y | N (display only) |
| Custom dashboard builder | N | N | N | Y | Y | N |
| Ontology/schema editing | Y (alter) | N (Cypher) | N | N | N | Y (dialog) |
| D3 chord/heatmap/ridgeline | N | N | N | Plugin | Plugin | Y |

**Confidence:** MEDIUM -- based on training data. Dgraph Ratel and Neo4j Browser/Bloom features are well-documented in my training data. Grafana and Datadog features are HIGH confidence.

---

## Table Stakes

Features that users of monitoring dashboards and graph database tools expect. Missing any of these would make the platform feel incomplete or unusable for the POC demo.

| # | Feature | Why Expected | Complexity | PRD Status | Notes |
|---|---------|--------------|:----------:|:----------:|-------|
| T1 | **Dashboard overview with metric cards** | Every monitoring tool (Grafana, Datadog, exemONE) leads with summary KPIs. Decision-makers need a single-screen health view. | Low | In PRD | 4 cards: nodes, relations, QPS, uptime |
| T2 | **Resource utilization gauges** | Grafana/Datadog always show CPU/Memory/Disk as radial or bar gauges. This is the visual language of infrastructure monitoring. | Low | In PRD | 3 gauges (270-degree arc) |
| T3 | **Time-series line charts** | The fundamental monitoring chart type. Grafana is built entirely on these. Users expect to see trends over time. | Med | In PRD | Dual-axis request rate + QPS |
| T4 | **Query editor with syntax awareness** | Both Dgraph Ratel and Neo4j Browser center around a query editor. A graph DB tool without one is incomplete. | Med | In PRD | GraphQL/DQL mode toggle |
| T5 | **Query results in table format** | Universal baseline. Every DB tool shows tabular results. This is the default everyone expects before any fancy visualization. | Low | In PRD | Standard table view |
| T6 | **Graph/network visualization of query results** | Neo4j Browser's core value. Dgraph Ratel shows graph results. Users expect to see relationships visually, not just in rows. | High | In PRD | D3 force-directed bipartite graph |
| T7 | **Schema/type browser** | Dgraph Ratel has a schema tab. Neo4j Browser shows metadata sidebar. Users need to understand the data model before querying. | Med | In PRD | Ontology Studio with 6 types |
| T8 | **Dark/light theme** | Industry standard since 2020. Neo4j Browser, Grafana, Datadog all support it. Monitoring tools are used in low-light NOC environments. | Low | In PRD | ThemeProvider with toggle |
| T9 | **Sidebar navigation with grouped sections** | Standard layout for complex dashboards (Grafana panels, Datadog nav). Users need clear information architecture. | Low | In PRD | 4 groups: Operations/Monitoring/Workspace/Admin |
| T10 | **Responsive charts** | All modern dashboards resize. Non-responsive charts feel broken on different monitors (especially FAB control room vs. laptop). | Low | In PRD | ResizeObserver on all D3 charts |
| T11 | **Authentication gate** | Even for demos, leaving a monitoring dashboard open is unacceptable in semiconductor environments. SK Siltron expects security posture. | Low | In PRD | Simple password gate |
| T12 | **Cluster topology visualization** | This is the hero feature that differentiates a graph DB management tool from generic monitoring. Neo4j Bloom and various infrastructure dashboards show node topology. | High | In PRD | Force/Radial with particle animation |

---

## Differentiators

Features that go beyond what comparable products offer. These are NOT expected but create competitive advantage, especially for the SK Siltron POC sales pitch.

| # | Feature | Value Proposition | Complexity | PRD Status | Notes |
|---|---------|-------------------|:----------:|:----------:|-------|
| D1 | **RBAC PII masking simulator** | No comparable product offers this. This directly addresses SK Siltron's data governance concern (semiconductor trade secrets, operator PII under Korean PIPA). This is the POC's killer demo moment. | Med | In PRD | 4 roles, real-time masking transformation |
| D2 | **6 result visualization modes** | Neo4j Browser offers 2 (table + graph). Dgraph Ratel offers 2 (JSON + graph). Having 6 modes (Table/Graph/Treemap/Arc/Scatter/Distribution) demonstrates eXemble's visualization depth -- a direct product DNA tie to EXEM's "Data Artist Group" brand. | High | In PRD | Each mode is a separate D3 component |
| D3 | **Semiconductor FAB domain data** | Generic graph tools show generic data. Having realistic FAB data (Equipment/Process/Wafer/Recipe/Defect/MaintenanceRecord with real manufacturer names -- ASML, TEL, KLA) makes the demo tangible for SK Siltron decision-makers. | Low | In PRD | Hardcoded seed data |
| D4 | **Chord diagram for ontology relationships** | Neither Ratel, Neo4j Browser, nor Grafana show relationship density as a chord diagram. This is a visually impressive chart that communicates the interconnectedness of the ontology at a glance. | Med | In PRD | D3 chord + ribbon |
| D5 | **GPU monitoring integrated with graph DB** | No graph database tool includes GPU monitoring. This positions eXemble as a full-stack platform that monitors the compute layer running the graph workloads (relevant for AI/ML workloads on graph data in FABs). | Med | In PRD | 4 A100 GPUs, heatmap, ridgeline |
| D6 | **Heatmap + Ridgeline chart toggle** | Grafana has heatmap plugins but no ridgeline. Combining both in a toggle shows data in complementary ways (density pattern vs. overlap comparison). This is a visualization sophistication signal. | Med | In PRD | D3GpuHeatmap + D3GpuRidgeline |
| D7 | **Brushable scatter plot** (DGraph query latency) | Only advanced tools like Grafana's Explore mode allow range selection. D3 brush-to-filter creates an interactive exploration feel that impresses in demos. | Med | In PRD | d3.brush() with filtered table |
| D8 | **Data flow particle animation** (cluster topology) | Pure demo wow-factor. No comparable product animates data flowing between cluster nodes. Shows the system is "alive." | Med | In PRD | d3.timer() particle on link paths |
| D9 | **Korean-first UI/UX** | All comparable products are English-first. Korean labels, Korean PII examples, Korean error messages -- this signals localization commitment to SK Siltron. | Low | In PRD | Korean strings throughout |
| D10 | **Ontology graph with 3 layout modes** | Neo4j Bloom offers force-directed only. Having force/radial/hierarchy gives users control over how they visualize the schema, suitable for different analysis tasks. | High | In PRD | D3OntologyGraph with BFS radial + d3.tree |
| D11 | **Command Palette (Cmd+K)** | Grafana has a similar feature. Neo4j Browser does not. This signals a modern, keyboard-driven UX that power users appreciate. | Low | In PRD | shadcn Command component |

---

## Anti-Features

Features to deliberately NOT build. Including these would waste time, add complexity, or actually hurt the POC demo.

| # | Anti-Feature | Why Avoid | What to Do Instead |
|---|--------------|-----------|-------------------|
| A1 | **Real-time data streaming / WebSocket live updates** | POC uses hardcoded data. Implementing real-time adds massive complexity (WebSocket infra, state management, reconnection logic) with zero demo benefit since there is no live Dgraph cluster to stream from. | Use static data with good animation to create the illusion of a live system. Particle animation on topology already achieves this. |
| A2 | **Custom dashboard builder** (drag-and-drop panels) | This is Grafana's core feature and would take months to build properly. For a POC, predefined layouts demonstrate the product vision. | Fixed, curated dashboard layouts that show the best possible presentation of each page. |
| A3 | **Alerting rules engine** | Grafana and Datadog have mature alerting systems. Building one from scratch adds complexity. The POC shows monitoring, not operations automation. | Display hardcoded "Recent Alerts" list to show the concept. Note it as a future integration point. |
| A4 | **CRUD for all entities** (full user/cluster/node management) | This is an admin tool feature, not a monitoring/visualization differentiator. It shifts focus from what EXEM is selling (visualization + AI ops). | Read-only user table with role badges. Ontology type "edit" dialog can be cosmetic (no actual persistence needed for POC). |
| A5 | **Export to CSV/JSON/PNG** | Nice to have but not a demo differentiator. Neo4j Browser has it; replicating it adds complexity without advancing the sales narrative. | Defer to post-POC. If asked in demo, acknowledge it as a planned feature. |
| A6 | **Mobile-responsive layout** | Semiconductor FAB monitoring happens on large screens in control rooms, not phones. The PRD explicitly excludes mobile. | Optimize for 1440px+ widescreen. Ensure the demo looks good on a projector/large display. |
| A7 | **Actual Dgraph ACL integration** | The PRD explicitly scopes this out. Client-side masking simulation is sufficient to demonstrate the concept. Real ACL integration requires a running Dgraph cluster with ACL configured. | Client-side PII masking functions that transform data based on selected role. This is already in the PRD and is the correct approach. |
| A8 | **Audit logging / access history** | Important for production but irrelevant for POC demo. Adds a backend write path that complicates the architecture. | Mention in the RBAC info banner that audit logging is a planned feature. |
| A9 | **Multi-language / i18n system** | The POC is Korean-first for SK Siltron. Building a full i18n system is premature. | Hardcode Korean strings. Keep English for technical terms (GraphQL, DQL, CPU, etc.) per Korean tech industry convention. |
| A10 | **Plugin / extension system** | Grafana's plugin ecosystem took years to build. This is a platform feature, not a POC feature. | Fixed feature set that demonstrates the product vision. |

---

## PRD Gap Analysis

Features missing from the PRD that comparable platforms offer and should be considered.

### Gaps Worth Addressing (Low Effort, High Impact)

| # | Missing Feature | Why It Matters | Comparable Has It | Effort | Recommendation |
|---|----------------|----------------|-------------------|:------:|----------------|
| G1 | **Loading states for D3 charts** | Charts rendering blank then popping in looks broken. Skeleton loaders or shimmer effects are standard in Datadog/Grafana. | Grafana, Datadog | Low | Add skeleton placeholders for each chart card. The PRD mentions "Loading..." for auth but not for charts. |
| G2 | **Empty state for query console** (no results) | Neo4j Browser shows a helpful "Run a query to see results" message. An empty panel looks like a bug. | Neo4j Browser, Ratel | Low | Add friendly empty states with example query suggestions. |
| G3 | **Breadcrumb navigation** | Listed in PRD (HeaderBar) but easy to overlook. Grafana and Datadog both use breadcrumbs. Important for context in a 6-page app. | Grafana, Datadog | Low | Already in PRD -- ensure implementation. |

### Gaps to Acknowledge But NOT Build

| # | Missing Feature | Why Skip | What Competitors Offer |
|---|----------------|----------|----------------------|
| G4 | **Query autocompletion** | Neo4j Browser has Cypher autocomplete. Building GraphQL/DQL autocomplete requires schema introspection from a live Dgraph. With hardcoded data, this adds major complexity for little demo value. | Neo4j Browser (Cypher), Ratel (partial) |
| G5 | **Query explain/profile** | Both Neo4j and Dgraph offer query profiling. Requires a live database. Cannot be simulated meaningfully. | Neo4j Browser (PROFILE/EXPLAIN), Ratel (query plan) |
| G6 | **Graph neighborhood expansion** (double-click to expand nodes) | Neo4j Bloom's signature interaction. Requires live queries to fetch adjacent nodes. Cannot work with hardcoded data. | Neo4j Bloom |
| G7 | **Saved perspectives / bookmarks** | Neo4j Bloom has "perspectives" (saved graph views). Useful but complex -- needs persistence and state management. | Neo4j Bloom |
| G8 | **Multi-cluster management** | Grafana and Datadog manage multiple clusters. POC has one cluster (SKS-FAB1-PROD). Over-engineering for a single-cluster demo. | Grafana, Datadog |

---

## Feature Dependencies

```
PasswordGate ─────────────────────────────> All Pages (auth required first)
    |
    v
AppSidebar + HeaderBar ──────────────────> All Pages (layout must exist)
    |
    v
ThemeProvider ────────────────────────────> All D3 Charts (theme detection)
    |
    +──> Dashboard (T1-T3, D4)
    |       |- Metric Cards (T1) ── standalone
    |       |- Resource Gauges (T2) ── standalone
    |       |- Dual Line Chart (T3) ── standalone
    |       |- Chord Diagram (D4) ── standalone
    |       |- Node Scatter ── standalone
    |       |- Resource Bars ── standalone
    |       '- Recent Alerts ── standalone
    |
    +──> DGraph Monitoring (T12, D7, D8)
    |       |- Cluster Topology (T12) ── standalone, most complex
    |       |    '- Particle Animation (D8) ── depends on topology
    |       |- Node Detail Panel ── depends on Topology (click interaction)
    |       |- Brushable Query Scatter (D7) ── standalone
    |       '- Shard Bars ── standalone
    |
    +──> GPU Monitoring (D5, D6)
    |       |- GPU Summary Cards ── standalone
    |       |- Performance Trends (multiline) ── standalone
    |       |- Heatmap/Ridgeline Toggle (D6) ── standalone
    |       '- Comparison Bars ── standalone
    |
    +──> Ontology Studio (T7, D10)
    |       |- Type List (T7) ── standalone
    |       |- Ontology Graph (D10) ── depends on Type List (selection sync)
    |       |- Type Distribution Bars ── standalone
    |       '- Type Edit Dialog ── depends on Type List (selection)
    |
    +──> Query Console (T4-T6, D1, D2)
    |       |- Query Editor (T4) ── standalone
    |       |- Template Selector ── standalone
    |       |- Query History ── requires Supabase API
    |       |- Multi-Tab Results ── depends on Query Editor (execution)
    |       |    '- 6 Result Views (D2) ── depends on Multi-Tab
    |       |         |- Table View (T5) ── standalone
    |       |         |- Graph View (T6) ── standalone
    |       |         |- Treemap ── standalone
    |       |         |- Arc Diagram ── standalone
    |       |         |- Scatter ── standalone
    |       |         '- Distribution ── standalone
    |       |- PII Masking Simulator (D1) ── standalone module
    |       |    |- Role Selector ── standalone
    |       |    |- PII Demo Tabs ── depends on pii-config.ts
    |       |    |- PII Table ── depends on Role Selector + pii-masking.ts
    |       |    '- Info Banner ── depends on Role Selector
    |       '- pii-masking.ts (lib) ── standalone, no dependencies
    |
    '──> User Management (T11)
            |- User Table ── requires Supabase API
            |- Role Badges ── standalone
            '- Role Tooltips ── standalone

Key dependency chains:
1. Auth + Layout MUST be built first (all pages depend on it)
2. Chart shared utilities (chart-utils.ts, chart-theme.ts) MUST precede any D3 chart
3. pii-masking.ts and pii-config.ts MUST precede PII Table component
4. Supabase schema/seed MUST precede User Management and Query History
5. Each page is independent of other pages (no cross-page state)
```

---

## MVP Recommendation

For the SK Siltron POC demo, prioritize in this order:

### Must Ship (Demo Fails Without These)

1. **Auth + Layout + Navigation** (T9, T11) -- The container for everything. Without this, there is no app to demo.
2. **Ontology Dashboard** (T1, T2, T3, D4) -- The opening impression. Decision-makers see this first. Resource gauges + chord diagram immediately communicate "sophisticated monitoring."
3. **Cluster Topology** (T12, D8) -- The hero visualization. Force-directed graph with particle animation is the most visually striking element and directly demonstrates graph database expertise.
4. **Query Console with PII Masking** (T4, T5, T6, D1) -- The killer demo. The RBAC masking simulator is the single most differentiated feature. This is what sells eXemble's data governance story to SK Siltron.
5. **Ontology Studio** (T7, D10) -- Shows schema understanding and management capability. The 3-layout-mode graph is impressive.

### Should Ship (Demo Weaker Without These)

6. **GPU Monitoring** (D5, D6) -- Demonstrates full-stack monitoring. Heatmap + ridgeline toggle is visually impressive.
7. **User Management** (role badges) -- Completes the RBAC story by showing who has what role.
8. **All 6 result view modes** in Query Console (D2) -- Each additional view mode reinforces the "Data Artist" brand.

### Defer If Time-Pressed

9. **Command Palette** (D11) -- Nice but demo-irrelevant. Audience will not try Cmd+K during a presentation.
10. **Welcome Popup** -- Useful for self-guided exploration but not needed for a presented demo.
11. **Query History** (Supabase API) -- Requires real API integration. Can be mocked with hardcoded data if needed.

### Phase Ordering Rationale

The recommended order follows these principles:

- **Demo narrative flow:** Dashboard (overview) -> DGraph (deep dive) -> Studio (schema) -> Query Console with PII (governance) -> GPU (infrastructure) -> Users (admin). This tells a story from high-level health down to data protection.
- **Complexity gradient:** Start with simpler charts (gauges, bars) to build momentum, then tackle the complex force-directed topology, then the PII system.
- **Risk front-loading:** The two highest-risk components (Cluster Topology with particle animation, PII Masking Simulator) are in the first 4 items. If they take longer than expected, less critical features can be cut.
- **Independence:** Pages are independent, so any page can be deprioritized without breaking others.

---

## Semiconductor FAB Domain-Specific Features

These features are not found in generic graph DB or monitoring tools but are relevant because the client is a semiconductor FAB.

| Feature | Relevance to SK Siltron | In PRD? | Priority |
|---------|------------------------|:-------:|:--------:|
| Equipment type taxonomy (CVD, Etcher, Furnace, etc.) | Shows domain understanding | Yes | High |
| Wafer lot tracking visualization | Core to FAB operations | Partial (lot_id in PII data) | Medium |
| PII protection for operator/technician names | PIPA compliance, union sensitivity in Korean FABs | Yes | Critical |
| Equipment-to-bay spatial mapping | FAB layout understanding | Yes (BAY02-BAY11) | Medium |
| Maintenance record correlation | Equipment downtime is the #1 FAB cost driver | Yes (ontology type) | Medium |
| Defect tracking correlation to process | Yield improvement is the #1 FAB priority | Yes (ontology type) | Medium |
| OEE (Overall Equipment Effectiveness) metrics | Standard FAB KPI -- not in PRD but would be table stakes for real deployment | No | Future |

---

## Sources

- **Dgraph Ratel:** Training data knowledge of Dgraph Ratel UI (query editor, schema browser, JSON/graph result views, ACL management). MEDIUM confidence -- Ratel's features have been stable but I cannot verify post-2024 changes.
- **Neo4j Browser:** Training data knowledge (Cypher editor, tabular + graph results, metadata sidebar, frames/multi-results, CSV/JSON export, dark mode). HIGH confidence -- well-documented, widely used.
- **Neo4j Bloom:** Training data knowledge (NLP search, perspective-based exploration, rule-based styling, neighborhood expansion, property-based filtering). MEDIUM confidence.
- **Grafana:** Training data knowledge (dashboard builder, panel system, alerting, plugin ecosystem, time-series focus, data source integrations). HIGH confidence.
- **Datadog:** Training data knowledge (infrastructure monitoring, APM, log management, alerting, dashboard builder, notebook exploration). HIGH confidence.
- **PRD v1.3:** Directly read from `/Users/chs/Downloads/exemble-ontology-docs-v1.3/01_PRD.md`. HIGH confidence.
- **D3 Spec v1.2:** Directly read from `/Users/chs/Downloads/exemble-ontology-docs-v1.3/03_D3-Visualization-Spec.md`. HIGH confidence.
- **Data Schema v1.3:** Directly read from `/Users/chs/Downloads/exemble-ontology-docs-v1.3/02_Data-Schema.md`. HIGH confidence.

**Note:** WebSearch and WebFetch tools were unavailable during this research. All competitor analysis is based on training data (cutoff ~mid 2025). Recent feature additions to Neo4j, Dgraph, Grafana, or Datadog may not be reflected. LOW confidence on any changes after early 2025.

---

*Feature landscape research: 2026-02-19*
