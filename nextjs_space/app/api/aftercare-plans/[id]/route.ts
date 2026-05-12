export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { steps, ...data } = await req.json();
  // Delete old steps and recreate
  if (steps) {
    await prisma.aftercareStep.deleteMany({ where: { planId: id } });
    await prisma.aftercareStep.createMany({ data: steps.map((s: any) => ({ ...s, planId: id })) });
  }
  const plan = await prisma.aftercarePlan.update({ where: { id }, data, include: { steps: { orderBy: { order: 'asc' } } } });
  return NextResponse.json(plan);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await prisma.aftercarePlan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
