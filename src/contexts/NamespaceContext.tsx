"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface Namespace {
  name: string;
  nodeCount: number;
  createdAt: string;
  status: "active" | "read-only" | "inactive";
}

interface NamespaceContextType {
  currentNamespace: string;
  setCurrentNamespace: (ns: string) => void;
  namespaces: Namespace[];
}

const NamespaceContext = createContext<NamespaceContextType | undefined>(undefined);

const STORAGE_KEY = "ontology-namespace";

export function NamespaceProvider({
  children,
  namespaces,
}: {
  children: ReactNode;
  namespaces: Namespace[];
}) {
  const [currentNamespace, setCurrentNs] = useState("default");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && namespaces.some((ns) => ns.name === stored)) {
      setCurrentNs(stored);
    }
  }, [namespaces]);

  function setCurrentNamespace(ns: string) {
    setCurrentNs(ns);
    localStorage.setItem(STORAGE_KEY, ns);
  }

  return (
    <NamespaceContext.Provider
      value={{ currentNamespace, setCurrentNamespace, namespaces }}
    >
      {children}
    </NamespaceContext.Provider>
  );
}

export function useNamespace() {
  const context = useContext(NamespaceContext);
  if (!context) {
    throw new Error("useNamespace must be used within a NamespaceProvider");
  }
  return context;
}
