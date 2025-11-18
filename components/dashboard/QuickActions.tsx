'use client';

import { Card } from '@/components/ui/card';
import { FileText, Sparkles, Layers, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const actions = [
  {
    icon: FileText,
    label: 'Create Note',
    description: 'Start a new note',
    href: '/dashboard/notes/new',
    color: 'text-indigo-500',
  },
  {
    icon: Sparkles,
    label: 'Generate Summary',
    description: 'Summarize your content',
    href: '/dashboard/summaries/new',
    color: 'text-amber-500',
  },
  {
    icon: Layers,
    label: 'Study Flashcards',
    description: 'Review your cards',
    href: '/dashboard/flashcards',
    color: 'text-indigo-500',
  },
  {
    icon: Mic,
    label: 'Start Voice Capture',
    description: 'Speak your thoughts',
    href: '/dashboard/voice',
    color: 'text-indigo-500',
  },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon;

        return (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05, ease: 'easeOut' }}
          >
            <Card
              className="p-6 rounded-2xl shadow-sm border border-border cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors"
              onClick={() => router.push(action.href)}
            >
              <Icon className={`h-6 w-6 ${action.color} mb-3`} />
              <h3 className="font-semibold text-foreground mb-1">{action.label}</h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
