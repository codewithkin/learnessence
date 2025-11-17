import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Verify session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Verify userId matches session
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Fetch flashcard sets with card count
    const flashcardSets = await prisma.flashcardSet.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
      include: {
        flashcards: {
          select: {
            id: true,
          },
        },
      },
    });

    const flashcardSetsWithCount = flashcardSets.map((set) => ({
      id: set.id,
      title: set.title,
      createdAt: set.createdAt,
      updatedAt: set.updatedAt,
      userId: set.userId,
      noteId: set.noteId,
      cardCount: set.flashcards.length,
    }));

    return NextResponse.json(flashcardSetsWithCount);
  } catch (error) {
    console.error('Error fetching flashcard sets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text, title, noteId } = body as { text?: string; title?: string; noteId?: string };

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    // If noteId provided, ensure ownership
    if (noteId) {
      const note = await prisma.note.findUnique({ where: { id: noteId } });
      if (!note || note.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Naive flashcard generation: split into sentences
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const cards = sentences.map((s) => {
      const front = s.length > 120 ? s.slice(0, 117) + '...' : s;
      const back = s; // simple echo back
      return { front, back };
    }).slice(0, 50); // limit to 50 cards

    const setTitle = title || `Flashcards - ${new Date().toLocaleDateString()}`;

    const created = await prisma.flashcardSet.create({
      data: {
        title: setTitle,
        userId: session.user.id,
        noteId: noteId || null,
        flashcards: {
          create: cards,
        },
      },
      include: { flashcards: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating flashcards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
