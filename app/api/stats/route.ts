import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;

    // Get counts for all user entities
    const [notesCount, flashcardSetsCount, summariesCount, transcriptionsCount] = await Promise.all(
      [
        prisma.note.count({ where: { userId } }),
        prisma.flashcardSet.count({ where: { userId } }),
        prisma.summary.count({ where: { userId } }),
        prisma.transcription.count({
          where: {
            note: {
              userId,
            },
          },
        }),
      ]
    );

    // Get total flashcards count across all user sets
    const flashcardsCount = await prisma.flashcard.count({
      where: {
        set: {
          userId,
        },
      },
    });

    return NextResponse.json({
      notes: notesCount,
      flashcardSets: flashcardSetsCount,
      flashcards: flashcardsCount,
      summaries: summariesCount,
      transcriptions: transcriptionsCount,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
