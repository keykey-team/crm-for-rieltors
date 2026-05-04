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
    const search = searchParams.get('search') ?? '';
    const category = searchParams.get('category') ?? '';
    const where: any = { published: true };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as any } },
        { content: { contains: search, mode: 'insensitive' as any } },
      ];
    }
    if (category) where.category = category;
    const articles = await prisma.knowledgeArticle.findMany({
      where, orderBy: { createdAt: 'desc' }, take: 100,
      include: { author: { select: { id: true, name: true } } },
    });
    return NextResponse.json(articles);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const article = await prisma.knowledgeArticle.create({
      data: {
        title: body.title,
        content: body.content,
        category: body.category ?? 'general',
        authorId: (session.user as any)?.id ?? null,
      },
    });
    return NextResponse.json(article);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}
