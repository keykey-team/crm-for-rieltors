export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const stages = await prisma.funnelStage.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
  return NextResponse.json(stages);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const maxOrder = await prisma.funnelStage.aggregate({ _max: { order: true } });
  const stage = await prisma.funnelStage.create({ data: { ...body, order: (maxOrder._max.order ?? -1) + 1 } });
  return NextResponse.json(stage);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, ...data } = await req.json();
  if (data.stages) {
    // Bulk reorder
    for (const s of data.stages) {
      await prisma.funnelStage.update({ where: { id: s.id }, data: { order: s.order } });
    }
    return NextResponse.json({ ok: true });
  }
  const stage = await prisma.funnelStage.update({ where: { id }, data });
  return NextResponse.json(stage);
}

const PROTECTED_STAGE_VALUES = ['new_lead', 'closed', 'cancelled', 'rejected'];

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const stage = await prisma.funnelStage.findUnique({ where: { id } });
  if (!stage) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (PROTECTED_STAGE_VALUES.includes(stage.value)) {
    return NextResponse.json({ error: 'Cannot delete system stage' }, { status: 403 });
  }
  await prisma.funnelStage.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
