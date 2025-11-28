import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/dashboard/Sidebar';
import FlashcardsContent from '@/components/dashboard/FlashcardsContent';

export default async function FlashcardsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth');
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 bg-[#F9FAFB] pt-16 md:pt-6">
        <FlashcardsContent user={session.user} />
      </main>
    </div>
  );
}
