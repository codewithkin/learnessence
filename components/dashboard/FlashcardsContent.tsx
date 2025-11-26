'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FlashCard from '@/components/flashcards/FlashCard';
import { ArrowLeft, Loader2, Folder, FolderOpen } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

type FlashcardSet = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  noteId?: string | null;
  cardCount: number;
};

type FlashcardSetWithCards = {
  id: string;
  title: string | null;
  userId: string;
  sourceNoteId: string | null;
  cards: {
    id: string;
    question: string;
    answer: string;
    setId: string | null;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

interface FlashcardsContentProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function FlashcardsContent({ user }: FlashcardsContentProps) {
  const searchParams = useSearchParams();
  const setIdFromUrl = searchParams.get('setId');

  const [sets, setSets] = useState<FlashcardSet[] | null>(null);
  const [selectedSet, setSelectedSet] = useState<FlashcardSetWithCards | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSet, setLoadingSet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSets = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/flashcards?userId=${user.id}`);

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || res.statusText || 'Failed to fetch');
        }

        const data = (await res.json()) as FlashcardSet[];
        setSets(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load flashcards');
      } finally {
        setLoading(false);
      }
    };

    fetchSets();
  }, [user.id]);

  useEffect(() => {
    if (setIdFromUrl && !selectedSet) {
      handleViewSet(setIdFromUrl);
    }
  }, [setIdFromUrl]);

  const handleViewSet = async (setId: string) => {
    setLoadingSet(true);
    setError(null);
    try {
      const res = await fetch(`/api/flashcards/${setId}`);

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || res.statusText || 'Failed to fetch');
      }

      const data = (await res.json()) as FlashcardSetWithCards;
      setSelectedSet(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load flashcard set');
    } finally {
      setLoadingSet(false);
    }
  };

  const handleBack = () => {
    setSelectedSet(null);
    // Update URL to remove setId param
    window.history.pushState({}, '', '/dashboard/flashcards');
  };

  if (selectedSet) {
    return (
      <div>
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sets
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedSet.title || 'Untitled Set'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedSet.cards.length} cards • Created{' '}
            {new Date(selectedSet.createdAt).toLocaleDateString()}
          </p>
        </div>

        {loadingSet && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        )}

        {!loadingSet && selectedSet.cards.length === 0 && (
          <Card className="p-6">
            <CardContent>
              <div className="text-sm text-gray-600">No cards in this set.</div>
            </CardContent>
          </Card>
        )}

        {!loadingSet && selectedSet.cards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {selectedSet.cards.map((card, index) => (
              <FlashCard
                key={card.id}
                question={card.question}
                answer={card.answer}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
        <p className="text-sm text-muted-foreground mt-1">View and study your flashcard sets</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <CardContent>
            <div className="text-sm text-red-600">Error: {error}</div>
          </CardContent>
        </Card>
      )}

      {!loading && sets?.length === 0 && (
        <div className="text-center py-12">
          <Folder className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-sm text-gray-600">
            No flashcard sets found. Create flashcards from your notes or voice recordings.
          </p>
        </div>
      )}

      {!loading && sets && sets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {sets.map((set) => {
            const isHovered = hoveredId === set.id;
            const FolderIcon = isHovered ? FolderOpen : Folder;

            return (
              <div
                key={set.id}
                className="group cursor-pointer"
                onClick={() => handleViewSet(set.id)}
                onMouseEnter={() => setHoveredId(set.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-accent/50 transition-all">
                  <div className="relative mb-3">
                    <FolderIcon
                      className="h-20 w-20 text-amber-500 group-hover:text-amber-600 transition-colors"
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
                  <p className="text-xs text-muted-foreground">
                    {new Date(set.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
