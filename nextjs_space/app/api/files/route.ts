export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFileUrl } from '@/lib/s3';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const path = req.nextUrl.searchParams.get('path');
  if (!path) return NextResponse.json({ error: 'path required' }, { status: 400 });
  const isPublic = path.includes('/public/');
  const url = await getFileUrl(path, isPublic);
  return NextResponse.redirect(url);
}
