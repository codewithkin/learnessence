import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
  try {
    const { setId } = await params;

    // Verify session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch flashcard set with all cards
    const flashcardSet = await prisma.flashcardSet.findUnique({
      where: {
        id: setId,
      },
      include: {
        cards: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!flashcardSet) {
      return NextResponse.json({ error: 'Flashcard set not found' }, { status: 404 });
    }

    // Verify ownership
    if (flashcardSet.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(flashcardSet);
  } catch (error) {
    console.error('Error fetching flashcard set:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
  try {
    const { setId } = await params;

    // Verify session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch flashcard set to verify ownership
    const flashcardSet = await prisma.flashcardSet.findUnique({
      where: {
        id: setId,
      },
    });

    if (!flashcardSet) {
      return NextResponse.json({ error: 'Flashcard set not found' }, { status: 404 });
    }

    // Verify ownership
    if (flashcardSet.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log(`Deleting flashcard set: ${setId}`);

    // Delete the flashcard set (cascade will handle cards)
    await prisma.flashcardSet.delete({
      where: {
        id: setId,
      },
    });

    console.log(`Successfully deleted flashcard set: ${setId}`);

    return NextResponse.json({ success: true, message: 'Flashcard set deleted successfully' });
  } catch (error) {
    console.error('Error deleting flashcard set:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
