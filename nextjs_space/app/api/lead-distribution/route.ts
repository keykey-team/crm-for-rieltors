export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rules = await prisma.leadDistributionRule.findMany({
    include: { assignTo: { select: { id: true, name: true } } },
    orderBy: { priority: 'desc' },
  });
  return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const rule = await prisma.leadDistributionRule.create({
    data: body,
    include: { assignTo: { select: { id: true, name: true } } },
  });
  return NextResponse.json(rule);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, ...data } = await req.json();
  const rule = await prisma.leadDistributionRule.update({
    where: { id },
    data,
    include: { assignTo: { select: { id: true, name: true } } },
  });
  return NextResponse.json(rule);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.leadDistributionRule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
