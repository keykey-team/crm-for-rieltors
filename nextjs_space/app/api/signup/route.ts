export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, accountType } = body ?? {};
    if (!email || !password) {
      return NextResponse.json({ error: 'Вкажіть email та пароль' }, { status: 400 });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: 'Користувач вже існує' }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 12);
    const validAccountType = accountType === 'agency' ? 'agency' : 'agent';
    const defaultRole = validAccountType === 'agency' ? 'admin' : 'agent';
    const user = await prisma.user.create({
      data: { email, password: hashed, name: name ?? email.split('@')[0], role: defaultRole, accountType: validAccountType, plan: 'free' },
    });
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
