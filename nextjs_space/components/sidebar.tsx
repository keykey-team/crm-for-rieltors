'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard, Users, Building, Workflow, CheckSquare,
  BarChart3, BookOpen, CalendarDays, Settings, ChevronLeft,
  ChevronRight, LogOut, Building2, Menu, X, Zap, FileText, MessageCircle, Shield, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation, LOCALE_LABELS, Locale } from '@/lib/i18n/context';

const NAV_ITEMS = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/deals', labelKey: 'nav.deals', icon: Workflow },
  { href: '/leads', labelKey: 'nav.leads', icon: Users },
  { href: '/properties', labelKey: 'nav.properties', icon: Building },
  { href: '/tasks', labelKey: 'nav.tasks', icon: CheckSquare },
  { href: '/calendar', labelKey: 'nav.calendar', icon: CalendarDays },
  { href: '/analytics', labelKey: 'nav.analytics', icon: BarChart3, minRole: 'director' as const },
  { href: '/automations', labelKey: 'nav.automations', icon: Zap, minRole: 'director' as const },
  { href: '/templates', labelKey: 'nav.templates', icon: FileText },
  { href: '/knowledge-base', labelKey: 'nav.knowledgeBase', icon: BookOpen },
  { href: '/chat', labelKey: 'nav.chat', icon: MessageCircle },
  { href: '/activity-log', labelKey: 'nav.activityLog', icon: Shield, minRole: 'director' as const },
  { href: '/settings', labelKey: 'nav.settings', icon: Settings },
];

const ROLE_HIERARCHY: Record<string, number> = { admin: 3, director: 2, agent: 1 };

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession() || {};
  const { t, locale, setLocale } = useTranslation();

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white border border-border" style={{ boxShadow: 'var(--shadow-md)' }}>
        <Menu className="w-5 h-5" />
      </button>
      {/* Overlay */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/20 z-40" onClick={() => setMobileOpen(false)} />}
      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-full bg-white border-r border-border z-50 flex flex-col transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[260px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )} style={{ boxShadow: 'var(--shadow-sm)' }}>
        {/* Header */}
        <div className={cn('flex items-center h-16 px-4 border-b border-border', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <Building2 className="w-7 h-7 text-primary" />
              <span className="font-display font-bold text-lg">RealCRM</span>
            </Link>
          )}
          {collapsed && <Building2 className="w-7 h-7 text-primary" />}
          <button onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className={cn('hidden lg:flex p-1.5 rounded-lg hover:bg-muted transition', collapsed && 'mt-0')}>
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.filter((item) => {
            if (!item.minRole) return true;
            const userRole = (session?.user as any)?.role ?? 'agent';
            return (ROLE_HIERARCHY[userRole] ?? 1) >= (ROLE_HIERARCHY[item.minRole] ?? 1);
          }).map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed && 'justify-center px-0'
                )}>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{t(item.labelKey)}</span>}
              </Link>
            );
          })}
        </nav>
        {/* Footer */}
        <div className={cn('p-3 border-t border-border', collapsed && 'flex flex-col items-center')}>
          {!collapsed && session?.user && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                {(session.user.name ?? session.user.email ?? 'U')?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium truncate">{session.user.name ?? 'User'}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
                    {t(`role.${(session.user as any)?.role ?? 'agent'}`)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
              </div>
            </div>
          )}
          {/* Language switcher */}
          {!collapsed && (
            <div className="flex items-center gap-1 px-2 mb-1">
              <Globe className="w-4 h-4 text-muted-foreground mr-1" />
              {(Object.keys(LOCALE_LABELS) as Locale[]).map(l => (
                <button type="button" key={l} onClick={() => setLocale(l)}
                  aria-label={`Switch language to ${l}`}
                  className={cn('px-2 py-1 rounded-lg text-xs font-medium transition', l === locale ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted')}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          )}
          <button type="button" aria-label="Sign out" onClick={() => signOut({ callbackUrl: '/login' })}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition',
              collapsed && 'justify-center px-0'
            )}>
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>{t('nav.signOut')}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}