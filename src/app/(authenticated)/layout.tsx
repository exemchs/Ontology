"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

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

  // Authenticated -- render children directly (Plan 02 will add Sidebar + Header)
  return <main className="flex h-screen flex-col">{children}</main>;
}
