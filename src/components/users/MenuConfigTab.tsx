"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Cpu,
  Network,
  Workflow,
  Terminal,
  Upload,
  Users,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultEnabled: boolean;
}

// ── Mock Data ────────────────────────────────────────────────────────────

const MENU_ITEMS: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, defaultEnabled: true },
  { id: "gpu-monitoring", label: "GPU Monitoring", icon: Cpu, defaultEnabled: true },
  { id: "graph-cluster", label: "Graph Cluster", icon: Network, defaultEnabled: true },
  { id: "ontology-studio", label: "Ontology Studio", icon: Workflow, defaultEnabled: true },
  { id: "query-console", label: "Query Console", icon: Terminal, defaultEnabled: true },
  { id: "data-import", label: "Data Import", icon: Upload, defaultEnabled: true },
  { id: "user-management", label: "User Management", icon: Users, defaultEnabled: true },
];

const LANDING_PAGE_OPTIONS = [
  { value: "dashboard", label: "Dashboard" },
  { value: "gpu-monitoring", label: "GPU Monitoring" },
  { value: "graph-cluster", label: "Graph Cluster" },
  { value: "ontology-studio", label: "Ontology Studio" },
  { value: "query-console", label: "Query Console" },
];

// ── Component ────────────────────────────────────────────────────────────

export function MenuConfigTab() {
  const [enabledItems, setEnabledItems] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MENU_ITEMS.map((item) => [item.id, item.defaultEnabled]))
  );
  const [landingPage, setLandingPage] = useState("dashboard");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  function toggleItem(id: string) {
    setEnabledItems((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleSave() {
    toast.success("Configuration saved (mock)");
  }

  return (
    <div className="space-y-6">
      {/* ── Menu Visibility ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Menu Configuration</CardTitle>
          <CardDescription>Toggle visibility of navigation menu items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <Switch
                    checked={enabledItems[item.id] ?? true}
                    onCheckedChange={() => toggleItem(item.id)}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── System Settings ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">System Settings</CardTitle>
          <CardDescription>Configure default navigation behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {/* Default Landing Page */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Default Landing Page</p>
                <p className="text-xs text-muted-foreground">Page shown after login</p>
              </div>
              <Select value={landingPage} onValueChange={setLandingPage}>
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANDING_PAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sidebar Default State */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sidebar Default State</p>
                <p className="text-xs text-muted-foreground">
                  {sidebarExpanded ? "Expanded" : "Collapsed"}
                </p>
              </div>
              <Switch
                checked={sidebarExpanded}
                onCheckedChange={setSidebarExpanded}
              />
            </div>

            {/* Show Welcome Popup */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show Welcome Popup</p>
                <p className="text-xs text-muted-foreground">
                  Display onboarding popup on first visit
                </p>
              </div>
              <Switch
                checked={showWelcome}
                onCheckedChange={setShowWelcome}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Save Button ─────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button size="sm" onClick={handleSave}>
          <Save className="size-3.5 mr-1.5" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
