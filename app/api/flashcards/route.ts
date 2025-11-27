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
        cards: {
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
      noteId: set.sourceNoteId,
      cardCount: set.cards.length,
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

    // Validate minimum length
    if (text.length < 200) {
      return NextResponse.json(
        {
          error: 'Transcript too short',
          message: `Transcript must be at least 200 characters. Received ${text.length} characters.`,
        },
        { status: 400 }
      );
    }

    // Get the flashcardsAgent
    const flashcardsAgent = mastra.getAgent('flashcardsAgent');

    // get the generated flashcards and title from the mastra agent
    // Data will be in the form { title: "Title here", flashCards: [{ question: "...", answer: "..." }] }
    let agentResponse;
    try {
      agentResponse = await flashcardsAgent.generate(
        `Generate flashcards for the following text:\n\n${text}`
      );

      console.log('Agent response: ', agentResponse);

      // Check if request was blocked by processors (tripwire)
      if (agentResponse.tripwire) {
        console.error('Request blocked by processor:', agentResponse.tripwireReason);
        return NextResponse.json(
          {
            error: 'Content blocked',
            message:
              agentResponse.tripwireReason ||
              'Your content was flagged by our safety filters. Please ensure your input is appropriate.',
          },
          { status: 400 }
        );
      }
    } catch (agentError: any) {
      console.error('Agent generation error:', agentError);

      // Check for specific guardrail failures
      if (agentError.message?.includes('blocked') || agentError.message?.includes('moderation')) {
        return NextResponse.json(
          {
            error: 'Content blocked',
            message:
              'Your content was flagged by our safety filters. Please ensure your input is appropriate.',
          },
          { status: 400 }
        );
      }

      if (agentError.message?.includes('injection') || agentError.message?.includes('jailbreak')) {
        return NextResponse.json(
          {
            error: 'Invalid input',
            message:
              'Your input contains patterns that cannot be processed. Please rephrase and try again.',
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: 'Failed to generate flashcards',
          message: 'An error occurred while processing your request.',
        },
        { status: 500 }
      );
    }

    console.log('Agent response: ', agentResponse.text);

    // Parse the JSON response from the agent robustly.
    // The agent may return the JSON wrapped in markdown code fences (```json ... ```)
    // or include stray text. Try several strategies to recover the JSON.
    const safeParse = (text: string) => {
      // 1) direct parse
      try {
        return JSON.parse(text);
      } catch (e) {
        // 2) strip markdown code fences like ```json\n...\n``` and parse inner
        const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (fenceMatch && fenceMatch[1]) {
          try {
            return JSON.parse(fenceMatch[1]);
          } catch (e2) {
            // fallthrough
          }
        }

        // 3) try to extract the first { ... } block
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const sub = text.slice(firstBrace, lastBrace + 1);
          try {
            return JSON.parse(sub);
          } catch (e3) {
            // fallthrough
          }
        }

        // If all fails, throw original error so we can return a helpful response.
        throw new Error('Failed to parse agent JSON response');
      }
    };

    let parsedResponse;
    try {
      parsedResponse = safeParse(agentResponse.text);
    } catch (err) {
      console.error('Error parsing agent response:', err, '\nRaw response:', agentResponse.text);
      return NextResponse.json(
        {
          error: 'Invalid response format',
          message: 'The AI generated an invalid response. Please try again.',
        },
        { status: 502 }
      );
    }

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
