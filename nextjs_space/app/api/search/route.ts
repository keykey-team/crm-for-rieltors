export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ownershipFilter } from '@/lib/role-guard';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    if (!q || q.length < 2) return NextResponse.json({ leads: [], deals: [], properties: [], tasks: [] });

    const userId = (session.user as any).id;
    const role = (session.user as any).role ?? 'agent';
    const filter = ownershipFilter(role, userId);

    const [leads, deals, properties, tasks] = await Promise.all([
      prisma.lead.findMany({
        where: {
          ...filter,
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, firstName: true, lastName: true, phone: true, status: true },
        take: 5,
      }),
      prisma.deal.findMany({
        where: {
          ...filter,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { notes: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, stage: true, amount: true },
        take: 5,
      }),
      prisma.property.findMany({
        where: {
          ...filter,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { address: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, address: true, type: true },
        take: 5,
      }),
      prisma.task.findMany({
        where: {
          ...filter,
          title: { contains: q, mode: 'insensitive' },
        },
        select: { id: true, title: true, status: true, priority: true },
        take: 5,
      }),
    ]);

    return NextResponse.json({ leads, deals, properties, tasks });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}
