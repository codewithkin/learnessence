import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function Home() {
  // Get session server-side — pass request headers
  const session = await auth.api.getSession({ headers: await headers() });

  // If session exists -> send to dashboard, otherwise send to auth
  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/auth');
  }
}
