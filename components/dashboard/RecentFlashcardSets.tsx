'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Folder, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FlashcardSet {
  id: string;
  title: string | null;
  cardCount: number;
  updatedAt: string;
  createdAt: string;
}

interface RecentFlashcardSetsProps {
  userId: string;
}

export function RecentFlashcardSets({ userId }: RecentFlashcardSetsProps) {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchFlashcardSets() {
      try {
        const res = await fetch(`/api/flashcards?userId=${userId}&limit=12`);
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

  const handleFolderClick = (setId: string) => {
    router.push(`/dashboard/flashcards?setId=${setId}`);
  };

  if (loading) {
    return (
      <Card className="p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">Flashcard Sets</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 rounded-2xl shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Folder className="h-5 w-5 text-amber-500" />
          Flashcard Sets
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/flashcards')}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View All
        </Button>
      </div>

      {flashcardSets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Folder className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p>No flashcard sets yet. Create your first set from your notes or voice recordings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {flashcardSets.map((set) => {
            const isHovered = hoveredId === set.id;
            const FolderIcon = isHovered ? FolderOpen : Folder;

            return (
              <div
                key={set.id}
                className="group cursor-pointer"
                onClick={() => handleFolderClick(set.id)}
                onMouseEnter={() => setHoveredId(set.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-accent/50 transition-all">
                  <div className="relative mb-3">
                    <FolderIcon
                      className="h-16 w-16 text-amber-500 group-hover:text-amber-600 transition-colors"
                      strokeWidth={1.5}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-sm">
                      {set.cardCount}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {set.title || 'Untitled Set'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {set.cardCount} {set.cardCount === 1 ? 'card' : 'cards'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
