import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/dashboard/Sidebar';
import NoteDetail from '@/components/dashboard/NoteDetail';
import Container from '@/components/layout/Container';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });

  // Allow anonymous viewing (no redirect to /auth) so notes can be shared publicly.
  // Editing is still restricted to the owner when a session is available.

  const { id } = (await params) ?? {};

  if (!id) {
    // Missing id — show friendly not-found UI
    return (
      <div className="p-6">
        <Sidebar user={session?.user} />
        <div className="p-4">
          <div className="text-red-600 mb-3">Note not found</div>
          <Link href="/dashboard">
            <Button variant="ghost">Back to dashboard</Button>
          </Link>
        </div>
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
        <Sidebar user={session?.user} />
        <div className="p-4">
          <div className="text-red-600 mb-3">Note not found</div>
          <Link href="/dashboard">
            <Button variant="ghost">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = !!session && note.userId === session.user.id;

  return (
    <div className="flex h-screen bg-white">
      <Sidebar user={session?.user} />
      <Container>
        <NoteDetail note={note} isOwner={isOwner} />
      </Container>
    </div>
  );
}
