import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

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
