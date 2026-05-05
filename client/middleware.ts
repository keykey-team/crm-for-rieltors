import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('crm_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/leads/:path*',
    '/properties/:path*',
    '/deals/:path*',
    '/tasks/:path*',
    '/analytics/:path*',
    '/knowledge-base/:path*',
    '/calendar/:path*',
    '/settings/:path*',
    '/automations/:path*',
    '/templates/:path*',
    '/chat/:path*',
    '/activity-log/:path*',
  ],
};
