'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';

interface FlashcardSet {
  id: string;
  title: string | null;
  _count: {
    cards: number;
  };
  updatedAt: Date;
}

interface RecentFlashcardSetsProps {
  userId: string;
}

export function RecentFlashcardSets({ userId }: RecentFlashcardSetsProps) {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlashcardSets() {
      try {
        const res = await fetch(`/api/flashcards?userId=${userId}&limit=4`);
        if (res.ok) {
          const data = await res.json();
          setFlashcardSets(data);
        }
      } catch (error) {
        console.error('Failed to fetch flashcard sets:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFlashcardSets();
  }, [userId]);

  if (loading) {
    return (
      <Card className="p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Flashcard Sets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 rounded-2xl shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        <Layers className="h-5 w-5 text-indigo-500" />
        Recent Flashcard Sets
      </h2>

      {flashcardSets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No flashcard sets yet. Create your first set.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {flashcardSets.map((set) => (
            <Card
              key={set.id}
              className="p-4 rounded-xl shadow-sm border border-border hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <Layers className="h-5 w-5 text-indigo-500" />
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  {set._count.cards} cards
                </span>
              </div>
              <h3 className="font-medium text-foreground mb-3 line-clamp-2">
                {set.title || 'Untitled Set'}
              </h3>
              <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Study Now
              </Button>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}
