'use client';

import { Card } from '@/components/ui/card';
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
      label: 'Notes',
      count: stats?.notes || 0,
      textColor: 'text-white',
      bgColor: 'bg-blue-500',
    },
    {
      label: 'Flashcard Sets',
      count: stats?.flashcardSets || 0,
      // default card background (no extra bg class)
      textColor: 'text-foreground',
      bgColor: '',
    },
    {
      label: 'Total Flashcards',
      count: stats?.flashcards || 0,
      textColor: 'text-foreground',
      bgColor: '',
    },
    {
      label: 'Voice Notes',
      count: stats?.transcriptions || 0,
      textColor: 'text-foreground',
      bgColor: '',
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
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05, ease: 'easeOut' }}
          >
            <Card className={`p-4 rounded-xl gap-2 shadow-sm border border-border ${stat.bgColor}`}>
              <h3 className={`font-medium ${stat.textColor} text-md`}>{stat.label}</h3>
              <p className={`text-4xl font-semibold ${stat.textColor}`}>{stat.count}</p>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
