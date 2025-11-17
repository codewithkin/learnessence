'use client';

import { useState } from 'react';
import { signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMagicLinkLoading(true);
    try {
      const res = await signIn.magicLink({
        email,
        callbackURL: '/dashboard',
        newUserCallbackURL: '/onboarding',
      });

      if (res.error) {
        toast.error('Failed to send magic link', {
          description: res.error.message || 'Please try again or use another sign-in method.',
        });
      } else {
        toast.success('Magic link sent!', {
          description: `Check your inbox at ${email}`,
        });
        setSentEmail(email);
        setEmail('');
        setMagicLinkSent(true);
      }
    } catch {
      toast.error('An error occurred', {
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
        newUserCallbackURL: '/onboarding',
      });
    } catch {
      toast.error('Google sign-in failed', { description: 'Please try again.' });
      setIsGoogleLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="mx-auto w-16 h-16 flex items-center justify-center mb-4 bg-green-600 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>

          <motion.h3
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-semibold"
          >
            Check your inbox
          </motion.h3>

          <motion.p
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-sm text-muted-foreground mt-2"
          >
            We sent a magic link to <span className="font-medium">{sentEmail}</span>. It may take a
            minute to arrive.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-6 flex justify-center"
          >
            <Button variant="ghost" onClick={() => setMagicLinkSent(false)}>
              Back
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <main className="w-full max-w-md">
        <header className="space-y-2 pt-8 text-center">
          <div className="mx-auto w-12 h-12 flex items-center justify-center mb-2">
            <Lightbulb className="h-6 w-6 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold">Welcome back to LearnEssence</h1>
          <p className="text-sm text-muted-foreground">
            Because learning what matters is what truly matters
          </p>
        </header>

        <div className="space-y-4 mt-6">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-3"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Image src="/icons/google.png" alt="Google logo" width={20} height={20} />
                Continue with Google
              </>
            )}
          </Button>

          <form onSubmit={handleMagicLink} className="space-y-3">
            <label className="text-sm text-muted-foreground">Email</label>
            <Input
              type="email"
              placeholder="Enter email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" disabled={isMagicLinkLoading}>
              {isMagicLinkLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" /> Sending...
                </div>
              ) : (
                'Send magic link'
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
