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

    const notesAgent = mastra.getAgent('notesAgent');
    const agentResponse = await notesAgent.generate(
      `Create a concise note from the text below:\n\n${text}`
    );

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
      return NextResponse.json({ error: 'Invalid agent response format' }, { status: 502 });
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
