export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const dealId = req.nextUrl.searchParams.get('dealId');
  if (!dealId) return NextResponse.json({ error: 'dealId required' }, { status: 400 });
  const values = await prisma.dealCustomFieldValue.findMany({ where: { dealId }, include: { field: true } });
  return NextResponse.json(values);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { dealId, fieldId, value } = await req.json();
  const cfv = await prisma.dealCustomFieldValue.upsert({
    where: { dealId_fieldId: { dealId, fieldId } },
    update: { value },
    create: { dealId, fieldId, value },
  });
  return NextResponse.json(cfv);
}
