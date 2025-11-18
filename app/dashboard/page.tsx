import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/auth');
  }

  return (
    <div className="flex h-screen">
      <Sidebar user={session.user} />
      <main className="flex-1 px-8 py-6 bg-[#F9FAFB] dark:bg-[#0F172A] overflow-y-auto">
        <DashboardContent userId={session.user.id} userName={session.user.name} />
      </main>
    </div>
  );
}
