'use client';

import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export function MyOnChangePlugin({ onChange }: { onChange: (serialized: string) => void }) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      try {
        const json = editorState.toJSON();
        onChange(JSON.stringify(json));
      } catch (e) {
        console.error('Failed to serialize editor state', e);
      }
    });
  }, [editor, onChange]);

  return null;
}

export function RehydrationPlugin({ initialEditorState }: { initialEditorState?: string | null }) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    if (!initialEditorState) return;

    try {
      const parsed = JSON.parse(initialEditorState);
      editor.update(() => {
        try {
          const ed = editor as unknown as {
            parseEditorState?: (p: unknown) => unknown;
            setEditorState?: (s: unknown) => void;
          };

          if (typeof ed.parseEditorState === 'function') {
            const newState = ed.parseEditorState(parsed);
            ed.setEditorState?.(newState);
          } else {
            console.warn(
              'Could not parse initial editor state — parseEditorState not available on editor.'
            );
          }
        } catch (e) {
          console.error('Failed to rehydrate editor state', e);
        }
      });
    } catch (e) {
      console.error('Invalid initial editor JSON', e);
    }
  }, [editor, initialEditorState]);

  return null;
}

export function parseSerializedEditorState(serialized?: string | null) {
  if (!serialized) return null;
  try {
    return JSON.parse(serialized);
  } catch {
    return null;
  }
}

export function makeDraftPayload(serialized: string | null, title?: string | null) {
  return { content: serialized ?? '', title: title ?? '', updatedAt: Date.now() };
}

export default null;
