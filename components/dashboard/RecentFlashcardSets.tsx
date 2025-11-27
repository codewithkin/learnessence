'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Folder, FolderOpen, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axiosClient';
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Query for fetching flashcard sets
  const { data: flashcardSets = [], isLoading: loading } = useQuery({
    queryKey: ['flashcardSets', userId],
    queryFn: async () => {
      const res = await api.get(`/api/flashcards?userId=${userId}&limit=12`);
      return res.data as FlashcardSet[];
    },
  });

  // Mutation for deleting flashcard sets
  const deleteMutation = useMutation({
    mutationFn: async (setId: string) => {
      await api.delete(`/api/flashcards/${setId}`);
      return setId;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['flashcardSets', userId] });
      setDeleteDialogOpen(false);
      setSetToDelete(null);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.error || err?.message || 'Failed to delete flashcard set');
    },
  });

  const handleFolderClick = (setId: string) => {
    router.push(`/dashboard/flashcards?setId=${setId}`);
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
    deleteMutation.mutate(setToDelete);
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
          {flashcardSets.map((set, index) => {
            const isHovered = hoveredId === set.id;
            const isDeleting = deleteMutation.isPending && setToDelete === set.id;
            const FolderIcon = isHovered ? FolderOpen : Folder;

            return (
              <ContextMenu key={set.id}>
                <ContextMenuTrigger asChild>
                  <div
                    className={`group cursor-pointer ${
                      isDeleting ? 'pointer-events-none opacity-50' : ''
                    }`}
                    onClick={() => !isDeleting && handleFolderClick(set.id)}
                    onMouseEnter={() => !isDeleting && setHoveredId(set.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-accent/50 transition-all">
                      <div className="relative mb-3">
                        {isDeleting ? (
                          <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                        ) : (
                          <FolderIcon
                            className={`h-16 w-16 ${isHovered ? 'text-blue-600' : 'text-blue-500'} fill-blue-500 transition-colors`}
                            strokeWidth={1.5}
                          />
                        )}
                        {!isDeleting && (
                          <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-sm">
                            {set.cardCount}
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {set.title || 'Untitled Set'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {set.cardCount} {set.cardCount === 1 ? 'card' : 'cards'}
                      </p>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                  <ContextMenuItem
                    onClick={() => handleFolderClick(set.id)}
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
              <Button variant="outline" disabled={deleteMutation.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
