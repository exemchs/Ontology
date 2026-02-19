import type { Namespace } from "@/contexts/NamespaceContext";

export function getNamespaces(): Namespace[] {
  return [
    { name: "default", nodeCount: 12450, createdAt: "2025-01-15", status: "active" },
    { name: "production", nodeCount: 45200, createdAt: "2025-03-01", status: "active" },
    { name: "staging", nodeCount: 3100, createdAt: "2025-06-12", status: "active" },
    { name: "archive", nodeCount: 89000, createdAt: "2024-11-30", status: "read-only" },
  ];
}
