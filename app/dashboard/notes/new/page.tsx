import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/dashboard/Sidebar';
import NoteEditor from '@/components/notes/NoteEditor';
import Container from '@/components/layout/Container';

export default async function NewNotePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/auth');
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar user={session.user} />
      <Container>
        <NoteEditor {...({ redirectToNote: true, redirectBase: '/dashboard/notes' } as any)} />
      </Container>
    </div>
  );
}
