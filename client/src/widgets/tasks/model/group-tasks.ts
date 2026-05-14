import { AlertCircle, CalendarClock, CalendarDays, CalendarRange, Check, MoreHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Task } from '@/entities/task';

export interface TaskGroup {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  tasks: Task[];
}

export function groupTasksByDeadline(taskList: Task[], t: (k: string) => string): TaskGroup[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const tomorrowEnd = new Date(todayStart);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 2);
  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const groups: TaskGroup[] = [
    { key: 'overdue', label: t('tasks.group.overdue'), icon: AlertCircle, color: 'text-red-500', tasks: [] },
    { key: 'today', label: t('tasks.group.today'), icon: CalendarDays, color: 'text-emerald-500', tasks: [] },
    { key: 'tomorrow', label: t('tasks.group.tomorrow'), icon: CalendarClock, color: 'text-blue-500', tasks: [] },
    { key: 'week', label: t('tasks.group.thisWeek'), icon: CalendarRange, color: 'text-[#073B34] dark:text-emerald-400', tasks: [] },
    { key: 'later', label: t('tasks.group.later'), icon: MoreHorizontal, color: 'text-muted-foreground', tasks: [] },
    { key: 'done', label: t('common.done'), icon: Check, color: 'text-muted-foreground', tasks: [] },
  ];

  for (const task of taskList) {
    if (task.status === 'completed') {
      groups[5].tasks.push(task);
      continue;
    }
    if (!task.dueDate) {
      groups[4].tasks.push(task);
      continue;
    }

    const due = new Date(task.dueDate);
    if (due < todayStart) groups[0].tasks.push(task);
    else if (due < tomorrowStart) groups[1].tasks.push(task);
    else if (due < tomorrowEnd) groups[2].tasks.push(task);
    else if (due < weekEnd) groups[3].tasks.push(task);
    else groups[4].tasks.push(task);
  }

  return groups.filter((group) => group.tasks.length > 0);
}
