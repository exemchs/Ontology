// =============================================================================
// eXemble Ontology Platform - Navigation Configuration
// =============================================================================
// SINGLE source of truth for all routes. Consumed by:
// - Sidebar navigation
// - Command palette search
// - Header breadcrumbs
// =============================================================================

import {
  LayoutDashboard,
  Cpu,
  Network,
  Workflow,
  Terminal,
  Users,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
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

// Breadcrumb mapping: route -> { group label, page title }
export const breadcrumbMap: Record<string, { group: string; page: string }> = {
  "/": { group: "Operations", page: "Overview" },
  "/monitoring/dgraph": { group: "Monitoring", page: "Graph Cluster" },
  "/monitoring/gpu": { group: "Operations", page: "GPU Monitoring" },
  "/workspace/studio": { group: "Workspace", page: "Ontology Studio" },
  "/workspace/query": { group: "Workspace", page: "Query Console" },
  "/admin/users": { group: "Administration", page: "User Management" },
};

// Flat array of all nav items (for command palette search)
export const allNavItems: NavItem[] = navigationGroups.flatMap(
  (group) => group.items
);
