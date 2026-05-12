export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const category = req.nextUrl.searchParams.get('category');
  const where: any = { isActive: true };
  if (category) where.category = category;
  const items = await prisma.dictionary.findMany({ where, orderBy: [{ category: 'asc' }, { order: 'asc' }] });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const item = await prisma.dictionary.create({ data: body });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  if (body.items && Array.isArray(body.items)) {
    for (const item of body.items) {
      await prisma.dictionary.update({ where: { id: item.id }, data: { order: item.order } });
    }
    return NextResponse.json({ ok: true });
  }
  const { id, ...data } = body;
  const item = await prisma.dictionary.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.dictionary.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
