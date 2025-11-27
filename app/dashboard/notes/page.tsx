import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import NoteCard from '@/components/notes/NoteCard';

export default async function NotesIndexPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/auth');
  }

  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    select: { id: true, title: true, content: true, createdAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="flex h-screen bg-white">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto p-8 bg-[#F9FAFB]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Notes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>
          <Link href="/dashboard/notes/new">
            <Button>New note</Button>
          </Link>
        </div>

        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">You have no notes yet.</p>
            <Link href="/dashboard/notes/new" className="mt-4">
              <Button>Create your first note</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={{
                  id: note.id,
                  title: note.title || null,
                  content: note.content || null,
                  createdAt: note.createdAt.toISOString(),
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
