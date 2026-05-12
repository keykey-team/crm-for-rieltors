export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any).id;
    const { plan } = await req.json();
    const validPlans = ['free', 'pro', 'business'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }
    // Update accountType to agency if upgrading to business
    const updateData: any = { plan };
    if (plan === 'business') {
      updateData.accountType = 'agency';
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    return NextResponse.json({ plan: user.plan, accountType: user.accountType });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
