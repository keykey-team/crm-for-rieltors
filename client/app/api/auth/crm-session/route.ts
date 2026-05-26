import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import jwt from 'jsonwebtoken';
import { authOptions } from '@/shared/lib/auth';

const CRM_COOKIE_NAME = 'crm_token';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id || !user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const nextAuthToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const backendToken = typeof nextAuthToken?.backendToken === 'string' ? nextAuthToken.backendToken : null;
  const secret = process.env.BACKEND_JWT_SECRET || process.env.JWT_SECRET || 'change-me-local-secret';
  const token = backendToken ?? jwt.sign(
    { id: user.id, email: user.email, role: user.role ?? 'agent' },
    secret,
    { expiresIn: '7d' },
  );

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: CRM_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: CRM_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  });
  return res;
}

