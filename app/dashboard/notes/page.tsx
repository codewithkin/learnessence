import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/dashboard/Sidebar';
import Container from '@/components/layout/Container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function NotesIndexPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/auth');
  }

  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    select: { id: true, title: true, createdAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="flex h-screen bg-white">
      <Sidebar user={session.user} />
      <Container>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Your Notes</h1>
          <Link href="/dashboard/notes/new">
            <Button>New note</Button>
          </Link>
        </div>

        <div className="divide-y">
          {notes.length === 0 ? (
            <div className="text-muted-foreground">You have no notes yet.</div>
          ) : (
            notes.map((n) => (
              <div key={n.id} className="py-3 flex items-center justify-between">
                <div>
                  <Link href={`/dashboard/notes/${n.id}`} className="text-lg font-medium">
                    {n.title || 'Untitled note'}
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant="secondary">{new Date(n.createdAt).toLocaleString()}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/notes/${n.id}`}>
                    <Button variant="outline">View</Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Container>
    </div>
  );
}
