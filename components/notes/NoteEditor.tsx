'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axiosClient';
import TraceBreadcrumbs from '@/components/shared/TraceBreadcrumbs';
import EditableTitle from './EditableTitle';
import RichTextEditor from './RichTextEditor';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import useNoteDraftStore from '@/stores/useNoteDraftStore';

type NoteEditorProps = {
  noteId?: string;
  noteTitle?: string;
  noteContent?: string;
};

export default function NoteEditor({ noteId, noteTitle, noteContent }: NoteEditorProps) {
  const [title, setTitleLocal] = useState(noteTitle ?? '');
  const [body, setBodyLocal] = useState(noteContent ?? '');
  const [currentNoteId, setCurrentNoteId] = useState<string | undefined>(noteId);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [titleConfirmed, setTitleConfirmed] = useState(false);

  const queryClient = useQueryClient();

  const { title: savedTitle, body: savedBody, setTitle, setBody, clear } = useNoteDraftStore();

  // hydrate from props (noteTitle/noteContent) if provided, otherwise from persistent draft store
  // Note: avoid listening to `savedTitle`/`savedBody` to prevent update loops when
  // the draft store and local state bounce updates. Only initialize from the store
  // on mount (or when route props change).
  useEffect(() => {
    if (noteTitle !== undefined || noteContent !== undefined) {
      if (noteTitle !== undefined && title !== noteTitle) setTitleLocal(noteTitle);
      if (noteContent !== undefined && body !== noteContent) setBodyLocal(noteContent);
      if (noteId) setCurrentNoteId(noteId);
      return;
    }

    if (savedTitle && title !== savedTitle) setTitleLocal(savedTitle);
    if (savedBody && body !== savedBody) setBodyLocal(savedBody);
    // Intentionally do not include savedTitle/savedBody in deps to avoid loops.
  }, [noteId, noteTitle, noteContent]);

  // sync local edits into the draft store only when NOT editing an existing note passed via props
  useEffect(() => {
    if (noteId) return;
    setTitle(title);
  }, [title, setTitle, noteId]);

  useEffect(() => {
    if (noteId) return;
    setBody(body);
  }, [body, setBody, noteId]);

  type NoteVariables = { id?: string; title: string; content: string };

  const saveMutation = useMutation<any, Error, NoteVariables>({
    mutationFn: async ({ id, title, content }: NoteVariables) => {
      const payload = { title: title || 'Untitled note', content };
      if (id) {
        const { data } = await api.put(`/api/notes/${encodeURIComponent(id)}`, payload);
        return data;
      }
      const { data } = await api.post('/api/notes', payload);
      return data;
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      const previous = queryClient.getQueryData(['notes']);
      queryClient.setQueryData(['notes'], (old: any) => {
        const temp = { id: 'temp-' + Date.now(), title: vars.title, content: vars.content };
        return old ? [temp, ...old] : [temp];
      });
      return { previous };
    },
    onError: (err, vars, context: any) => {
      if (context?.previous) queryClient.setQueryData(['notes'], context.previous);
      toast.error('Failed to save note');
    },
    onSuccess(data) {
      if (data && data.id) setCurrentNoteId(data.id);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note saved');
      clear();
    },
  });

  // react-query's types here may not expose `isLoading` directly in some setups,
  // normalize to a boolean for rendering/loading states.
  const isSaving = Boolean((saveMutation as any).isLoading);

  // Reset title confirmation when title changes away from the confirmed value
  useEffect(() => {
    if (!titleConfirmed) return;
    const t = title?.trim().toLowerCase() ?? '';
    if (t !== 'untitled note' && t !== 'untitled content') {
      setTitleConfirmed(false);
    }
  }, [title, titleConfirmed]);

  const handleSaveClick = () => {
    // basic validation: require both title and content
    const trimmedTitle = (title || '').trim();
    const trimmedBody = (body || '').trim();

    if (!trimmedTitle) {
      toast.error('Please provide a title for the note');
      return;
    }

    if (!trimmedBody) {
      toast.error('Please provide note content before saving');
      return;
    }

    const lowerTitle = trimmedTitle.toLowerCase();
    // If title is the default-ish value, ask for confirmation once
    if ((lowerTitle === 'untitled content' || lowerTitle === 'untitled note') && !titleConfirmed) {
      setShowConfirmDialog(true);
      return;
    }

    // proceed to save
    saveMutation.mutate({ id: currentNoteId, title: trimmedTitle, content: body });
  };

  const confirmTitleAndSave = () => {
    setTitleConfirmed(true);
    setShowConfirmDialog(false);
    saveMutation.mutate({ id: currentNoteId, title: title.trim(), content: body });
  };

  return (
    <section className="w-full p-2 md:p-8 lg:p-12 overflow-y-auto">
      <TraceBreadcrumbs />
      <article className="flex flex-col gap-4 mt-4 mb-4 h-[90vh]">
        {/* Note title */}
        <EditableTitle
          value={title}
          onChange={(v: string) => setTitleLocal(v)}
          placeholder="Note Title"
          className="w-full text-4xl font-semibold"
        />

        {/* Note body */}
        <RichTextEditor
          value={body}
          onChange={(html: string) => setBodyLocal(html)}
          placeholder="Start writing your note here..."
          className="w-full h-full"
        />
      </article>

      {/* Actions */}
      <article className="flex flex-row gap-4">
        <Button onClick={handleSaveClick} disabled={isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSaving ? 'Saving changes' : 'Save changes'}
        </Button>
      </article>

      {/* Confirmation dialog for untitled notes */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowConfirmDialog(false)}
          />
          <div className="relative w-full max-w-xl mx-4 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-sm text-muted-foreground">LearnEssence</h3>
            <h2 className="text-lg font-semibold mt-2">Confirm Title</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Your note title appears to be "{title}". Are you sure you want to keep this as the
              title?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmTitleAndSave}>Continue</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
