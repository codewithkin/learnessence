'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, MoreHorizontal, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axiosClient';
import { toast } from 'sonner';

type Note = {
  id: string;
  title: string | null;
  content: string | null;
  createdAt: string;
};

export default function NoteCard({ note }: { note: Note }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/api/notes/${note.id}`);
    },
    onMutate: () => {
      setIsDeleting(true);
    },
    onSuccess: () => {
      toast.success('Note deleted');
      setDeleteOpen(false);
      setIsDeleting(false);
      // Ensure the user stays on the notes index after deletion
      router.push('/dashboard/notes');
    },
    onError: (err: any) => {
      setIsDeleting(false);
      toast.error(err?.response?.data?.error || err?.message || 'Failed to delete note');
    },
  });

  const handleOpen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    router.push(`/dashboard/notes/${note.id}`);
  };

  const handleDeleteClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeleteOpen(true);
  };

  const confirmDelete = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    deleteMutation.mutate();
  };

  const preview = note.content
    ? note.content.slice(0, 100).trim() + (note.content!.length > 100 ? '...' : '')
    : 'No content';

  const date = new Date(note.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div onClick={() => router.push(`/dashboard/notes/${note.id}`)}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full bg-amber-50/30 border-amber-100">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {note.title || 'Untitled note'}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-400 hover:text-gray-600 -mt-1"
                  aria-label="Note actions"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem onClick={handleOpen} className="font-semibold">
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteClick} variant="destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{preview}</p>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              <span>
                {formattedDate} • {formattedTime}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...
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
