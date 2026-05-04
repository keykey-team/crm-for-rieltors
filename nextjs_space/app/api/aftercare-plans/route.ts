export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const plans = await prisma.aftercarePlan.findMany({ include: { steps: { orderBy: { order: 'asc' } } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { steps, ...data } = await req.json();
  const plan = await prisma.aftercarePlan.create({
    data: { ...data, steps: steps ? { create: steps } : undefined },
    include: { steps: { orderBy: { order: 'asc' } } },
  });
  return NextResponse.json(plan);
}
