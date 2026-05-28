'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard, Users, Building, Workflow, CheckSquare,
  BarChart3, BookOpen, CalendarDays, Settings, ChevronLeft,
  ChevronRight, LogOut, Building2, Menu, X, Zap, FileText, MessageCircle, Shield, Globe, Sparkles, Crown, Search, Bell
} from 'lucide-react';
import { NotificationBell } from '@/shared/widgets/notification-bell';
import { cn } from '@/shared/lib/utils';
import { useTranslation, LOCALE_LABELS, Locale } from '@/shared/lib/i18n/context';
import { useSidebar } from '@/shared/lib/sidebar-context';
import { usePlan } from '@/shared/lib/plan-context';
import { useBrand } from '@/shared/lib/brand-context';
import { hasPermission, sectionFromPath } from '@/shared/lib/permissions';
import { AgencySwitcher } from '@/widgets/agency-switcher';

type NavItem = { href: string; labelKey: string; icon: any; minRole?: 'director' | 'admin'; feature?: string };
type NavGroup = { groupKey?: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    ],
  },
  {
    groupKey: 'nav.groupWork',
    items: [
      { href: '/deals', labelKey: 'nav.deals', icon: Workflow },
      { href: '/leads', labelKey: 'nav.leads', icon: Users },
      { href: '/properties', labelKey: 'nav.properties', icon: Building },
      { href: '/tasks', labelKey: 'nav.tasks', icon: CheckSquare },
      { href: '/calendar', labelKey: 'nav.calendar', icon: CalendarDays },
    ],
  },
  {
    groupKey: 'nav.groupTools',
    items: [
      { href: '/chat', labelKey: 'nav.chat', icon: MessageCircle, feature: 'chat' },
      { href: '/analytics', labelKey: 'nav.analytics', icon: BarChart3, minRole: 'director', feature: 'analytics' },
      { href: '/automations', labelKey: 'nav.automations', icon: Zap, minRole: 'director', feature: 'automations' },
      { href: '/templates', labelKey: 'nav.templates', icon: FileText, feature: 'templates' },
      { href: '/knowledge-base', labelKey: 'nav.knowledgeBase', icon: BookOpen, feature: 'knowledgeBase' },
    ],
  },
  {
    items: [
      { href: '/activity-log', labelKey: 'nav.activityLog', icon: Shield, minRole: 'director', feature: 'activityLog' },
      { href: '/capabilities', labelKey: 'nav.capabilities', icon: Sparkles },
      { href: '/pricing', labelKey: 'nav.pricing', icon: Crown },
      { href: '/settings', labelKey: 'nav.settings', icon: Settings },
    ],
  },
];

const ROLE_HIERARCHY: Record<string, number> = { admin: 3, director: 2, agent: 1 };

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession() || {};
  const { t, locale, setLocale } = useTranslation();
  const { hasFeature } = usePlan();
  const { brand, displayName } = useBrand();

  // Parse custom permissions from session
  const userPermissions = (session?.user as any)?.permissions as string | null | undefined;

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition active:scale-95">
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          {brand.brandLogo ? (
            <img src={brand.brandLogo} alt="logo" className="w-6 h-6 rounded-lg object-contain" />
          ) : (
            <Building2 className="w-5 h-5 text-primary" />
          )}
          <span className="font-display font-semibold text-sm">{displayName}</span>
        </Link>
        <NotificationBell collapsed={false} />
      </div>
      {/* Overlay */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />}
      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-full border-r border-border/60 dark:border-border/40 z-50 flex flex-col transition-all duration-300',
        brand.sidebarGlass ? 'glass-panel' : 'bg-background',
        collapsed ? 'w-[72px]' : 'w-[260px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        {/* Header */}
        <div className={cn('flex items-center h-16 px-4 border-b border-border/60 dark:border-border/40', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
              <img src="/logo.png" alt="logo" className="w-9 h-9 rounded-lg object-contain flex-shrink-0" />
              <span className="font-display font-bold text-lg truncate">{displayName}</span>
            </Link>
          )}
          {collapsed && (
            brand.brandLogo ? (
              <img src={brand.brandLogo} alt="logo" className="w-7 h-7 rounded-lg object-contain" />
            ) : (
              <Building2 className="w-7 h-7 text-primary" />
            )
          )}
          <div className="flex items-center gap-1">
            <NotificationBell collapsed={collapsed} />
            <button onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
              className={cn('hidden lg:flex p-1.5 rounded-lg hover:bg-muted transition', collapsed && 'mt-0')}>
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Search */}
        <div className="px-2 pt-3 pb-1">
          <button onClick={() => { const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }); window.dispatchEvent(e); }}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors border border-border/40 dark:border-border/30',
              collapsed && 'justify-center px-0'
            )}>
            <Search className="w-4 h-4 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left text-xs">{t('search.placeholder').split(',')[0]}...</span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border border-border">⌘K</kbd>
              </>
            )}
          </button>
        </div>
        {/* Nav */}
        <nav className="flex-1 py-2 px-2 overflow-y-auto">
          {!collapsed && <AgencySwitcher />}
          {NAV_GROUPS.map((group, gi) => {
            const userRole = (session?.user as any)?.role ?? 'agent';
            const visibleItems = group.items.filter((item) => {
              if (item.feature && !hasFeature(item.feature)) return false;
              // Check role hierarchy
              if (item.minRole && (ROLE_HIERARCHY[userRole] ?? 1) < (ROLE_HIERARCHY[item.minRole] ?? 1)) return false;
              // Check custom permissions
              const section = sectionFromPath(item.href);
              if (!hasPermission(userRole, userPermissions, section)) return false;
              return true;
            });
            if (visibleItems.length === 0) return null;
            return (
              <div key={gi} className={cn(gi > 0 && 'mt-2 pt-2 border-t border-border/40')}>
                {group.groupKey && !collapsed && (
                  <p className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{t(group.groupKey)}</p>
                )}
                {collapsed && gi > 0 && <div className="mx-3 mb-1" />}
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
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
                </div>
              </div>
            );
          })}
        </nav>
        {/* Footer */}
        <div className={cn('p-3 border-t border-border/60 dark:border-border/40', collapsed && 'flex flex-col items-center')}>
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
