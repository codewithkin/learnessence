import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function Home() {
  // Get session server-side — pass request headers
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    // Not authenticated — redirect to /auth on the server
    redirect('/auth');
  }

  // Authenticated — render dashboard placeholder
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <main className="max-w-2xl mx-auto p-6 bg-card rounded-xl shadow-sm">
        <div className="text-center text-card-foreground">
          {/* Dashboard placeholder */}
          <div className="h-40" />
        </div>
      </main>
    </div>
  );
}
