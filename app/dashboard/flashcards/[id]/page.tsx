import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import FlashCard from '@/components/flashcards/FlashCard';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function FlashcardSetPage({ params }: Props) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        redirect('/auth');
    }

    const { id: setId } = await params;

    // Load the flashcard set and its cards from the database
    const set = await prisma.flashcardSet.findUnique({
        where: { id: setId },
        include: { cards: true },
    });

    if (!set || set.userId !== session.user.id) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <Card className="p-6">
                    <CardContent>
                        <div className="text-sm text-red-600">Flashcard set not found or access denied.</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 bg-[#F9FAFB]">
            <div className="mb-6">
                <Link
                    href="/dashboard/flashcards"
                    className="inline-flex items-center gap-2 text-sm text-indigo-600"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to sets
                </Link>
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{set.title || 'Untitled Set'}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {set.cards.length} cards • Created {new Date(set.createdAt).toLocaleDateString()}
                </p>
            </div>

            {set.cards.length === 0 ? (
                <Card className="p-6">
                    <CardContent>
                        <div className="text-sm text-gray-600">No cards in this set.</div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {set.cards.map((card) => (
                        <div key={card.id} className="cursor-pointer">
                            {/* Server components can't use client-only FlashCard if it depends on browser APIs. Importing the client component should work in Next if it's marked 'use client'. If it errors, replace with a simple card UI. */}
                            <FlashCard question={card.question} answer={card.answer} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
