'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell, Clock, Users, Workflow, CheckSquare, AlertTriangle, X } from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18n/context';
import { cn } from '@/shared/lib/utils';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  href: string;
  time: string;
  actor?: string;
}

interface NotificationData {
  notifications: Notification[];
  overdue: number;
  newLeadsToday: number;
}

const TYPE_ICONS: Record<string, { icon: any; color: string }> = {
  overdue_task: { icon: AlertTriangle, color: 'text-destructive' },
  create: { icon: Users, color: 'text-blue-500' },
  update: { icon: Workflow, color: 'text-amber-500' },
  delete: { icon: X, color: 'text-red-500' },
  stage_change: { icon: Workflow, color: 'text-[#073B34] dark:text-[#CEFD56]' },
};

export function NotificationBell({ collapsed }: { collapsed?: boolean }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationData | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) {
          setData(null);
          return;
        }

        const payload = await res.json();
        setData({
          notifications: Array.isArray(payload?.notifications) ? payload.notifications : [],
          overdue: Number(payload?.overdue ?? 0),
          newLeadsToday: Number(payload?.newLeadsToday ?? 0),
        });
      } catch {
        setData(null);
      }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const notifications = data?.notifications ?? [];
  const unseen = notifications.filter(n => !seen.has(n.id)).length;
  const badge = (data?.overdue ?? 0) + unseen;

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open && data) {
      setSeen(new Set(notifications.map(n => n.id)));
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('notif.justNow');
    if (mins < 60) return `${mins} ${t('notif.minAgo')}`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ${t('notif.hrAgo')}`;
    return `${Math.floor(hrs / 24)} ${t('notif.dayAgo')}`;
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={handleOpen}
        className={cn('relative p-2 rounded-xl hover:bg-muted transition', collapsed && 'mx-auto')}>
        <Bell className="w-5 h-5 text-muted-foreground" />
        {badge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-white text-[10px] font-bold px-1">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </button>

      {open && (
        <div className={cn(
          'absolute top-full mt-2 w-80 bg-card border border-border rounded-xl overflow-hidden z-50',
          collapsed ? 'left-0' : 'left-0'
        )} style={{ boxShadow: 'var(--shadow-lg)' }}>
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold">{t('notif.title')}</span>
            <div className="flex gap-2 text-xs">
              {(data?.overdue ?? 0) > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
                  {data!.overdue} {t('notif.overdue')}
                </span>
              )}
              {(data?.newLeadsToday ?? 0) > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-medium">
                  +{data!.newLeadsToday} {t('notif.newLeads')}
                </span>
              )}
            </div>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">{t('notif.empty')}</div>
            ) : (
              notifications.slice(0, 15).map(n => {
                const typeInfo = TYPE_ICONS[n.type] || { icon: Clock, color: 'text-muted-foreground' };
                const Icon = typeInfo.icon;
                return (
                  <Link key={n.id} href={n.href} onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition border-b border-border/30 last:border-0">
                    <div className={cn('mt-0.5 flex-shrink-0', typeInfo.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug line-clamp-2">{n.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {n.actor && <span className="text-xs text-muted-foreground">{n.actor}</span>}
                        <span className="text-xs text-muted-foreground">{timeAgo(n.time)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
          <Link href="/activity-log" onClick={() => setOpen(false)}
            className="block text-center text-xs text-primary font-medium py-2.5 border-t border-border hover:bg-muted/30 transition">
            {t('notif.viewAll')}
          </Link>
        </div>
      )}
    </div>
  );
}
