# Domain Pitfalls

**Domain:** D3.js + Next.js Monitoring Dashboard (eXemble Ontology Platform)
**Researched:** 2026-02-19
**Confidence:** HIGH for D3/React patterns (verified with official D3 docs), MEDIUM for Tailwind v4 specifics (verified with upgrade guide), MEDIUM for Supabase edge cases (training data)

---

## Critical Pitfalls

Mistakes that cause rewrites, major performance regressions, or deployment failures.

---

### Pitfall 1: D3 DOM Manipulation Fighting React's Virtual DOM

**What goes wrong:** D3's `d3.select().append()` / `.remove()` directly mutates the DOM. React expects to own the DOM tree. When both try to manage the same elements, you get ghost nodes, hydration mismatches, lost event handlers, and state that silently desyncs from what the user sees.

**Why it happens:** D3 was designed pre-React. Most D3 tutorials and Observable notebooks use imperative `d3.select()` patterns. Developers copy these patterns inside `useEffect` without restricting D3's scope to a ref-contained subtree.

**Consequences:**
- Hydration errors on every page load (Next.js SSR renders empty SVG, client renders filled SVG)
- Double-rendered elements after React re-render + D3 append
- Event handlers attached by D3 get silently removed by React reconciliation
- Memory leaks from orphaned DOM nodes that React doesn't know about

**Prevention:**
1. **Declarative-first approach (official D3 recommendation).** Use D3 for math only (`d3-scale`, `d3-shape`, `d3-array`, `d3-interpolate`, `d3-format`, `d3-hierarchy`). Render with JSX.
2. **Ref-isolated imperative zones.** When D3 must touch the DOM (axes, brush, zoom, drag, force simulation ticks), constrain it to a `<g ref={containerRef}>` element. React owns everything outside; D3 owns everything inside.
3. **Never mix.** A given `<g>` subtree is either React-managed OR D3-managed. Not both.

**Detection:** Hydration warnings in dev console. Elements appearing twice. Click handlers that stop working after data updates.

**Confidence:** HIGH -- verified against official D3 documentation at d3js.org/getting-started#d3-in-react.

**Phase:** Must be established as a pattern in Phase 1 (foundation). Every chart built afterward follows this convention.

---

### Pitfall 2: D3 Charts Rendered During SSR Causing Hydration Mismatch

**What goes wrong:** Next.js App Router server-renders components by default. D3 code that accesses `window`, `document`, or `navigator` crashes on the server. Even if it doesn't crash, the server-rendered SVG will differ from the client-rendered SVG (because D3 calculations may depend on measured DOM dimensions), causing React hydration errors.

**Why it happens:** Forgetting that Next.js 16 App Router defaults to Server Components. Even Client Components (with `"use client"`) are pre-rendered on the server unless explicitly disabled.

**Consequences:**
- `ReferenceError: window is not defined` during build
- Hydration mismatch warnings flooding the console
- Charts flash or disappear on initial load
- Force simulation starts with wrong dimensions

**Prevention:**
1. **Wrap all D3 chart components with `next/dynamic` and `{ ssr: false }`.** This is the official Next.js pattern for client-only components (verified with Next.js 16.1.6 docs):
   ```typescript
   const TopologyGraph = dynamic(
     () => import('@/components/charts/TopologyGraph'),
     { ssr: false, loading: () => <ChartSkeleton /> }
   );
   ```
2. **Create a shared `DynamicChart` wrapper** that standardizes the `ssr: false` + loading skeleton pattern for all 19 charts.
3. **Never import D3 at the top level of a Server Component.** D3's full bundle references `document` internally.

**Detection:** Build fails with `window is not defined`. Console hydration warnings. Charts that briefly flash wrong layout on page load.

**Confidence:** HIGH -- verified with Next.js 16.1.6 official lazy loading documentation.

**Phase:** Phase 1 (foundation). The `DynamicChart` wrapper must exist before any chart is built.

---

### Pitfall 3: Force-Directed Graph Destroying Performance with 100+ Nodes

**What goes wrong:** `d3-force` simulation runs `tick` callbacks ~300 times during alpha decay. Each tick, if you re-render via React state update (`setNodes(...)`) or call expensive DOM operations, you get 300 React re-renders or 300 DOM reflows. The UI freezes. On mobile, the browser may kill the tab.

**Why it happens:** The naive pattern is `simulation.on('tick', () => setPositions([...nodes]))`. Each tick triggers a full React reconciliation cycle. At 200 nodes with 400 links, that is 300 ticks x 600 DOM elements = catastrophic.

**Consequences:**
- 2-10 second freeze when graph initializes or data changes
- Frame rate drops below 10fps during simulation
- Mobile Safari force-kills the tab
- Drag interaction becomes unusable (30ms+ latency per frame)

**Prevention:**
1. **Canvas, not SVG, for large graphs.** If node count exceeds ~150, use `<canvas>` with `d3-force`. Canvas repaints are a single operation vs. hundreds of DOM mutations.
2. **For SVG (under 150 nodes): direct DOM mutation in tick handler.** Do NOT use React state for node positions during simulation. Instead:
   ```typescript
   simulation.on('tick', () => {
     // Direct DOM mutation -- React doesn't know, doesn't care
     d3.selectAll('.node')
       .attr('cx', d => d.x)
       .attr('cy', d => d.y);
     d3.selectAll('.link')
       .attr('x1', d => d.source.x)
       // ...
   });
   ```
3. **Reduce tick count.** Set `simulation.alphaDecay(0.05)` (default 0.0228) to halve iteration count. Set `simulation.velocityDecay(0.4)` for faster settling.
4. **Throttle re-renders.** If React state must be updated (for tooltips, selection state), do it on `simulation.on('end', ...)` not on every tick.
5. **`requestAnimationFrame` gating.** Wrap tick handler so it only fires once per animation frame.

**Detection:** Open Chrome DevTools Performance tab. If you see hundreds of "Recalculate Style" + "Layout" events in a burst during graph load, you have this problem.

**Confidence:** HIGH -- well-established D3 performance pattern, consistent across all major D3 resources.

**Phase:** Phase 2 (topology graph). This decision (Canvas vs SVG, tick handler strategy) must be made at the start of topology implementation, not retrofitted.

---

### Pitfall 4: 19 D3 Charts Bloating Bundle to 500KB+ Without Code Splitting

**What goes wrong:** `import * as d3 from "d3"` pulls in the entire D3 library (~250KB minified). If 19 chart components all do this, and they are all statically imported, the initial page load includes the entire D3 bundle plus all 19 chart implementations regardless of which charts are visible.

**Why it happens:** D3 v7 is a meta-package that re-exports 30+ sub-modules. Most tutorials use `import * as d3 from "d3"` for convenience.

**Consequences:**
- Initial JS bundle exceeds 500KB
- Time to Interactive increases by 1-3 seconds
- Vercel Edge function size limits may be hit
- Mobile users on slow connections see a blank page for 5+ seconds

**Prevention:**
1. **Import only the sub-modules you need:**
   ```typescript
   // BAD: ~250KB
   import * as d3 from "d3";

   // GOOD: ~15KB for this specific chart
   import { scaleLinear, extent } from "d3-scale";
   import { line, curveMonotoneX } from "d3-shape";
   import { axisBottom, axisLeft } from "d3-axis";
   ```
2. **Dynamic import every chart component** with `next/dynamic` and `{ ssr: false }`:
   ```typescript
   const HeatmapChart = dynamic(() => import('@/components/charts/Heatmap'), {
     ssr: false,
     loading: () => <ChartSkeleton type="heatmap" />
   });
   ```
3. **Route-based code splitting.** If charts are spread across dashboard tabs/pages, Next.js App Router automatically code-splits by route. Leverage this by putting chart-heavy views on separate routes.
4. **Verify with `next build` output.** Check the "First Load JS" column. Any route over 200KB needs investigation.

**Detection:** Run `npx next build` and check bundle sizes. Use `@next/bundle-analyzer` to visualize what is in each chunk.

**Confidence:** HIGH -- standard Next.js optimization pattern, verified with official docs.

**Phase:** Phase 1 (establish import conventions) and Phase 3+ (enforce during chart implementation). Add a lint rule or code review checklist item: "No `import * as d3 from 'd3'`."

---

### Pitfall 5: D3 useEffect Cleanup Causing Memory Leaks

**What goes wrong:** D3 simulations, zoom behaviors, brush instances, and timer-based transitions allocate resources that persist beyond component unmount. Without cleanup, each navigation or re-render leaks simulation timers, event listeners, and DOM references.

**Why it happens:** `useEffect` cleanup functions are easy to forget. D3's API doesn't make it obvious what needs cleanup. Force simulations have internal timers. Zoom/brush attach event listeners to the window. Transitions create internal timers.

**Consequences:**
- Memory grows with each page navigation (noticeable in long demo sessions)
- Multiple force simulations running simultaneously after tab switches
- Event listeners from unmounted components respond to interactions
- Eventual browser tab crash during extended demos

**Prevention:**
1. **Always return cleanup from useEffect:**
   ```typescript
   useEffect(() => {
     const simulation = d3.forceSimulation(nodes)
       .force('charge', d3.forceManyBody())
       .force('link', d3.forceLink(links));

     simulation.on('tick', handleTick);

     return () => {
       simulation.stop();  // Stop the internal timer
       simulation.on('tick', null);  // Remove listener
     };
   }, [nodes, links]);
   ```
2. **Zoom/Brush cleanup:**
   ```typescript
   useEffect(() => {
     const zoom = d3.zoom().on('zoom', handleZoom);
     const svg = d3.select(svgRef.current);
     svg.call(zoom);

     return () => {
       svg.on('.zoom', null);  // Remove all zoom event listeners
     };
   }, []);
   ```
3. **Transition interruption:** Call `selection.interrupt()` in cleanup to cancel running transitions.
4. **Create a `useD3` custom hook** that standardizes cleanup patterns across all 19 charts.

**Detection:** Chrome DevTools Memory tab. Take heap snapshots before and after navigating away from a chart page and back. Growing "Detached HTMLElement" count = leak.

**Confidence:** HIGH -- standard React + D3 integration concern, well-documented.

**Phase:** Phase 1 (create `useD3` hook as part of foundation). Enforce in code review for all chart components.

---

## Moderate Pitfalls

Issues that cause significant rework or degraded UX but not full rewrites.

---

### Pitfall 6: Dark/Light Theme Toggle Breaking D3 SVG Colors

**What goes wrong:** D3 SVG elements use inline `fill`, `stroke`, and `style` attributes set at render time. When the user toggles dark/light mode, Tailwind CSS variables update but D3's hardcoded inline styles do not. Charts show dark-mode colors on a light background or vice versa.

**Why it happens:** D3's imperative style application (`selection.attr('fill', '#333')`) bakes colors at render time. Unlike HTML elements styled with Tailwind classes, SVG attributes set by D3 don't respond to CSS variable changes.

**Consequences:**
- Charts become unreadable after theme toggle (dark lines on dark background)
- Inconsistent appearance: HTML elements switch themes but charts don't
- Demo embarrassment when presenting to SK Siltron

**Prevention:**
1. **Use CSS variables for ALL D3 colors, never hardcoded hex values:**
   ```typescript
   // BAD
   selection.attr('fill', '#1f2937');

   // GOOD -- responds to theme changes automatically
   selection.attr('fill', 'var(--color-foreground)');
   // Or use CSS classes instead of inline attributes
   selection.attr('class', 'fill-foreground stroke-border');
   ```
2. **For the declarative pattern (JSX-rendered SVG):** Use Tailwind classes directly:
   ```tsx
   <circle cx={x} cy={y} r={5} className="fill-primary stroke-background" />
   ```
3. **For the imperative pattern (D3-managed subtrees):** Either use CSS variables in attr calls, or re-run the D3 rendering effect when theme changes:
   ```typescript
   const { theme } = useTheme(); // from next-themes
   useEffect(() => {
     // Re-render chart when theme changes
     renderChart(containerRef.current, data, theme);
   }, [data, theme]);
   ```
4. **Define a chart color palette** as CSS variables in your `@theme` block that automatically flip with dark mode.

**Detection:** Toggle theme. If any chart element doesn't change, it has hardcoded colors.

**Confidence:** HIGH -- inherent to how SVG inline attributes work vs CSS variables.

**Phase:** Phase 1 (define chart color palette as CSS variables). Enforce in every chart implementation phase.

---

### Pitfall 7: Tailwind CSS v4 Configuration Paradigm Shift

**What goes wrong:** Tailwind CSS v4 replaced `tailwind.config.js` with CSS-based `@theme` directives and `@import "tailwindcss"`. Developers accustomed to v3 patterns try to use `theme()` function, JS-based config, or deprecated utility names. shadcn/ui components may ship with v3 assumptions.

**Why it happens:** Tailwind v4 is a major rewrite. Most online tutorials, Stack Overflow answers, and even some component libraries still reference v3 patterns. The project already has `@tailwindcss/postcss` v4 installed.

**Consequences:**
- Styles silently not applying (no error, just missing styles)
- `theme()` function calls returning wrong values or erroring
- Default border color changed from `gray-200` to `currentColor` -- unexpected dark borders everywhere
- `shadow-sm` now means what `shadow-xs` used to mean (subtle size shifts)
- Variant stacking order reversed (left-to-right in v4 vs right-to-left in v3)

**Prevention (verified with official Tailwind CSS v4 upgrade guide):**
1. **Know the renamed utilities:**
   - `shadow-sm` is now `shadow-xs`, `shadow` is now `shadow-sm`
   - `outline-none` is now `outline-hidden`
   - `ring` default width changed from 3px to 1px (use `ring-3` for old behavior)
   - Opacity modifiers replace separate opacity utilities: `bg-black/50` not `bg-opacity-50`
2. **Always specify border color:** `border border-gray-200` not just `border`
3. **Use `@theme` for custom values, not `tailwind.config.js`:**
   ```css
   @import "tailwindcss";

   @theme {
     --color-chart-primary: oklch(0.7 0.15 250);
     --color-chart-secondary: oklch(0.6 0.12 180);
   }
   ```
4. **Arbitrary value syntax changed:** `bg-[--brand-color]` becomes `bg-(--brand-color)` in v4
5. **When installing shadcn/ui components,** verify they are v4-compatible. Run `npx @tailwindcss/upgrade` if copying v3-era component code.

**Detection:** Visual regression testing. Side-by-side comparison with design mockups. Missing borders, wrong shadows, and unexpected ring widths are the telltale signs.

**Confidence:** HIGH -- verified against official Tailwind CSS v4 upgrade guide.

**Phase:** Phase 1 (ensure all base styles use v4 conventions before building components).

---

### Pitfall 8: CSS Variable Resolution Timing with D3 Transitions

**What goes wrong:** D3 transitions interpolate between start and end values. If the start or end value is a CSS variable string like `var(--color-primary)`, D3 cannot interpolate it -- it doesn't resolve CSS variables. The transition either jumps instantly or produces garbage intermediate values.

**Why it happens:** D3's interpolation system works with concrete values (numbers, hex colors, RGB). CSS `var()` references are opaque strings that only the browser's CSS engine can resolve.

**Consequences:**
- Transitions between colors appear as instant jumps instead of smooth fades
- Animated chart elements flash or flicker during data updates
- Theme transitions look broken while HTML elements smoothly transition

**Prevention:**
1. **Resolve CSS variables before passing to D3 transitions:**
   ```typescript
   const computedStyle = getComputedStyle(document.documentElement);
   const primaryColor = computedStyle.getPropertyValue('--color-primary').trim();

   selection.transition()
     .duration(300)
     .attr('fill', primaryColor);  // Resolved value, not var()
   ```
2. **Create a `useChartColors()` hook** that resolves theme CSS variables into concrete color values and updates when theme changes:
   ```typescript
   function useChartColors() {
     const { theme } = useTheme();
     const [colors, setColors] = useState(resolveColors());
     useEffect(() => {
       // Re-resolve after theme change (CSS vars have new values)
       requestAnimationFrame(() => setColors(resolveColors()));
     }, [theme]);
     return colors;
   }
   ```
3. **For non-transitioning elements,** `var(--color-primary)` works fine as a static attribute. Only transitions need resolved values.

**Detection:** Any D3 `.transition().attr('fill', 'var(--...')` that doesn't smoothly animate.

**Confidence:** HIGH -- inherent to how D3 interpolation works with CSS custom properties.

**Phase:** Phase 1 (create `useChartColors` hook). Used by every chart that has transitions.

---

### Pitfall 9: Force-Directed Graph Touch/Mobile Interaction Failures

**What goes wrong:** D3's drag and zoom behaviors use mouse events by default. On touch devices, pinch-to-zoom conflicts with browser's native zoom. Drag events on nodes conflict with scroll. Touch targets are too small. The force graph becomes unusable on tablets (relevant for FAB floor demos).

**Why it happens:** D3 v7 does support touch events, but the default configuration doesn't prevent browser default behaviors. Touch targets sized for desktop cursors (5px radius circles) are unusable with fingers.

**Consequences:**
- Pinch-to-zoom zooms the entire page instead of the graph
- Dragging a node scrolls the page
- Touch targets too small to hit reliably
- Two-finger interactions don't work correctly for panning

**Prevention:**
1. **Set `touch-action: none` on the SVG container CSS:**
   ```css
   .topology-container svg {
     touch-action: none;  /* Prevents browser handling of touch */
   }
   ```
2. **Increase touch target sizes:** Minimum 44x44px hit areas (Apple HIG guideline). Use invisible larger circles behind visible smaller ones for hit detection.
3. **Configure D3 zoom for touch:**
   ```typescript
   const zoom = d3.zoom()
     .filter(event => {
       // Allow touch events and non-right-click mouse events
       return !event.ctrlKey && !event.button;
     })
     .touchable(true);
   ```
4. **Prevent scroll on SVG container:** Use `event.preventDefault()` in zoom/drag event handlers.
5. **Test on actual iPad/tablet early.** Simulator touch events differ from real device behavior.

**Detection:** Open Chrome DevTools, toggle device toolbar, try to drag nodes and zoom the graph.

**Confidence:** MEDIUM -- D3 touch support is documented but specific interaction patterns vary by version.

**Phase:** Phase 2 (topology graph implementation). Test on physical device at milestone end.

---

### Pitfall 10: Supabase Connection Pool Exhaustion in Development

**What goes wrong:** Next.js dev server with hot reload creates a new Supabase client on every file save. Each client opens a connection. With frequent saves during development, you exhaust the free-tier connection limit (available pool connections on Supabase free tier) and get connection refused errors.

**Why it happens:** Next.js hot module replacement re-executes module-level code. If `createClient()` is called at module scope without singleton protection, each reload creates a new client instance.

**Consequences:**
- "Too many connections" errors during development
- Intermittent data fetch failures
- Confusing because it works after restart, then breaks again after several hot reloads

**Prevention:**
1. **Singleton pattern for browser client** (the project already has `src/utils/supabase/client.ts` -- ensure it uses singleton):
   ```typescript
   import { createBrowserClient } from '@supabase/ssr';

   let client: ReturnType<typeof createBrowserClient> | null = null;

   export function getSupabaseClient() {
     if (!client) {
       client = createBrowserClient(
         process.env.NEXT_PUBLIC_SUPABASE_URL!,
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
       );
     }
     return client;
   }
   ```
2. **Server client is fine** -- `createServerClient` in server components/actions is per-request by design.
3. **For the POC with demo data:** Consider using local JSON files or in-memory data for development, hitting Supabase only in staging/production.

**Detection:** Console errors containing "connection" or "pool" during rapid development iteration.

**Confidence:** MEDIUM -- well-known Next.js + external DB pattern, Supabase specifics from training data.

**Phase:** Phase 1 (verify client.ts uses singleton pattern during Supabase setup).

---

### Pitfall 11: Over-Normalized Schema for Demo/POC Data

**What goes wrong:** Designing a fully normalized relational schema for what is essentially a demo dataset. Five JOIN tables for data that could be a single denormalized table. Adds complexity to queries, slows down Supabase reads (each JOIN = another round trip through PostgREST), and makes seed data maintenance painful.

**Why it happens:** Engineering instinct says "normalize everything." But for a POC with synthetic semiconductor FAB data, normalization adds cost without benefit.

**Consequences:**
- Complex RLS policies across multiple tables
- Slow dashboard queries (multiple JOINs for a single chart's data)
- Painful seed data updates (changing one entity requires updating 5 tables)
- Supabase free tier row limits hit faster with junction tables

**Prevention:**
1. **Denormalize for read performance.** Dashboard data should be queryable in 1-2 queries per chart, not 5.
2. **Use views or materialized views** for complex aggregations rather than forcing the client to JOIN.
3. **Schema design principle for POC:** Optimize for demo query speed, not write normalization.
4. **Recommended structure:**
   - `equipment` table (denormalized, includes zone/area info)
   - `metrics` table (time-series, partitioned by type)
   - `alerts` table (denormalized, includes equipment info)
   - `users` table (for RBAC demo)
   - Avoid: separate `zones`, `areas`, `equipment_zones`, `metric_types` junction tables
5. **Use Supabase database functions (RPC)** for complex aggregations rather than client-side JOINs.

**Detection:** If any single chart component requires more than 2 Supabase queries, the schema is probably over-normalized.

**Confidence:** MEDIUM -- general database design wisdom applied to Supabase context.

**Phase:** Phase 1 (schema design). Get this right before building any data-fetching logic.

---

### Pitfall 12: React 19 + D3 Event Handler Conflicts

**What goes wrong:** React 19 (which this project uses -- `"react": "19.2.3"`) changed event delegation. D3 attaches native DOM event listeners directly on elements. When React 19 synthetic events and D3 native events both handle the same interaction (click, mouseover), event propagation behaves unexpectedly -- D3 handlers may fire before React handlers, or `stopPropagation` in one system doesn't stop the other.

**Why it happens:** React 19 attaches events at the root element. D3 attaches events directly on SVG elements. These are separate listener registrations that don't share propagation control.

**Consequences:**
- Clicking a D3 node triggers both D3's click handler AND a React onClick on a parent
- Tooltip shows AND panel opens simultaneously
- Drag operations trigger parent scroll or navigation
- Inconsistent behavior between development and production (React batching differs)

**Prevention:**
1. **Clear ownership boundary:** If an SVG element has D3 event handlers, don't also put React onClick on it or its ancestors within the D3-managed subtree.
2. **Use `event.stopPropagation()` in D3 handlers** to prevent events from reaching React's root listener:
   ```typescript
   node.on('click', (event, d) => {
     event.stopPropagation();
     handleNodeClick(d);
   });
   ```
3. **For communication from D3 to React,** use a callback pattern or custom events, not shared click handlers:
   ```typescript
   // D3 side
   node.on('click', (event, d) => {
     event.stopPropagation();
     onNodeSelect(d.id);  // Callback passed from React component
   });
   ```
4. **Never nest React interactive elements inside D3-managed SVG subtrees.**

**Detection:** Double-firing of click handlers. Unexpected navigation on node interactions. Console warnings about event handling.

**Confidence:** MEDIUM -- React 19 event system is relatively new; specific D3 interaction details based on training data.

**Phase:** Phase 2 (interactive charts). Establish the event boundary pattern before building complex interactions.

---

## Minor Pitfalls

Issues that cause annoyance, small bugs, or minor time waste.

---

### Pitfall 13: D3 Axis Rendering Producing Extra DOM Elements on Re-render

**What goes wrong:** `d3.axisBottom(scale)` appends tick marks and labels when called. If called repeatedly (on each React re-render via `useEffect` without proper cleanup), ticks accumulate -- you get double, triple, quadruple axis labels.

**Why it happens:** D3's axis generator appends elements. It doesn't clear existing ones first (unlike `.join()` which handles enter/update/exit).

**Consequences:**
- Overlapping tick labels
- Gradually degrading performance (hundreds of hidden text elements)
- Confusing visual artifacts

**Prevention:**
```typescript
useEffect(() => {
  const g = d3.select(axisRef.current);
  g.selectAll('*').remove();  // Clear before re-rendering
  g.call(d3.axisBottom(xScale));
  // OR, better: use .call() which handles update
  // D3's axis function actually does handle updates if called on the same <g>
  // but only if the <g> already has axis elements from a previous .call()
}, [xScale]);
```
The cleanest approach: just call `g.call(d3.axisBottom(xScale))` on the same `<g>` element. D3's axis function handles enter/update internally. The problem is when you change the ref or recreate the `<g>`.

**Detection:** Inspect axis `<g>` element in DevTools. If it has more `<text>` children than expected tick count, you have this bug.

**Confidence:** HIGH -- classic D3 beginner mistake, extensively documented.

**Phase:** Phase 2+ (any chart with axes).

---

### Pitfall 14: ResizeObserver Loops and Chart Responsive Sizing

**What goes wrong:** Making charts responsive by observing container size with `ResizeObserver`. The chart re-renders, which changes container size, which triggers another observation, creating an infinite loop. Browser shows "ResizeObserver loop completed with undelivered notifications."

**Why it happens:** Chart render changes layout -> ResizeObserver fires -> chart re-renders -> layout changes -> loop.

**Consequences:**
- Console flooded with warnings
- Occasional janky resizing
- Performance degradation from unnecessary re-renders

**Prevention:**
1. **Debounce the resize handler:**
   ```typescript
   useEffect(() => {
     const observer = new ResizeObserver(
       debounce(([entry]) => {
         setDimensions({
           width: entry.contentRect.width,
           height: entry.contentRect.height
         });
       }, 100)
     );
     observer.observe(containerRef.current);
     return () => observer.disconnect();
   }, []);
   ```
2. **Use `width: 100%` on the container and let the chart read from it,** rather than the chart setting its own width.
3. **Set explicit aspect ratios on chart containers** to prevent layout shifts.

**Detection:** "ResizeObserver loop" warnings in console. Charts that briefly flash or jitter during resize.

**Confidence:** HIGH -- standard responsive chart issue.

**Phase:** Phase 1 (create `useChartDimensions` hook that all charts share).

---

### Pitfall 15: Client-Side PII Masking Giving False Security Confidence

**What goes wrong:** For the RBAC simulation, masking PII fields client-side (replacing values with "***" based on user role). The actual data is still sent over the network and visible in browser DevTools Network tab. Someone sees the masking and assumes the data is actually protected.

**Why it happens:** POC requirement says client-side masking is OK. But without explicit documentation, future developers or auditors may mistake it for real security.

**Consequences:**
- False sense of security if POC is extended to production
- Audit findings if someone inspects network traffic
- Scope creep if stakeholders think it is production-ready security

**Prevention:**
1. **Document explicitly** that masking is presentation-only:
   ```typescript
   /**
    * CLIENT-SIDE MASKING -- FOR DEMO PURPOSES ONLY
    * This masks PII in the UI but does NOT prevent data exposure.
    * Production implementation requires server-side RLS policies.
    * See: .planning/research/PITFALLS.md #15
    */
   function maskPII(value: string, role: UserRole): string { ... }
   ```
2. **Add a visible "DEMO MODE" indicator** in the UI when masking is active.
3. **Create a `TODO.md` or code comment** listing what would need to change for production RBAC:
   - Supabase RLS policies that filter rows server-side
   - Column-level security on PII fields
   - Server-side data transformation before client delivery
4. **Keep masking logic in a single module** (`src/lib/masking.ts`) so it is easy to find and replace.

**Detection:** Open Network tab while viewing masked data. If the unmasked value is visible in the response, masking is client-side only.

**Confidence:** HIGH -- architectural decision, not a technical uncertainty.

**Phase:** Phase 3+ (when RBAC features are built). Document from the start.

---

### Pitfall 16: shadcn/ui Component CSS Conflicts with D3 SVG

**What goes wrong:** shadcn/ui components use Tailwind's `@layer` and CSS custom properties for theming. D3 SVG elements exist outside this system. Tooltip components from shadcn/ui may have z-index or positioning conflicts with D3-rendered SVG tooltips. Dialog overlays may not properly cover SVG elements.

**Why it happens:** SVG has its own stacking context rules that differ from HTML. `z-index` doesn't work inside SVG. Portaled HTML tooltips from shadcn/ui need explicit positioning relative to SVG coordinate space.

**Consequences:**
- Tooltips appear behind SVG elements
- Dropdown menus clipped by SVG viewBox
- Modal overlays don't cover charts properly

**Prevention:**
1. **Use HTML tooltips positioned with Radix portals (shadcn/ui default), not SVG-native tooltips.** Portaled tooltips render at the document root, avoiding SVG stacking issues.
2. **For chart-specific tooltips,** use absolute-positioned HTML `<div>` overlaid on the SVG container, not `<title>` or `<text>` inside the SVG:
   ```tsx
   <div className="relative">
     <svg ref={svgRef} />
     {tooltip && (
       <div
         className="absolute pointer-events-none bg-popover text-popover-foreground rounded-md shadow-md p-2"
         style={{ left: tooltip.x, top: tooltip.y }}
       >
         {tooltip.content}
       </div>
     )}
   </div>
   ```
3. **Set `overflow: visible` on SVG if elements need to render outside the viewBox** (e.g., axis labels).

**Detection:** Hover over chart elements. If tooltips are invisible or clipped, there is a stacking/overflow issue.

**Confidence:** MEDIUM -- common pattern but specific shadcn/ui + D3 interactions based on training data.

**Phase:** Phase 2 (when building interactive chart features with tooltips).

---

### Pitfall 17: Next.js 16 App Router Data Fetching Patterns Misapplied to Chart Data

**What goes wrong:** Using Server Components to fetch data for D3 charts, then passing large datasets as props to Client Components. Next.js serializes these props during SSR, bloating the HTML payload. Or, using `use client` everywhere and fetching in `useEffect`, losing the benefits of server-side data fetching.

**Why it happens:** The App Router's data fetching model (Server Components fetch, Client Components consume) doesn't map cleanly to interactive charts that need client-side data manipulation.

**Consequences:**
- HTML payload bloated with serialized JSON (if passing data as props)
- Double data fetching (server-render + client hydration)
- Stale data if not properly revalidated
- Unnecessary client-side Supabase calls if server component could have fetched

**Prevention:**
1. **Server Component fetches, passes summarized/aggregated data (not raw) to client chart:**
   ```typescript
   // app/dashboard/page.tsx (Server Component)
   export default async function DashboardPage() {
     const metrics = await getAggregatedMetrics();  // Server-side Supabase call
     return <MetricsChart data={metrics} />;  // Pass aggregated, not raw
   }
   ```
2. **For real-time data (live metrics),** use client-side Supabase subscriptions in Client Components.
3. **For large datasets,** use Supabase RPC to aggregate server-side. Don't send 10,000 rows to the client for a chart that shows 50 data points.
4. **Use React Server Components for initial load, Client Components for interactivity.** Don't default everything to `"use client"`.

**Detection:** Check Next.js HTML payload size. If `__NEXT_DATA__` or RSC payload contains large data arrays, you are over-serializing.

**Confidence:** MEDIUM -- Next.js 16 App Router patterns are established but D3-specific guidance is limited.

**Phase:** Phase 1 (establish data fetching architecture). Decide per-chart whether data is server-fetched or client-fetched.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation | Severity |
|-------------|---------------|------------|----------|
| Foundation / Setup | Tailwind v4 config paradigm (Pitfall 7) | Run upgrade tool, verify all base styles | Moderate |
| Foundation / Setup | SSR hydration with D3 (Pitfall 2) | Create DynamicChart wrapper with `ssr: false` | Critical |
| Foundation / Setup | Bundle size conventions (Pitfall 4) | Establish D3 sub-module import rule | Critical |
| Foundation / Setup | Chart color system (Pitfall 6, 8) | Define CSS variable palette + useChartColors hook | Moderate |
| Foundation / Setup | Supabase connection singleton (Pitfall 10) | Verify client.ts pattern | Moderate |
| Schema Design | Over-normalization (Pitfall 11) | Design for read performance, not write correctness | Moderate |
| Topology Graph | Force simulation performance (Pitfall 3) | Canvas vs SVG decision, tick handler strategy | Critical |
| Topology Graph | Touch interaction (Pitfall 9) | touch-action CSS, larger hit targets | Moderate |
| Topology Graph | Event handler conflicts (Pitfall 12) | Clear React/D3 ownership boundary | Moderate |
| Interactive Charts | Memory leaks (Pitfall 5) | useD3 hook with standardized cleanup | Critical |
| Interactive Charts | Axis accumulation (Pitfall 13) | Call axis on same `<g>`, clear on data change | Minor |
| Interactive Charts | Tooltip stacking (Pitfall 16) | HTML tooltips portaled above SVG | Minor |
| Responsive Layout | ResizeObserver loops (Pitfall 14) | Debounced useChartDimensions hook | Minor |
| RBAC Features | False security confidence (Pitfall 15) | Explicit documentation, DEMO MODE indicator | Moderate |
| Data Integration | Over-serialization (Pitfall 17) | Server-aggregate, pass minimal props | Moderate |

---

## Recommended Preventive Infrastructure (Build in Phase 1)

These shared utilities prevent multiple pitfalls simultaneously:

| Utility | Prevents Pitfalls | Description |
|---------|-------------------|-------------|
| `DynamicChart` wrapper | 2, 4 | `next/dynamic` + `ssr: false` + loading skeleton |
| `useD3` hook | 5, 13 | Standardized ref setup, cleanup, and re-render |
| `useChartColors` hook | 6, 8 | Resolves CSS variables to concrete values for D3 transitions |
| `useChartDimensions` hook | 14 | Debounced ResizeObserver with stable dimensions |
| D3 sub-module import lint rule | 4 | ESLint rule or convention banning `import * as d3` |
| Chart color CSS variables | 6, 7 | `@theme` block with dark/light chart palette |

---

## Sources

- D3.js official React integration guide: https://d3js.org/getting-started#d3-in-react (HIGH confidence -- accessed 2026-02-19)
- Next.js 16.1.6 lazy loading documentation: https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading (HIGH confidence -- accessed 2026-02-19)
- Tailwind CSS v4 upgrade guide: https://tailwindcss.com/docs/upgrade-guide (HIGH confidence -- accessed 2026-02-19)
- D3-force simulation API: d3js.org/d3-force (MEDIUM confidence -- training data, not re-verified)
- Supabase connection patterns: supabase.com/docs (MEDIUM confidence -- training data, not re-verified)
- React 19 event system: react.dev (MEDIUM confidence -- training data, not re-verified)
