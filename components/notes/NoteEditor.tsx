'use client';

import { useState, useEffect, useRef } from 'react';
import LexicalEditor from '@/components/editor/LexicalEditor';
import { makeDraftPayload } from '@/components/editor/useLexicalSerialization';
import {
  LOCAL_DRAFT_KEY,
  AUTOSAVE_LOCAL_MS,
  AUTOSAVE_SERVER_MS,
} from '@/components/editor/editorConfig';
import { Button } from '../ui/button';
import api from '@/lib/axiosClient';

export default function NoteEditor({ noteId }: { noteId?: string }) {
  const [content, setContent] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.content) return parsed.content;
      }
    } catch {
      // ignore
    }
    return '';
  });

  const [title, setTitle] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.title === 'string') return parsed.title;
      }
    } catch {
      // ignore
    }
    return '';
  });

  // track current note id (start from prop). When first saved, POST will return id and we set this.
  const [currentNoteId, setCurrentNoteId] = useState<string | undefined>(noteId);
  // last payload we successfully saved to server (to avoid redundant saves)
  const lastServerSavedPayloadRef = useRef<string | null>(null);

  const handleEditorChange = (serializedEditorState: string) => {
    // The editor plugin forwards a serialized JSON string.
    setContent(serializedEditorState || '');
  };

  // If editing an existing note, attempt to rehydrate from server
  useEffect(() => {
    if (!noteId) return;

    let cancelled = false;
    (async () => {
      try {
        const { data: note } = await api.get(`/api/notes/${encodeURIComponent(noteId)}`);
        if (cancelled) return;
        if (note) {
          if (note.content) setContent(note.content);
          if (typeof note.title === 'string') setTitle(note.title);
          try {
            localStorage.removeItem(LOCAL_DRAFT_KEY);
          } catch {}
        }
      } catch (e) {
        console.error('Error fetching note for rehydration', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [noteId]);

  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<number | null>(null);
  const serverSaveTimer = useRef<number | null>(null);

  // Autosave to localStorage (debounced)
  useEffect(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    // debounce local autosave
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore setTimeout types differ in Node/Browser types in some configs
    saveTimer.current = window.setTimeout(() => {
      try {
        const payload = makeDraftPayload(content, title);
        localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(payload));
      } catch (e) {
        console.error('Failed to autosave draft', e);
      }
    }, AUTOSAVE_LOCAL_MS);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [content, title]);

  // Autosave to server (debounced). When content changes, schedule a server save after 5s.
  useEffect(() => {
    if (serverSaveTimer.current) {
      clearTimeout(serverSaveTimer.current);
    }

    // do not schedule if content is empty
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore setTimeout types differ in Node/Browser types in some configs
    serverSaveTimer.current = window.setTimeout(async () => {
      try {
        // avoid saving if payload equals lastServerSavedPayload
        const payloadStr = JSON.stringify({ title, content });
        if (lastServerSavedPayloadRef.current === payloadStr) return;

        // perform save but don't show saving spinner for autosave
        const url = currentNoteId
          ? `/api/notes/${encodeURIComponent(currentNoteId)}`
          : '/api/notes';

        const { data: saved } = await api({
          method: currentNoteId ? 'put' : 'post',
          url,
          data: { title: title || 'Untitled note', content, sourceType: 'TEXT' },
        });

        // if created a new note, capture id for future saves
        if (!currentNoteId && saved && saved.id) {
          setCurrentNoteId(saved.id);
        }

        lastServerSavedPayloadRef.current = payloadStr;
        try {
          localStorage.removeItem(LOCAL_DRAFT_KEY);
        } catch {}
      } catch (e) {
        console.error('Autosave to server error', e);
      }
    }, AUTOSAVE_SERVER_MS);

    return () => {
      if (serverSaveTimer.current) clearTimeout(serverSaveTimer.current);
    };
  }, [content, currentNoteId, title]);

  const saveNote = async () => {
    setSaving(true);
    try {
      const url = currentNoteId ? `/api/notes/${encodeURIComponent(currentNoteId)}` : '/api/notes';

      const { data: saved } = await api({
        method: currentNoteId ? 'put' : 'post',
        url,
        data: { title: title || 'Untitled note', content, sourceType: 'TEXT' },
      });

      if (!currentNoteId && saved && saved.id) {
        setCurrentNoteId(saved.id);
      }

      try {
        localStorage.removeItem(LOCAL_DRAFT_KEY);
      } catch {}

      lastServerSavedPayloadRef.current = JSON.stringify({ title, content });
    } catch (e) {
      console.error('Save failed, draft retained locally', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col w-full">
      <LexicalEditor onChange={handleEditorChange} initialEditorState={content || undefined} />

      <Button
        onClick={saveNote}
        disabled={saving}
        size="lg"
        className="px-3 py-1 m-4 bg-indigo-600 text-white rounded w-fit"
      >
        {saving ? 'Saving…' : 'Save changes'}
      </Button>
    </div>
  );
}
