"use client";

import { useMemo, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { json } from "@codemirror/lang-json";
import { graphql } from "cm6-graphql";
import { autocompletion, type CompletionContext, type CompletionResult } from "@codemirror/autocomplete";
import { useTheme } from "next-themes";
import { getOntologyTypes } from "@/data/studio-data";
import type { QueryType } from "@/types";

export interface QueryEditorHandle {
  insertText: (text: string) => void;
}

interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
  mode: QueryType;
}

// Build completion entries from schema
function buildSchemaCompletions() {
  const types = getOntologyTypes();
  const completions: { label: string; type: string; detail?: string }[] = [];

  types.forEach((t) => {
    completions.push({ label: t.name, type: "type", detail: `${t.nodeCount} nodes` });
    t.predicates.forEach((p) => {
      completions.push({ label: p, type: "property", detail: `${t.name} predicate` });
    });
    t.relations.forEach((r) => {
      completions.push({ label: r.name, type: "property", detail: `${t.name} -> ${r.target}` });
    });
  });

  return completions;
}

function schemaCompletionSource(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/\w*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;

  const completions = buildSchemaCompletions();

  return {
    from: word.from,
    options: completions,
    validFor: /^\w*$/,
  };
}

export const QueryEditor = forwardRef<QueryEditorHandle, QueryEditorProps>(
  function QueryEditor({ value, onChange, mode }, ref) {
    const { resolvedTheme } = useTheme();
    const cmRef = useRef<ReactCodeMirrorRef>(null);

    const insertText = useCallback((text: string) => {
      const view = cmRef.current?.view;
      if (!view) return;
      const cursor = view.state.selection.main.head;
      view.dispatch({
        changes: { from: cursor, insert: text },
        selection: { anchor: cursor + text.length },
      });
      view.focus();
    }, []);

    useImperativeHandle(ref, () => ({ insertText }), [insertText]);

    const extensions = useMemo(() => {
      const schemaCompletion = autocompletion({
        override: [schemaCompletionSource],
      });

      return mode === "graphql"
        ? [graphql(), schemaCompletion]
        : [json(), schemaCompletion];
    }, [mode]);

    return (
      <div className="border rounded-md overflow-hidden">
        <CodeMirror
          ref={cmRef}
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
);
