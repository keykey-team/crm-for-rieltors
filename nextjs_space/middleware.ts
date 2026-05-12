import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any;
    if (!token) return NextResponse.next();

    const role = token.role ?? 'agent';
    // Admin and director have full access
    if (role === 'admin' || role === 'director') return NextResponse.next();

    const permsRaw = token.permissions as string | null | undefined;
    // No restrictions set = full access
    if (!permsRaw) return NextResponse.next();

    let perms: string[];
    try { perms = JSON.parse(permsRaw); } catch { return NextResponse.next(); }
    if (!Array.isArray(perms)) return NextResponse.next();

    // Extract section from pathname
    const path = req.nextUrl.pathname;
    let section = '';
    if (path.startsWith('/knowledge-base')) section = 'knowledge-base';
    else if (path.startsWith('/activity-log')) section = 'activity-log';
    else { const seg = path.replace(/^\//, '').split('/')[0]; section = seg || 'dashboard'; }

    // Settings, capabilities, pricing — always accessible
    if (['settings', 'capabilities', 'pricing', 'login', 'signup'].includes(section)) return NextResponse.next();

    if (!perms.includes(section)) {
      // Redirect to dashboard if they have access, otherwise settings
      const redirectTo = perms.includes('dashboard') ? '/dashboard' : '/settings';
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }

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
