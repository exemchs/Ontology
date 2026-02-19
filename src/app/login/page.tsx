"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  // Prevent FOUC while checking auth state
  if (isAuthenticated === null) return null;

  return (
    <div className="flex h-screen">
      {/* Left: Login Form */}
      <div className="flex w-1/2 flex-col items-center justify-center bg-background">
        <Card className="w-80 border-border/40">
          <CardContent className="space-y-6 pt-6">
            {/* eXemble Logo */}
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/logo-dark.png"
                alt="eXemble"
                className="hidden dark:block h-8 w-auto"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/logo-light.png"
                alt="eXemble"
                className="block dark:hidden h-8 w-auto"
              />
              <p className="text-sm text-muted-foreground">Ontology Platform</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full">
                로그인
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right: D3 Ontology Graph Visual */}
      <div className="relative w-1/2 bg-[hsl(var(--sidebar-background))]">
        <LoginGraph />
      </div>
    </div>
  );
}
