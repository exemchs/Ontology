"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AUTH_KEY, WELCOME_KEY, validatePassword } from "@/lib/auth";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  // Read auth state from sessionStorage on mount (client-only)
  useEffect(() => {
    const stored = sessionStorage.getItem(AUTH_KEY);
    setIsAuthenticated(stored === "true");
  }, []);

  const login = useCallback((password: string): boolean => {
    if (validatePassword(password)) {
      sessionStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(WELCOME_KEY);
    setIsAuthenticated(false);
    router.push("/login");
  }, [router]);

  return { isAuthenticated, login, logout };
}
