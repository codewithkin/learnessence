import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/dashboard/Sidebar';
import NoteEditor from '@/components/notes/NoteEditor';

export default async function NewNotePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/auth');
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto px-8 py-6 bg-[#F9FAFB]">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold mb-2">Create a new note</h1>
          <p className="text-muted-foreground mb-6">
            Write and save notes in Markdown. Preview, then save to your library.
          </p>

          {/* Client editor component */}
          {/* Pass user id for save flow */}
          <NoteEditor />
        </div>
      </main>
    </div>
  );
}
