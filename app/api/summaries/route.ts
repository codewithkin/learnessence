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

    // Fetch summaries
    const summaries = await prisma.summary.findMany({
      where: {
        note: {
          userId: userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
      include: {
        note: {
          select: {
            title: true,
            id: true,
          },
        },
      },
    });

    return NextResponse.json(summaries);
  } catch (error) {
    console.error('Error fetching summaries:', error);
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
    const { text, noteId, style } = body as { text?: string; noteId?: string; style?: string };

    if (!text && !noteId) {
      return NextResponse.json({ error: 'Missing text or noteId' }, { status: 400 });
    }

    let noteToUseId = noteId;

    // If noteId provided, verify ownership
    if (noteId) {
      const note = await prisma.note.findUnique({ where: { id: noteId } });
      if (!note || note.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // If no noteId, create a new note from the provided text
    if (!noteToUseId && text) {
      const created = await prisma.note.create({
        data: {
          title: text.slice(0, 60) || 'Untitled note',
          content: text,
          sourceType: 'TEXT',
          userId: session.user.id,
        },
      });
      noteToUseId = created.id;
    }

    // Naive summary generation: take the first ~3 sentences or first 400 chars
    const generated = (() => {
      if (!text) return '';
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
      if (sentences.length >= 3) return sentences.slice(0, 3).join(' ').trim();
      return text.slice(0, 400).trim();
    })();

    const createdSummary = await prisma.summary.create({
      data: {
        content: generated || text || '',
        style: style || 'DETAILED',
        note: { connect: { id: noteToUseId! } },
      },
    });

    return NextResponse.json(createdSummary, { status: 201 });
  } catch (error) {
    console.error('Error creating summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
