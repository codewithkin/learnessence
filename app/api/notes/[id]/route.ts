import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolved = await params;
    const id = resolved?.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (note.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error fetching note by id:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolved = await params;
    const id = resolved?.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const body = await request.json();
    const { title, content } = body;

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (note.userId !== session.user.id)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const updated = await prisma.note.update({
      where: { id },
      data: {
        title: title ?? note.title,
        content: content ?? note.content,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolved = await params;
    const id = resolved?.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (note.userId !== session.user.id)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.note.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
