import { cn } from '@/shared/lib/utils';
import type { ShowingStatus } from '../model/types';

type ShowingStatusBadgeProps = {
  status: ShowingStatus;
  label: string;
};

const STATUS_CLASS: Record<string, string> = {
  scheduled: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  completed: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  cancelled: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
  no_show: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
};

export function ShowingStatusBadge({ status, label }: ShowingStatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', STATUS_CLASS[status] ?? 'bg-muted text-muted-foreground')}>
      {label}
    </span>
  );
}
