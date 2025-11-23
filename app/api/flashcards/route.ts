import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { mastra } from '@/mastra';

export async function GET(request: NextRequest) {
  try {
    // Verify session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Verify userId matches session
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text } = body as { text?: string };

    // Log the incoming transcription for debugging / verification
    console.log('Received transcription in /api/flashcards:', text);

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    // Get the flashcardsAgent
    const flashcardsAgent = mastra.getAgent('flashcardsAgent');

    // get the generated flashcards and title from the mastra agent
    // Data will be in the form { title: "Title here", flashCards: [{ question: "...", answer: "..." }] }
    const agentResponse = await flashcardsAgent.generate(
      `Generate flashcards for the following text:\n\n${text}`
    );

    console.log('Agent response: ', agentResponse.text);

    // Parse the JSON response from the agent
    const parsedResponse = JSON.parse(agentResponse.text);

    // Create a flashcard set
    const flashcardSet = await prisma.flashcardSet.create({
      data: {
        title: parsedResponse.title || '',
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    // Create the flashcards
    await prisma.flashcard.createMany({
      data: parsedResponse.flashCards.map((card: any) => ({
        question: card.question,
        answer: card.answer,
        setId: flashcardSet.id,
      })),
    });

    // Return the flashcards with IDs (generate temporary IDs for frontend)
    const flashcardsWithIds = parsedResponse.flashCards.map((card: any, index: number) => ({
      id: `${flashcardSet.id}-${index}`,
      question: card.question,
      answer: card.answer,
      setId: flashcardSet.id,
    }));

    return NextResponse.json(flashcardsWithIds, { status: 201 });
  } catch (error) {
    console.error('Error creating flashcards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
