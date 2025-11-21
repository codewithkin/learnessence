'use client';

import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Note {
  id: string;
  title: string | null;
  content: string;
  updatedAt: Date;
}

interface RecentNotesProps {
  userId: string;
}

export function RecentNotes({ userId }: RecentNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await fetch(`/api/notes?userId=${userId}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setNotes(data);
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
  }, [userId]);

  // No sourceType available on Note model — previews show content only.

  const getPreview = (content: string) => {
    return content.slice(0, 120) + (content.length > 120 ? '...' : '');
  };

  if (loading) {
    return (
      <Card className="p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Notes</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 rounded-2xl shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-indigo-500" />
        Recent Notes
      </h2>

      {notes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No notes yet. Create your first note to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note, index) => (
            <div
              key={note.id}
              className={`pb-4 cursor-pointer hover:bg-accent/50 -mx-2 px-2 rounded-lg transition-colors ${
                index !== notes.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-medium text-foreground">{note.title || 'Untitled note'}</h3>
                <div />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{getPreview(note.content)}</p>
              <p className="text-xs text-muted-foreground">
                Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
