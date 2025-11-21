import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/dashboard/Sidebar';
import NoteDetail from '@/components/dashboard/NoteDetail';
import { prisma } from '@/lib/prisma';

export default async function NotePage({ params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: await headers() });

  // Allow anonymous viewing (no redirect to /auth) so notes can be shared publicly.
  // Editing is still restricted to the owner when a session is available.

  const { id } = params ?? {};

  if (!id) {
    // Missing id — show friendly not-found UI
    return (
      <div className="p-6">
        <Sidebar user={session?.user as any} />
        <div className="p-4 text-red-600">Note not found</div>
      </div>
    );
  }

  const note = await prisma.note.findUnique({
    where: { id },
    select: { id: true, title: true, content: true, userId: true },
  });

  if (!note) {
    return (
      <div className="p-6">
        <Sidebar user={session?.user as any} />
        <div className="p-4 text-red-600">Note not found</div>
      </div>
    );
  }

  const isOwner = !!session && note.userId === session.user.id;

  return (
    <div className="flex h-screen bg-white">
      <Sidebar user={session?.user as any} />
      <NoteDetail note={note} isOwner={isOwner} />
    </div>
  );
}
