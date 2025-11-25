import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { mastra } from '@/mastra';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text } = body as { text?: string };

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

    const notesAgent = mastra.getAgent('notesAgent');
    let agentResponse;
    try {
      agentResponse = await notesAgent.generate(
        `Create a concise note from the text below:\n\n${text}`
      );

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
          error: 'Failed to generate note',
          message: 'An error occurred while processing your request.',
        },
        { status: 500 }
      );
    }

    // Robust JSON parsing similar to flashcards route
    const safeParse = (text: string) => {
      try {
        return JSON.parse(text);
      } catch (e) {
        const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (fenceMatch && fenceMatch[1]) {
          try {
            return JSON.parse(fenceMatch[1]);
          } catch (e2) {
            // fallthrough
          }
        }

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

        throw new Error('Failed to parse agent JSON response');
      }
    };

    let parsed: any;
    try {
      parsed = safeParse(agentResponse.text);
    } catch (err) {
      console.error('Error parsing notes agent response:', err, '\nRaw:', agentResponse.text);
      return NextResponse.json(
        {
          error: 'Invalid response format',
          message: 'The AI generated an invalid response. Please try again.',
        },
        { status: 502 }
      );
    }

    // Create the note in the database
    const note = await prisma.note.create({
      data: {
        title: parsed.title || `Voice Note - ${new Date().toLocaleDateString()}`,
        content: parsed.content || '',
        userId: session.user.id,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error generating note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
