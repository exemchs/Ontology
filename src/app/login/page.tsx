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

  // Prevent FOUC while checking auth state
  if (isAuthenticated === null) return null;

  return (
    <div className="flex h-screen">
      {/* Left: Login Form */}
      <div className="flex w-1/2 flex-col items-center justify-center bg-background">
        <div className="w-80 space-y-6">
          {/* eXemble Logo */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              eXemble
            </h1>
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
        </div>
      </div>

      {/* Right: D3 Ontology Graph Visual */}
      <div className="relative w-1/2 bg-[var(--color-gray-09)]">
        <LoginGraph />
      </div>
    </div>
  );
}
