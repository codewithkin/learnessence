"use client";

import React, { useEffect, useState } from "react";

interface MdxEditorWrapperProps {
  value: string;
  onChange: (v: string) => void;
}

export default function MdxEditorWrapper({ value, onChange }: MdxEditorWrapperProps) {
  const [EditorComp, setEditorComp] = useState<React.ComponentType<unknown> | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // Try known package names in order. If none installed, fall back to textarea.
      const candidates = ["@mdxeditor/react", "mdx-editor", "@mdxeditor/core"];

      for (const name of candidates) {
        try {
          const mod = await import(/* @vite-ignore */ name);

          // Try different common export shapes
          const m = mod as unknown as Record<string, unknown>;
          const candidate = m.default ?? m.Editor ?? m.MDXEditor ?? m.MdxEditor;
          const Comp = candidate as React.ComponentType<unknown> | undefined;
          if (Comp && mounted) {
            setEditorComp(() => Comp);
            break;
          }
        } catch {
          // ignore and try next
        }
      }

      if (mounted) setLoaded(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // While trying to load, show a simple loader
  if (!loaded) {
    return <div className="p-6 text-sm text-gray-500">Loading editor…</div>;
  }

  // If no editor package available, render a simple textarea fallback
  if (!EditorComp) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-96 p-4 bg-white resize-none border-0 focus:outline-none"
        placeholder="Write your note in Markdown..."
      />
    );
  }

  // If the dynamically imported editor expects different props, we attempt to pass common ones.
  const Editor = EditorComp;

  // Render the editor via createElement to avoid strict JSX prop typing against unknown component shapes.
  const props = {
    value,
    defaultValue: value,
    onChange: (v: unknown) => {
      if (typeof v === "string") {
        onChange(v);
        return;
      }

      if (v && typeof v === "object") {
        const maybeTarget = (v as { target?: { value?: unknown } }).target?.value;
        if (typeof maybeTarget === "string") {
          onChange(maybeTarget);
          return;
        }

        const maybeGetText = (v as { getText?: unknown }).getText;
        if (typeof maybeGetText === "function") {
          try {
            const fn = maybeGetText as () => unknown;
            const result = fn();
            if (typeof result === "string") {
              onChange(result);
              return;
            }
            onChange(String(result ?? ""));
            return;
          } catch {
            // fallthrough
          }
        }
      }

      onChange(String(v ?? ""));
    },
    className: "w-full",
  } as unknown as Record<string, unknown>;

  return React.createElement(Editor, props);
}
