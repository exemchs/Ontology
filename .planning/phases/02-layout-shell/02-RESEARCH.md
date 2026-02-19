# Phase 2: Layout Shell - Research

**Researched:** 2026-02-19
**Domain:** Next.js App Router layout, routing, client-side auth gate, shadcn/ui sidebar + command palette
**Confidence:** HIGH

## Summary

Phase 2 builds the complete application shell: a password gate that blocks unauthenticated access, a collapsible sidebar with 4-group navigation across 6 pages, a header bar with breadcrumbs, a welcome popup, and a command palette. All components already have their corresponding shadcn/ui primitives installed from Phase 1 (sidebar, command, dialog, breadcrumb, switch, collapsible, etc.). The routing uses Next.js 16 App Router's file-system conventions with route groups.

The Password Gate is purely client-side (sessionStorage) since this is a POC. No server-side token validation is needed. The CONTEXT.md specifies a split-screen login with D3 ontology graph on the right, matching the eXemble login page aesthetic. The sidebar uses shadcn/ui's Sidebar component (already installed with full provider, context, trigger, collapsible modes). The Command Palette uses the installed cmdk-based Command component with Dialog wrapper.

**Primary recommendation:** Build components in dependency order -- (1) routing skeleton with 6 page stubs, (2) password gate with D3 decorative graph, (3) sidebar + header as authenticated layout, (4) welcome popup + command palette as overlays. Use `sessionStorage` for both auth state and welcome-dismissed state per the user decisions.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Password Gate: eXemble login page reference, left/right split layout (form left + visual right)
- Right visual: D3 ontology graph preview reflecting POC product identity
- POC: password-only input (no username/SSO)
- Left side: eXemble logo + password input + login button only, minimal with no extra text
- Error feedback: red inline text below input "비밀번호가 일치하지 않습니다"
- Session: sessionStorage-based, persists until browser close
- Sidebar default state: expanded (icon + text visible)
- Sidebar collapse: button to collapse to icon-only mode
- Sidebar footer: dark/light theme toggle + logout button
- Sidebar current page: basic highlight (user will provide design reference later, use default for now)
- Responsive: desktop-first, basic responsive foundation only (mobile full support is future work)
- Welcome Popup: simple greeting "환영합니다" + eXemble Ontology Platform / SK Siltron FAB POC Demo + "시작하기" button
- Welcome dismissal: session-based (reappears on logout or browser close)
- Command Palette: Cmd+K (Mac) / Ctrl+K (Windows) trigger
- Command Palette: center-top dialog popup + background dimming
- Command Palette: text input to search/navigate 6 pages

### Claude's Discretion
- Command Palette additional actions (theme toggle, etc. beyond page navigation)
- Sidebar current page highlight default style
- Password Gate right-side D3 ontology graph visualization style
- Header area composition (page title, breadcrumb, etc.)
- Command Palette keyboard navigation, fuzzy search, interaction details

### Deferred Ideas (OUT OF SCOPE)
- Sidebar current page design: user has separate reference, will share at design stage
- Mobile/tablet full responsive: foundation only, detailed work is separate
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | Password Gate (session-based, configurable password) | sessionStorage pattern, split-screen layout, D3 decorative graph, inline error feedback |
| AUTH-02 | AppSidebar (4-group navigation: Operations/Monitoring/Workspace/Administration) | shadcn/ui Sidebar component with SidebarProvider, icon collapsible mode, SidebarGroup structure |
| AUTH-03 | HeaderBar (breadcrumb, search, theme toggle, role indicator) | shadcn/ui Breadcrumb component, SidebarTrigger, useTheme hook, route-to-breadcrumb mapping |
| AUTH-04 | Welcome Popup (first-visit Korean greeting, localStorage-based) | Note: CONTEXT.md says sessionStorage, overriding REQUIREMENTS.md localStorage. Dialog component pattern |
| AUTH-05 | Command Palette (Cmd+K search/navigation) | cmdk 1.1.1 CommandDialog, built-in fuzzy filtering, keyboard navigation |
| AUTH-06 | Routing 6 pages (/, /monitoring/dgraph, /monitoring/gpu, /workspace/studio, /workspace/query, /admin/users) | Next.js 16 App Router route groups, nested layouts, page stubs |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router framework, file-system routing | Already in project |
| React | 19.2.3 | UI framework | Already in project |
| shadcn/ui | 3.8.5 | Sidebar, Command, Dialog, Breadcrumb, Switch components | Already installed, 21 components available |
| cmdk | 1.1.1 | Command palette search/filtering engine | Already installed via shadcn command component |
| next-themes | 0.4.6 | Theme toggle (dark/light) | Already installed, ThemeProvider in layout.tsx |
| lucide-react | 0.574.0 | Icons for sidebar navigation items | Already installed |
| D3.js | 7.9.0 | Decorative ontology graph on login page | Already installed |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| radix-ui | 1.4.3 | Underlying primitives for Dialog, Switch, Slot | Used by shadcn/ui components internally |
| class-variance-authority | 0.7.1 | Variant-based className composition | Sidebar button variants |
| tailwind-merge | 3.5.0 | Merge Tailwind classes safely | cn() utility in @/lib/utils |

### No Additional Installs Needed
All dependencies for Phase 2 are already available. No new packages required.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── globals.css              # (existing) CSS tokens + shadcn bridge
│   ├── layout.tsx               # (modify) Root layout - add auth context
│   ├── login/
│   │   └── page.tsx             # Password Gate page
│   ├── (authenticated)/
│   │   ├── layout.tsx           # Sidebar + Header layout wrapper
│   │   ├── page.tsx             # / -> Ontology Dashboard (stub)
│   │   ├── monitoring/
│   │   │   ├── dgraph/
│   │   │   │   └── page.tsx     # /monitoring/dgraph (stub)
│   │   │   └── gpu/
│   │   │       └── page.tsx     # /monitoring/gpu (stub)
│   │   ├── workspace/
│   │   │   ├── studio/
│   │   │   │   └── page.tsx     # /workspace/studio (stub)
│   │   │   └── query/
│   │   │       └── page.tsx     # /workspace/query (stub)
│   │   └── admin/
│   │       └── users/
│   │           └── page.tsx     # /admin/users (stub)
│   └── not-found.tsx            # Optional 404
├── components/
│   ├── layout/
│   │   ├── app-sidebar.tsx      # Sidebar navigation with 4 groups
│   │   ├── header-bar.tsx       # Breadcrumb + sidebar trigger + theme toggle
│   │   ├── command-palette.tsx  # Cmd+K search dialog
│   │   ├── welcome-popup.tsx    # First-visit greeting dialog
│   │   └── login-graph.tsx      # D3 decorative ontology graph for login page
│   ├── charts/                  # (existing)
│   ├── ui/                      # (existing) shadcn components
│   └── theme-provider.tsx       # (existing)
├── hooks/
│   ├── use-mobile.ts            # (existing)
│   └── use-auth.ts              # Auth state management hook
├── lib/
│   ├── utils.ts                 # (existing)
│   ├── pii-masking.ts           # (existing)
│   ├── auth.ts                  # Password validation logic + constants
│   └── navigation.ts            # Route definitions, sidebar config, breadcrumb mapping
└── types/
    └── index.ts                 # (existing, may add nav types)
```

### Pattern 1: Route Group for Authenticated Layout
**What:** Use `(authenticated)` route group to wrap all pages that share the sidebar+header layout. The login page lives outside this group.
**When to use:** When a subset of routes share a common layout (sidebar) while others (login) do not.
**Example:**
```
app/
  layout.tsx                    # Root: ThemeProvider, font, html
  login/page.tsx                # No sidebar, full-screen login
  (authenticated)/
    layout.tsx                  # SidebarProvider + Sidebar + Header + main
    page.tsx                    # / dashboard
    monitoring/dgraph/page.tsx  # /monitoring/dgraph
```

The `(authenticated)` folder name is stripped from URLs. Pages inside get the sidebar layout automatically. The login page exists outside and gets only the root layout.

### Pattern 2: Client-Side Auth Gate with sessionStorage
**What:** A client-side auth check that redirects unauthenticated users to /login. Uses sessionStorage for POC simplicity.
**When to use:** POC/demo apps where server-side auth is overkill.
**Example:**
```typescript
// src/hooks/use-auth.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const AUTH_KEY = "exemble-auth";
const CORRECT_PASSWORD = "exem123"; // Could also use env var

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem(AUTH_KEY);
    setIsAuthenticated(stored === "true");
  }, []);

  const login = useCallback((password: string): boolean => {
    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem("exemble-welcome-dismissed");
    setIsAuthenticated(false);
    router.push("/login");
  }, [router]);

  return { isAuthenticated, login, logout };
}
```

### Pattern 3: Sidebar Navigation Configuration as Data
**What:** Define all navigation items, routes, icons, and groups in a single configuration object. Both the sidebar and command palette consume this same data.
**When to use:** When multiple components need the same route information (sidebar, command palette, breadcrumbs).
**Example:**
```typescript
// src/lib/navigation.ts
import {
  LayoutDashboard, Cpu, Network, Workflow,
  Terminal, Users
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigationGroups: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { title: "Overview", url: "/", icon: LayoutDashboard },
      { title: "GPU Monitoring", url: "/monitoring/gpu", icon: Cpu },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { title: "Graph Cluster", url: "/monitoring/dgraph", icon: Network },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Ontology Studio", url: "/workspace/studio", icon: Workflow },
      { title: "Query Console", url: "/workspace/query", icon: Terminal },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "User Management", url: "/admin/users", icon: Users },
    ],
  },
];

// Breadcrumb mapping derived from the same data
export const breadcrumbMap: Record<string, { group: string; page: string }> = {
  "/": { group: "Operations", page: "Overview" },
  "/monitoring/dgraph": { group: "Monitoring", page: "Graph Cluster" },
  "/monitoring/gpu": { group: "Operations", page: "GPU Monitoring" },
  "/workspace/studio": { group: "Workspace", page: "Ontology Studio" },
  "/workspace/query": { group: "Workspace", page: "Query Console" },
  "/admin/users": { group: "Administration", page: "User Management" },
};
```

### Pattern 4: shadcn/ui Sidebar with Icon Collapsible Mode
**What:** Use the installed Sidebar component with `collapsible="icon"` to enable the expand/collapse behavior the user requested.
**When to use:** The sidebar must toggle between full-width (icon + text) and icon-only modes.
**Example:**
```tsx
<SidebarProvider defaultOpen={true}>
  <Sidebar collapsible="icon" className="border-r">
    <SidebarHeader>
      {/* eXemble logo, collapses to icon */}
    </SidebarHeader>
    <SidebarContent>
      {navigationGroups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </SidebarContent>
    <SidebarFooter>
      {/* Theme toggle + Logout */}
    </SidebarFooter>
  </Sidebar>
  <SidebarInset>
    <HeaderBar />
    <main className="flex-1 overflow-auto p-6">
      {children}
    </main>
  </SidebarInset>
</SidebarProvider>
```

**Key behavior notes (from source code analysis):**
- `collapsible="icon"` mode: when collapsed, sidebar width shrinks to `--sidebar-width-icon` (3rem) and shows only icons
- `SidebarMenuButton` with `tooltip` prop: tooltip appears on right side when collapsed, hidden when expanded
- `SidebarGroupLabel` auto-hides with opacity-0 + negative margin when collapsed
- `SidebarMenuSub` and `SidebarGroupContent` text auto-hides when collapsed
- `data-[active=true]` sets `bg-sidebar-accent` + `font-medium` + `text-sidebar-accent-foreground` for active items
- Keyboard shortcut Cmd+B toggles sidebar (built into SidebarProvider)
- Cookie persistence: sidebar state is saved to `sidebar_state` cookie automatically

### Pattern 5: Command Palette with cmdk + shadcn CommandDialog
**What:** Use the installed CommandDialog (wraps cmdk + Dialog) for the Cmd+K command palette.
**When to use:** Global keyboard shortcut to search and navigate pages.
**Example:**
```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog, CommandInput, CommandList,
  CommandEmpty, CommandGroup, CommandItem
} from "@/components/ui/command";
import { navigationGroups } from "@/lib/navigation";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="페이지 검색..." />
      <CommandList>
        <CommandEmpty>결과가 없습니다.</CommandEmpty>
        {navigationGroups.map((group) => (
          <CommandGroup key={group.label} heading={group.label}>
            {group.items.map((item) => (
              <CommandItem
                key={item.url}
                onSelect={() => runCommand(() => router.push(item.url))}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
```

**cmdk filtering notes:**
- Built-in fuzzy search via `command-score` library
- Items are automatically filtered as user types
- `CommandEmpty` shown when no items match
- Keyboard navigation (up/down arrows, Enter to select) is built-in
- No additional fuzzy search library needed

### Pattern 6: D3 Decorative Ontology Graph for Login Page
**What:** A non-interactive, animated force-directed graph showing the 6 ontology types and their relationships as a visual decoration on the login page right panel.
**When to use:** Password Gate right-side visual per user decision.
**Recommended approach:**
```typescript
// Use d3-force simulation with the 6 ontology types as nodes
// and their relations as links. Keep it decorative:
// - No interaction (no drag, no zoom)
// - Gentle continuous animation (low alpha target so it gently drifts)
// - Cyan/blue gradient colors matching eXemble brand
// - Semi-transparent nodes and links for background aesthetic
// - Use existing ontology type names from studio-data.ts

const nodes = [
  { id: "Equipment" }, { id: "Process" }, { id: "Wafer" },
  { id: "Recipe" }, { id: "Defect" }, { id: "MaintenanceRecord" }
];

const links = [
  { source: "Equipment", target: "Process" },
  { source: "Process", target: "Wafer" },
  { source: "Process", target: "Recipe" },
  { source: "Wafer", target: "Defect" },
  { source: "Equipment", target: "MaintenanceRecord" },
  // ... match actual relations from studio-data.ts
];
```

**Style recommendation (Claude's discretion):**
- Dark background (matching overall dark theme default)
- Nodes: circles with cyan/blue gradient glow, opacity 0.6-0.8
- Links: thin lines with blue-04/blue-05 color, opacity 0.3-0.5
- Labels: ontology type names in small text, white with low opacity
- Gentle float animation via low `alphaTarget(0.02)` on simulation
- SVG fills entire right panel, responsive to container size

### Anti-Patterns to Avoid
- **Server-side auth for POC:** Do NOT implement server-side token validation, API routes for auth, or cookie-based sessions. The user explicitly chose sessionStorage for simplicity.
- **Multiple root layouts:** Do NOT create separate root layouts for login vs authenticated. Use a single root layout with a route group.
- **Hardcoded breadcrumbs per page:** Do NOT put breadcrumb logic in each page component. Centralize in header-bar using pathname.
- **Separate route configs:** Do NOT define navigation items in sidebar, then again in command palette, then again in breadcrumbs. Single source of truth in navigation.ts.
- **Interactive D3 graph on login:** The login graph is decorative. Do NOT add drag, zoom, click handlers, or tooltips. Keep it lightweight.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sidebar expand/collapse | Custom slide animation + state | shadcn/ui Sidebar with `collapsible="icon"` | Built-in transitions, cookie persistence, mobile sheet, keyboard shortcut |
| Command palette search | Custom fuzzy search + keyboard nav | cmdk (via shadcn Command component) | Battle-tested fuzzy scoring, accessible keyboard nav, performant filtering |
| Theme toggle | Custom dark/light switching | next-themes `useTheme()` hook | Already configured ThemeProvider, handles SSR hydration, class-based switching |
| Dialog overlay/dimming | Custom modal with backdrop | shadcn Dialog (used by CommandDialog) | Proper focus trap, escape handling, portal rendering, animations |
| Breadcrumb rendering | Custom breadcrumb component | shadcn/ui Breadcrumb | Accessible markup, separator handling, proper ARIA roles |
| Mobile sidebar | Custom drawer/slide-in | Sidebar component (auto-uses Sheet on mobile) | Built-in mobile detection via useIsMobile(), Sheet overlay on small screens |

**Key insight:** The shadcn/ui Sidebar component is remarkably comprehensive. It handles desktop/mobile detection, collapsible modes (offcanvas/icon/none), cookie state persistence, keyboard shortcut (Cmd+B), tooltip display in collapsed state, and Sheet overlay on mobile. Reimplementing any of this would be wasteful.

## Common Pitfalls

### Pitfall 1: sessionStorage Not Available During SSR
**What goes wrong:** Reading `sessionStorage` in a component that renders on the server causes a ReferenceError.
**Why it happens:** Next.js App Router renders Server Components by default. Even Client Components may attempt to read during initial render before hydration.
**How to avoid:** Always guard sessionStorage access inside `useEffect`. Use a loading/null state until the client-side check completes. Return `null` from the auth state initially, then set it in useEffect.
**Warning signs:** "sessionStorage is not defined" errors, hydration mismatches.

### Pitfall 2: Flash of Unauthenticated Content (FOUC)
**What goes wrong:** Authenticated layout briefly renders before the auth check redirects to login.
**Why it happens:** The route group layout renders immediately, then the client-side auth check happens asynchronously.
**How to avoid:** In the `(authenticated)/layout.tsx`, render a loading skeleton or nothing until auth state is determined. Only render the full sidebar+content when `isAuthenticated === true`. If `false`, redirect to `/login`.
**Warning signs:** Brief flash of sidebar/header before redirecting to login page.

### Pitfall 3: middleware.ts Deprecation Warning in Next.js 16
**What goes wrong:** Console shows deprecation warnings about middleware.ts being renamed to proxy.ts.
**Why it happens:** Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`. The current project has middleware.ts for Supabase session refresh.
**How to avoid:** The existing middleware.ts still works in Next.js 16 (deprecated but functional). For this phase, leave it as-is since it handles Supabase session refresh. Migration to proxy.ts can be done separately if needed. The password gate is client-side and independent of the middleware.
**Warning signs:** Terminal deprecation warnings during `next dev`.

### Pitfall 4: Route Group Naming Conflicts
**What goes wrong:** Routes inside different route groups resolve to the same URL path, causing build errors.
**Why it happens:** Route groups strip folder names from URLs, so `(auth)/login` and `(marketing)/login` would both be `/login`.
**How to avoid:** Only one route group should contain routes for a given URL path. The login page should be outside any route group (at `app/login/page.tsx`), not inside a separate group.
**Warning signs:** Build errors about conflicting routes.

### Pitfall 5: Sidebar Keyboard Shortcut Conflict
**What goes wrong:** Cmd+B (sidebar toggle) conflicts with browser bold shortcut in text editors, and Cmd+K (command palette) may conflict with other shortcuts.
**Why it happens:** SidebarProvider automatically registers Cmd+B. Both shortcuts use `metaKey || ctrlKey` detection.
**How to avoid:** Be aware that SidebarProvider adds the Cmd+B listener automatically. For Cmd+K, register it separately. Ensure the command palette listener runs `e.preventDefault()` to prevent browser search bar.
**Warning signs:** Unexpected sidebar toggling while editing text, browser search bar appearing alongside command palette.

### Pitfall 6: Welcome Popup vs Auth Session Timing
**What goes wrong:** Welcome popup appears before auth is confirmed, or doesn't reset on logout.
**Why it happens:** Both use sessionStorage. If the welcome-dismissed flag isn't cleared on logout, the popup won't show on re-login.
**How to avoid:** Clear the welcome-dismissed sessionStorage key in the logout function alongside the auth key. Check: only show welcome popup when `isAuthenticated === true` AND `sessionStorage.getItem("exemble-welcome-dismissed") !== "true"`.
**Warning signs:** Welcome popup not showing after re-login, or showing briefly during auth loading.

### Pitfall 7: D3 Cleanup on Login Page Unmount
**What goes wrong:** D3 force simulation keeps running after navigating away from login, causing memory leaks.
**Why it happens:** Force simulation uses `requestAnimationFrame` internally and doesn't stop when the React component unmounts.
**How to avoid:** Call `simulation.stop()` in the useEffect cleanup function. Use the existing `destroyedRef` pattern from Phase 1's chart utilities if applicable.
**Warning signs:** Browser tab memory increasing over time, simulation ticks appearing in profiler after navigation.

## Code Examples

### Auth Guard in Authenticated Layout
```typescript
// src/app/(authenticated)/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { HeaderBar } from "@/components/layout/header-bar";
import { WelcomePopup } from "@/components/layout/welcome-popup";
import { CommandPalette } from "@/components/layout/command-palette";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <HeaderBar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </SidebarInset>
      <WelcomePopup />
      <CommandPalette />
    </SidebarProvider>
  );
}
```

### Login Page Split Layout
```tsx
// src/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginGraph } from "@/components/layout/login-graph";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { isAuthenticated, login } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated === true) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = login(password);
    if (success) {
      router.push("/");
    } else {
      setError("비밀번호가 일치하지 않습니다");
    }
  };

  if (isAuthenticated === null) return null; // Loading

  return (
    <div className="flex h-screen">
      {/* Left: Login Form */}
      <div className="flex w-1/2 flex-col items-center justify-center bg-background">
        {/* eXemble Logo */}
        <div className="mb-8">{/* Logo component */}</div>
        <form onSubmit={handleSubmit} className="w-80 space-y-4">
          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="password-input"
          />
          {error && (
            <p className="text-sm text-destructive" data-testid="login-error">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" data-testid="login-button">
            로그인
          </Button>
        </form>
      </div>
      {/* Right: D3 Ontology Graph Visual */}
      <div className="relative w-1/2 bg-gray-09">
        <LoginGraph />
      </div>
    </div>
  );
}
```

### Theme Toggle in Sidebar Footer
```tsx
// Inside AppSidebar footer
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut } from "lucide-react";
import { Switch } from "@/components/ui/switch";

function SidebarThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4" />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
      <Moon className="h-4 w-4" />
    </div>
  );
}
```

### Header Bar with Dynamic Breadcrumb
```tsx
"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { breadcrumbMap } from "@/lib/navigation";

export function HeaderBar() {
  const pathname = usePathname();
  const crumb = breadcrumbMap[pathname];

  return (
    <header className="flex h-14 items-center gap-4 border-b px-4">
      <SidebarTrigger />
      {crumb && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{crumb.group}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{crumb.page}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}
    </header>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| middleware.ts | proxy.ts | Next.js 16 (2026) | Deprecated but still functional. Leave as-is for now. |
| Synchronous request APIs | Async-only (cookies, headers, params) | Next.js 16 (2026) | params in layouts/pages must be awaited. Page stubs need `async` if accessing params. |
| next lint | ESLint CLI directly | Next.js 16 (2026) | Build no longer runs linting. Use `npm run lint` separately. |
| experimental.turbopack | Default turbopack | Next.js 16 (2026) | Turbopack is now default for dev and build. No flags needed. |

**Important for this phase:**
- `params` in `page.tsx` and `layout.tsx` are now Promises in Next.js 16. If any page component needs route params (e.g., dynamic segments), they must be awaited.
- The current route structure has no dynamic segments, so this is mostly informational. But the page stubs should follow the async pattern if they'll need params later.
- `middleware.ts` still works (with deprecation warning). Since it only handles Supabase session refresh and our password gate is client-side, there's no conflict.

## Discretion Recommendations

### 1. Command Palette Additional Actions
**Recommendation:** Include theme toggle as an additional action in the command palette. It's a small addition with high discoverability value. Group structure:
- "Pages" group: 6 navigation items
- "Actions" group: "Toggle Theme" (with Moon/Sun icon)
**Rationale:** This follows the pattern of tools like Linear, Raycast, and VS Code. Theme switching is a natural command palette action.

### 2. Sidebar Active Page Highlight Style
**Recommendation:** Use the built-in `data-[active=true]` styling from the SidebarMenuButton component, which applies `bg-sidebar-accent` + `font-medium` + `text-sidebar-accent-foreground`. This is the shadcn/ui default and looks clean. Add a subtle left border accent:
```css
[data-active="true"] { border-left: 2px solid var(--sidebar-primary); }
```
**Rationale:** Simple, recognizable, easy to adjust later when the user provides design reference. The built-in data-active styling already handles background color changes.

### 3. Password Gate D3 Graph Style
**Recommendation:** Floating nodes with subtle glow effect:
- 6 ontology type nodes as circles (radius 20-30px based on relative node count)
- Connecting lines for actual relations (from studio-data.ts)
- Color scheme: nodes use `--color-blue-04` to `--color-cyan-04` gradient, links use `--color-gray-06` with 0.3 opacity
- Node labels in white with 0.7 opacity, small font
- Gentle continuous animation: `alphaTarget(0.02)` to keep nodes gently drifting
- No interaction handlers (purely decorative)
- SVG background: transparent (relies on parent dark background)
**Rationale:** Showcases the product's core concept (ontology visualization) while maintaining the eXemble aesthetic of dark background with cyan/blue accents.

### 4. Header Area Composition
**Recommendation:** Minimal header with:
- Left: SidebarTrigger button + Breadcrumb (group > page name)
- Right: Cmd+K search hint button (opens command palette) + theme indicator
- Height: h-14 (standard for shadcn patterns)
- Bottom border for visual separation
**Rationale:** Matches PRD specification (breadcrumbs, search, theme toggle). The Cmd+K button in the header provides discoverability for the command palette.

### 5. Command Palette Interaction Details
**Recommendation:**
- Fuzzy search: use cmdk's built-in `command-score` filtering (no custom filter needed)
- Keyboard: arrow up/down to navigate, Enter to select (built-in)
- Items show: icon + title + optional keyboard shortcut badge
- Empty state: "결과가 없습니다." in Korean
- Dialog position: default shadcn CommandDialog positioning (centered with top bias)
- Close on selection: close dialog and navigate simultaneously
- Close on Escape: built-in behavior
**Rationale:** cmdk handles all the complex keyboard navigation and filtering. No customization needed beyond styling and content.

## Open Questions

1. **eXemble Logo Asset**
   - What we know: The login page needs an eXemble logo. PRD mentions "white for dark mode, black for light mode."
   - What's unclear: No SVG/PNG logo file exists in the project. The `public/` directory doesn't even exist yet.
   - Recommendation: Create a simple text-based "eXemble" logo using CSS (styled span/SVG text) for now. Replace with actual brand asset when available. Or use inline SVG.

2. **Password Value Configuration**
   - What we know: PRD says `SITE_PASSWORD` env var with default `exem123`. CONTEXT.md says "configurable password."
   - What's unclear: Since this is client-side sessionStorage (no server validation), the password must be bundled in client code. Using `NEXT_PUBLIC_` env var would expose it in source but that's acceptable for a POC.
   - Recommendation: Use `NEXT_PUBLIC_SITE_PASSWORD` env var with fallback to `"exem123"`. Add to `.env.local`. This is a POC demo password, not a security concern.

3. **middleware.ts / Supabase Session**
   - What we know: middleware.ts exists for Supabase session refresh. Next.js 16 deprecated it in favor of proxy.ts.
   - What's unclear: Whether the Supabase middleware actually impacts anything since the password gate is client-side.
   - Recommendation: Leave middleware.ts as-is for this phase. The Supabase middleware doesn't interfere with the client-side password gate. Migration to proxy.ts can be a separate cleanup task.

## Sources

### Primary (HIGH confidence)
- shadcn/ui Sidebar component: Source code analysis at `/src/components/ui/sidebar.tsx` -- full API, collapsible modes, cookie persistence, mobile Sheet
- shadcn/ui Command component: Source code analysis at `/src/components/ui/command.tsx` -- cmdk integration, CommandDialog, filtering
- shadcn/ui Dialog component: Source code analysis at `/src/components/ui/dialog.tsx` -- overlay, portal, close button
- shadcn/ui Breadcrumb component: Source code analysis at `/src/components/ui/breadcrumb.tsx` -- accessible nav markup
- Next.js 16 upgrade guide: https://nextjs.org/docs/app/guides/upgrading/version-16 -- middleware deprecation, async params, turbopack default
- Next.js route groups: https://nextjs.org/docs/app/api-reference/file-conventions/route-groups -- (folderName) convention, layout scoping
- PRD v1.3: `/Users/chs/Downloads/exemble-ontology-docs-v1.3/01_PRD.md` -- app structure, routing table, password gate spec
- Implementation Guide v1.1: `/Users/chs/Downloads/exemble-ontology-docs-v1.3/04_Implementation-Guide.md` -- sidebar navigation spec, component list

### Secondary (MEDIUM confidence)
- cmdk GitHub: https://github.com/pacocoursey/cmdk -- fuzzy search via command-score, keyboard navigation built-in
- Next.js middleware to proxy migration: https://nextjs.org/docs/messages/middleware-to-proxy -- deprecated but functional

### Tertiary (LOW confidence)
- D3 force layout decorative pattern: General knowledge from d3-force documentation, specific styling recommendations are Claude's discretion

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed, versions verified in package.json
- Architecture: HIGH -- Next.js App Router route groups and layouts are well-documented, shadcn/ui Sidebar API confirmed via source code
- Pitfalls: HIGH -- SSR/sessionStorage issues, middleware deprecation, and D3 cleanup are well-known patterns
- D3 login graph style: MEDIUM -- decorative visualization is Claude's discretion, but D3 force simulation patterns are well-established

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (stable stack, no fast-moving dependencies)
