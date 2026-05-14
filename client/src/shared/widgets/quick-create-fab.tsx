'use client';
import { useState, useRef, useEffect } from 'react';
import { Plus, Users, Workflow, CheckSquare, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/shared/lib/i18n/context';
import { cn } from '@/shared/lib/utils';

const ACTIONS = [
  { key: 'lead', icon: Users, path: '/leads', color: 'bg-blue-500', label: 'fab.newLead' },
  { key: 'deal', icon: Workflow, path: '/deals', color: 'bg-[#073B34]', label: 'fab.newDeal' },
  { key: 'task', icon: CheckSquare, path: '/tasks', color: 'bg-emerald-500', label: 'fab.newTask' },
] as const;

export function QuickCreateFab() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleAction = (path: string) => {
    setOpen(false);
    // Navigate to the page and trigger the create dialog via URL param
    router.push(`${path}?create=1`);
  };

  // Hide on detail/login/signup pages
  const hiddenPaths = ['/login', '/signup', '/settings', '/pricing', '/capabilities'];
  if (hiddenPaths.some(p => pathname.startsWith(p))) return null;

  return (
    <div ref={ref} className="fixed bottom-[100px] right-6 z-50 flex flex-col items-end gap-2">
      {/* Action items */}
      {open && (
        <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {ACTIONS.map(a => (
            <button key={a.key} onClick={() => handleAction(a.path)}
              className="flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-xl bg-card border border-border shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group">
              <span className="text-sm font-medium whitespace-nowrap">{t(a.label)}</span>
              <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white', a.color)}>
                <a.icon className="w-4 h-4" />
              </span>
            </button>
          ))}
        </div>
      )}
      {/* FAB button */}
      <button onClick={() => setOpen(v => !v)}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105',
          open ? 'bg-muted-foreground text-white rotate-45' : 'bg-primary text-white'
        )}>
        {open ? <X className="w-6 h-6 rotate-[-45deg]" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
}
