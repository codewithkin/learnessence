'use client';

import { useState } from 'react';
import LexicalEditor from '@/components/editor/LexicalEditor';
import { EditorState } from 'lexical';
import { Button } from '../ui/button';

export default function NoteEditor() {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEditorChange = (editorState: EditorState) => {
    // Extract plain text or JSON from editor state
    editorState.read(() => {
      const text = editorState.toJSON();
      setContent(JSON.stringify(text));
    });
  };

  const saveNote = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled note', content, sourceType: 'TEXT' }),
      });

      if (!res.ok) {
        throw new Error('API save failed');
      }

      try {
        localStorage.removeItem('learnessence:note-draft:local');
      } catch {}
      console.log('Note saved to server');
    } catch {
      try {
        localStorage.setItem(
          'learnessence:note-draft:local',
          JSON.stringify({ content, updatedAt: Date.now() })
        );
        console.log('Saved draft to localStorage');
      } catch (e) {
        console.error('Failed to save draft', e);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full space-y-3">
      <div className="flex items-center gap-2">
        <Button
          onClick={saveNote}
          className="px-3 py-1 bg-indigo-600 text-white rounded"
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <span className="text-sm text-muted-foreground">
          Autosave to localStorage on save-failure.
        </span>
      </div>

      <LexicalEditor onChange={handleEditorChange} />
    </div>
  );
}
