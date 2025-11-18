import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/dashboard/Sidebar';
import VoiceInputContent from '@/components/dashboard/VoiceInputContent';

export default async function VoiceInputPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth');
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto px-8 py-6 bg-[#F9FAFB]">
        <VoiceInputContent user={session.user} />
      </main>
    </div>
  );
}
