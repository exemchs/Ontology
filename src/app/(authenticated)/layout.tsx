"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
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

  // Loading state -- prevent FOUC
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Not authenticated -- render nothing while redirecting
  if (!isAuthenticated) return null;

  // Authenticated -- full app shell with sidebar layout
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <HeaderBar />
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
      <WelcomePopup />
      <CommandPalette />
    </SidebarProvider>
  );
}
