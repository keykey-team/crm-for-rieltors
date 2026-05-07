export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { brandName: true, brandLogo: true, primaryColor: true, themeMode: true, sidebarGlass: true, sidebarOpacity: true, gradientBg: true },
    });
    return NextResponse.json(user ?? {});
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any).id;
    const plan = (session.user as any).plan ?? 'free';
    if (plan === 'free') {
      return NextResponse.json({ error: 'Branding requires Pro plan or higher' }, { status: 403 });
    }
    const body = await req.json();
    const { brandName, brandLogo, primaryColor, themeMode, sidebarGlass, sidebarOpacity, gradientBg } = body;
    const data: any = {};
    if (brandName !== undefined) data.brandName = brandName || null;
    if (brandLogo !== undefined) data.brandLogo = brandLogo || null;
    if (primaryColor !== undefined) data.primaryColor = primaryColor || null;
    if (themeMode !== undefined) data.themeMode = themeMode || 'light';
    if (sidebarGlass !== undefined) data.sidebarGlass = !!sidebarGlass;
    if (sidebarOpacity !== undefined) data.sidebarOpacity = typeof sidebarOpacity === 'number' ? sidebarOpacity : 1;
    if (gradientBg !== undefined) data.gradientBg = !!gradientBg;
    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: { brandName: true, brandLogo: true, primaryColor: true, themeMode: true, sidebarGlass: true, sidebarOpacity: true, gradientBg: true },
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}
