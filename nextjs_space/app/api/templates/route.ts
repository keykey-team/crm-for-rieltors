export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') ?? '';
    const where: any = {};
    if (type) where.type = type;
    const templates = await prisma.template.findMany({
      where, orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    return NextResponse.json(templates);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const template = await prisma.template.create({
      data: {
        name: body.name,
        type: body.type ?? 'message',
        category: body.category ?? 'general',
        content: body.content,
        variables: body.variables ?? null,
        createdById: (session.user as any)?.id ?? null,
      },
    });
    return NextResponse.json(template);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}
