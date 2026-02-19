"use client";

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { json } from "@codemirror/lang-json";
import { graphql } from "cm6-graphql";
import { useTheme } from "next-themes";
import type { QueryType } from "@/types";

interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
  mode: QueryType;
}

export function QueryEditor({ value, onChange, mode }: QueryEditorProps) {
  const { resolvedTheme } = useTheme();

  const extensions = useMemo(() => {
    return mode === "graphql" ? [graphql()] : [json()];
  }, [mode]);

  return (
    <div className="border rounded-md overflow-hidden">
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={extensions}
        theme={resolvedTheme === "dark" ? oneDark : "light"}
        height="280px"
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          bracketMatching: true,
          autocompletion: false,
        }}
      />
    </div>
  );
}
