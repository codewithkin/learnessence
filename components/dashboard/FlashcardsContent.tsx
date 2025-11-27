'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Folder, FolderOpen, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axiosClient';
import { toast } from 'sonner';
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

// single-set types are handled in the dedicated page

interface FlashcardsContentProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function FlashcardsContent({ user }: FlashcardsContentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState<string | null>(null);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselInitialIndex, setCarouselInitialIndex] = useState(0);

  // Query for fetching flashcard sets
  const { data: sets, isLoading: loading } = useQuery({
    queryKey: ['flashcardSets', user.id],
    queryFn: async () => {
      const res = await api.get(`/api/flashcards?userId=${user.id}`);
      return res.data as FlashcardSet[];
    },
  });

  // Mutation for deleting flashcard sets
  const deleteMutation = useMutation({
    mutationFn: async (setId: string) => {
      await api.delete(`/api/flashcards/${setId}`);
      return setId;
    },
    onSuccess: (deletedSetId) => {
      // Optimistically update cache to remove the deleted set
      queryClient.setQueryData(['flashcardSets', user.id], (old: FlashcardSet[] | undefined) => {
        return old?.filter((set) => set.id !== deletedSetId) || [];
      });

      // Force refetch to sync with database
      queryClient.refetchQueries({ queryKey: ['flashcardSets', user.id] });

      setDeleteDialogOpen(false);
      setSetToDelete(null);
      toast.success('Flashcard set deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || err?.message || 'Failed to delete flashcard set');
    },
  });

  const handleViewSet = (setId: string) => {
    // navigate to the dedicated set page (no sidebar shown there)
    router.push(`/dashboard/flashcards/${setId}`);
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

  const handleCardClick = (index: number) => {
    setCarouselInitialIndex(index);
    setCarouselOpen(true);
  };

  const handleCloseCarousel = () => {
    setCarouselOpen(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
        <p className="text-sm text-muted-foreground mt-1">View and study your flashcard sets</p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex flex-col items-center text-center p-4">
              <div className="relative mb-3">
                <Folder
                  className="h-20 w-20 text-gray-300 fill-gray-200 animate-pulse"
                  strokeWidth={1.5}
                />
              </div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
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
            const isDeleting = deleteMutation.isPending && setToDelete === set.id;
            const FolderIcon = isHovered ? FolderOpen : Folder;

            return (
              <ContextMenu key={set.id}>
                <ContextMenuTrigger asChild>
                  <div
                    className={`group cursor-pointer ${
                      isDeleting ? 'pointer-events-none opacity-50' : ''
                    }`}
                    onClick={() => !isDeleting && handleViewSet(set.id)}
                    onMouseEnter={() => !isDeleting && setHoveredId(set.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-accent/50 transition-all">
                      <div className="relative mb-3">
                        {isDeleting ? (
                          <Loader2 className="h-20 w-20 text-blue-500 animate-spin" />
                        ) : (
                          <FolderIcon
                            className={`h-20 w-20 ${isHovered ? 'text-blue-600' : 'text-blue-500'} fill-blue-500 transition-colors`}
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
    </div>
  );
}
