'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import NoteEditor from '@/components/notes/NoteEditor';
import api from '@/lib/axiosClient';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import TraceBreadcrumbs from '@/components/shared/TraceBreadcrumbs';

type Note = {
  id: string;
  title?: string | null;
  content?: string | null;
  userId?: string | null;
};

export default function NoteDetail({ note, isOwner }: { note: Note; isOwner: boolean }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title ?? '');
  const [body, setBody] = useState(note.content ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setTitle(note.title ?? '');
    setBody(note.content ?? '');
    setEditing(false);
  };

  const handleSave = async () => {
    const trimmedTitle = (title || '').trim();
    const trimmedBody = (body || '').trim();
    if (!trimmedTitle) return toast.error('Please provide a title for the note');
    if (!trimmedBody) return toast.error('Please provide note content before saving');

    setIsSaving(true);
    try {
      const { data } = await api.put(`/api/notes/${encodeURIComponent(note.id)}`, {
        title: trimmedTitle,
        content: trimmedBody,
      });
      setTitle(data.title ?? trimmedTitle);
      setBody(data.content ?? trimmedBody);
      toast.success('Note saved');
      setEditing(false);
    } catch (err) {
      console.error('Failed to save note', err);
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-screen bg-white">
      <div className="max-w-4xl w-full mx-auto p-6">
        <TraceBreadcrumbs />
        {!editing ? (
          <>
            <h1 className="text-4xl font-semibold">{title}</h1>
            <div className="mt-6 prose prose-slate dark:prose-invert whitespace-pre-wrap">
              {body}
            </div>

            <div className="mt-8">{isOwner && <Button onClick={handleEdit}>Edit note</Button>}</div>
          </>
        ) : (
          <>
            <NoteEditor
              noteId={note.id}
              noteTitle={title}
              noteContent={body}
              hideActions
              onTitleChange={(v: string) => setTitle(v)}
              onBodyChange={(v: string) => setBody(v)}
            />

            <div className="mt-6 flex items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className={isSaving ? 'opacity-50' : ''}
                aria-busy={isSaving}
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isSaving ? 'Saving changes' : 'Save changes'}
              </Button>
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
