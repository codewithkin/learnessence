'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FlashCard from '@/components/flashcards/FlashCard';
import { ArrowLeft, Loader2, Folder, FolderOpen, Trash2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState<string | null>(null);

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

  const handleDeleteSet = async (setId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    setSetToDelete(setId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!setToDelete) return;

    try {
      const res = await fetch(`/api/flashcards/${setToDelete}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete flashcard set');
      }

      // Refresh the sets list
      setSets((prevSets) => prevSets?.filter((s) => s.id !== setToDelete) || null);
      setDeleteDialogOpen(false);
      setSetToDelete(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete flashcard set');
    }
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
          {sets.map((set, index) => {
            const isHovered = hoveredId === set.id;
            const FolderIcon = isHovered ? FolderOpen : Folder;

            return (
              <ContextMenu key={set.id}>
                <ContextMenuTrigger asChild>
                  <div
                    className="group cursor-pointer"
                    onClick={() => handleViewSet(set.id)}
                    onMouseEnter={() => setHoveredId(set.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-accent/50 transition-all">
                      <div className="relative mb-3">
                        <FolderIcon
                          className={`h-20 w-20 ${isHovered ? 'text-blue-600' : 'text-blue-500'} fill-blue-500 transition-colors`}
                          strokeWidth={1.5}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-sm">
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
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                  <ContextMenuItem
                    onClick={() => handleViewSet(set.id)}
                    className="font-semibold hover:bg-gray-100"
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Open
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={(e) => handleDeleteSet(set.id, e as any)}
                    className="text-red-600 focus:text-red-600 hover:bg-red-50 font-semibold"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Flashcard Set</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this flashcard set? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
