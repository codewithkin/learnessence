'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import TraceBreadcrumbs from '@/components/shared/TraceBreadcrumbs';
import EditableTitle from './EditableTitle';
import RichTextEditor from './RichTextEditor';

export default function NoteEditor() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  return (
    <section className="w-full p-2 md:p-8 lg:p-12 overflow-y-auto">
      <TraceBreadcrumbs />
      <article className="flex flex-col gap-12 mt-4 mb-4 h-[90vh]">
        {/* Note title */}
        <EditableTitle
          value={title}
          onChange={setTitle}
          placeholder="Note Title"
          className="w-full text-4xl font-semibold"
        />

        {/* Note body */}
        <RichTextEditor
          value={body}
          onChange={(html) => setBody(html)}
          placeholder="Start writing your note here..."
          className="w-full h-full"
        />
      </article>

      {/* Actions */}
      <article className="flex flex-row gap-4">
        <Button>Save changes</Button>
      </article>
    </section>
  );
}
