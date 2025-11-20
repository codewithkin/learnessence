'use client';

import { useEffect, useState } from 'react';
import NoteEditor from '@/components/notes/NoteEditor';
import api from '@/lib/axiosClient';

export default function NotePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [noteTitle, setNoteTitle] = useState<string | undefined>(undefined);
  const [noteContent, setNoteContent] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get(`/api/notes/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!mounted) return;
        const data = res.data;
        setNoteTitle(data?.title ?? '');
        setNoteContent(data?.content ?? '');
      })
      .catch((err) => {
        console.error('Failed to load note', err);
        if (!mounted) return;
        setError('Failed to load note');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="p-4">Loading note…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="w-full">
      <NoteEditor noteId={id} noteTitle={noteTitle} noteContent={noteContent} />
    </div>
  );
}
