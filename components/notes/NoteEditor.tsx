'use client';

import React, { useRef } from 'react';
import InitializedMDXEditor from '@/components/config/InitializeMDXEditor';
import type { MDXEditorMethods, MDXEditorProps } from '@mdxeditor/editor';

export default function NoteEditor() {
  const editorRef = useRef<MDXEditorMethods | null>(null);

  // Minimal wrapper: render the pre-initialized MDX editor directly.
  // Provide an explicit empty `markdown` and noop `onChange` so the editor
  // doesn't operate on undefined content.
  return (
    <div className="h-full">
      <InitializedMDXEditor
        editorRef={editorRef}
        {...({ markdown: '', onChange: () => {} } as unknown as MDXEditorProps)}
      />
    </div>
  );
}
