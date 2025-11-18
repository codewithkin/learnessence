'use client';
// InitializedMDXEditor.tsx
import type { ForwardedRef } from 'react';
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
} from '@mdxeditor/editor';

// Only import this to the next file
export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  // Provide a safe default markdown value and a basic onChange passthrough.
  // Keep this editor intentionally minimal — add plugins here as needed.
  const markdown = (props as Partial<MDXEditorProps>).markdown ?? '';

  const handleChange = (value: unknown) => {
    // Prefer consumer-provided onChange, otherwise log to console for debug.
    const onChange = (props as Partial<MDXEditorProps>).onChange as
      | ((v: unknown) => void)
      | undefined;
    if (typeof onChange === 'function') {
      try {
        onChange(value);
      } catch (e) {
        console.error('InitializedMDXEditor onChange handler error', e);
      }
      return;
    }
    console.log('MDXEditor change:', value);
  };

  const safeProps: MDXEditorProps = {
    // spread consumer props first, then override with safe defaults
    ...(props as MDXEditorProps),
    markdown,
    onChange: handleChange,
  };

  return (
    <MDXEditor
      // Basic, commonly useful plugins — extend when needed.
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
      ]}
      {...safeProps}
      ref={editorRef}
    />
  );
}
