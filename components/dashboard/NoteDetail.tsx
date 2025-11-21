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
    const handleEdit = () => {
        setEditing(true);
    };

    const handleCancel = () => {
        setTitle(note.title ?? '');
        setBody(note.content ?? '');
        setEditing(false);
    };

    return (
        <div className="w-full">
            {!editing && <TraceBreadcrumbs />}
            {!editing ? (
                <article className="flex flex-col gap-4 mt-4 mb-4 h-[90vh]">
                    <h1 className="text-4xl font-semibold">{title}</h1>
                    <div className="prose prose-slate dark:prose-invert whitespace-pre-wrap overflow-y-auto flex-1">
                        {body}
                    </div>

                    <div className="mt-4">{isOwner && <Button onClick={handleEdit}>Edit note</Button>}</div>
                </article>
            ) : (
                <NoteEditor
                    noteId={note.id}
                    noteTitle={title}
                    noteContent={body}
                    onTitleChange={(v: string) => setTitle(v)}
                    onBodyChange={(v: string) => setBody(v)}
                />
            )}
        </div>
    );
}
