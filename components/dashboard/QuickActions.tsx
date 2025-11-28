'use client';

import { Card } from '@/components/ui/card';
import { FileText, Layers, Mic, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axiosClient';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsData {
  notes: number;
  flashcardSets: number;
  flashcards: number;
  summaries: number;
  transcriptions: number;
}

interface UserStatsProps {
  userId: string;
}

export function UserStats({ userId }: UserStatsProps) {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ['userStats', userId],
    queryFn: async () => {
      const response = await api.get('/api/stats');
      return response.data;
    },
  });

  const statCards = [
    {
      icon: FileText,
      label: 'Notes',
      count: stats?.notes || 0,
      color: 'text-white',
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
    },
    {
      icon: Layers,
      label: 'Flashcard Sets',
      count: stats?.flashcardSets || 0,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      textColor: 'text-foreground',
    },
    {
      icon: BookOpen,
      label: 'Total Flashcards',
      count: stats?.flashcards || 0,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      textColor: 'text-foreground',
    },
    {
      icon: Mic,
      label: 'Voice Notes',
      count: stats?.transcriptions || 0,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      textColor: 'text-foreground',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="p-4 rounded-xl">
            <Skeleton className="h-5 w-5 mb-2" />
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-6 w-10" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05, ease: 'easeOut' }}
          >
            <Card className={`p-4 rounded-xl shadow-sm border border-border ${stat.bgColor}`}>
              <Icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <h3 className={`font-semibold ${stat.textColor} mb-1`}>{stat.label}</h3>
              <p className={`text-xl font-bold ${stat.textColor}`}>{stat.count}</p>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
