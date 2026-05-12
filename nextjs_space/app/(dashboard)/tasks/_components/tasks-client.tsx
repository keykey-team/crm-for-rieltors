'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, CheckSquare, Check, ListTodo, List, LayoutGrid, GripVertical, AlertCircle, CalendarDays, CalendarClock, CalendarRange, MoreHorizontal } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { TaskDialog } from './task-dialog';
import { PRIORITIES, TASK_TYPES } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/context';
import { HintTooltip } from '@/components/hint-tooltip';
import { confirmAction } from '@/lib/confirm-action';

export function TasksClient() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('create') === '1') { setEditTask(null); setDialogOpen(true); }
  }, [searchParams]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`/api/tasks?${params.toString()}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    list.sort((a: any, b: any) => {
      const aDone = a.status === 'completed' ? 1 : 0;
      const bDone = b.status === 'completed' ? 1 : 0;
      return aDone - bDone;
    });
    setTasks(list);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSave = async (data: any) => {
    if (editTask) {
      await fetch(`/api/tasks/${editTask.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    } else {
      await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    }
    setDialogOpen(false); setEditTask(null); fetchTasks();
  };

  const toggleComplete = async (task: any) => {
    const newStatus = task?.status === 'completed' ? 'pending' : 'completed';
    await fetch(`/api/tasks/${task?.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    fetchTasks();
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmAction(t('tasks.deleteTask'), { confirm: t('common.delete'), cancel: t('common.cancel') });
    if (!ok) return;
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  const handleDrop = async (status: string) => {
    if (!dragId) return;
    const task = tasks.find(t => t.id === dragId);
    if (!task || task.status === status) { setDragId(null); return; }
    await fetch(`/api/tasks/${dragId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, status }),
    });
    setDragId(null);
    fetchTasks();
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  /* ─── Group tasks by deadline ─── */
  const groupTasks = useCallback((taskList: any[]) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(todayStart); tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const tomorrowEnd = new Date(todayStart); tomorrowEnd.setDate(tomorrowEnd.getDate() + 2);
    const weekEnd = new Date(todayStart); weekEnd.setDate(weekEnd.getDate() + 7);

    const groups: { key: string; label: string; icon: any; color: string; tasks: any[] }[] = [
      { key: 'overdue', label: t('tasks.group.overdue'), icon: AlertCircle, color: 'text-red-500', tasks: [] },
      { key: 'today', label: t('tasks.group.today'), icon: CalendarDays, color: 'text-emerald-500', tasks: [] },
      { key: 'tomorrow', label: t('tasks.group.tomorrow'), icon: CalendarClock, color: 'text-blue-500', tasks: [] },
      { key: 'week', label: t('tasks.group.thisWeek'), icon: CalendarRange, color: 'text-[#073B34] dark:text-emerald-400', tasks: [] },
      { key: 'later', label: t('tasks.group.later'), icon: MoreHorizontal, color: 'text-muted-foreground', tasks: [] },
      { key: 'done', label: t('common.done'), icon: Check, color: 'text-muted-foreground', tasks: [] },
    ];

    for (const task of taskList) {
      if (task.status === 'completed') { groups[5].tasks.push(task); continue; }
      if (!task.dueDate) { groups[4].tasks.push(task); continue; }
      const due = new Date(task.dueDate);
      if (due < todayStart) groups[0].tasks.push(task);
      else if (due < tomorrowStart) groups[1].tasks.push(task);
      else if (due < tomorrowEnd) groups[2].tasks.push(task);
      else if (due < weekEnd) groups[3].tasks.push(task);
      else groups[4].tasks.push(task);
    }
    return groups.filter(g => g.tasks.length > 0);
  }, [t]);

  const renderTaskCard = (task: any, compact = false) => {
    const pr = PRIORITIES.find((p: any) => p.value === task?.priority);
    const tp = TASK_TYPES.find((tt: any) => tt.value === task?.type);
    const isDone = task?.status === 'completed';
    const isOverdue = !isDone && task?.dueDate && new Date(task.dueDate) < new Date();
    return (
      <div key={task?.id}
        draggable
        onDragStart={() => setDragId(task.id)}
        onDragEnd={() => setDragId(null)}
        className={cn('bg-card rounded-2xl p-3 flex items-start gap-3 transition cursor-grab active:cursor-grabbing border border-border/60 dark:border-border/40 hover:border-primary/30',
          isDone && 'opacity-60', dragId === task.id && 'opacity-30 scale-95')}
        style={{ boxShadow: 'var(--shadow-sm)' }}
        onClick={() => { setEditTask(task); setDialogOpen(true); }}>
        <GripVertical className="w-4 h-4 text-muted-foreground/30 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium', isDone && 'line-through')}>{task?.title}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-muted-foreground">{tp?.label ?? task?.type}</span>
            {task?.dueDate && (
              <span className={cn('text-xs', isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                • {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
          style={{ backgroundColor: `${pr?.color ?? '#FF9149'}20`, color: pr?.color ?? '#FF9149' }}>
          {pr?.label ?? task?.priority}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center shadow-sm">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight">
              <HintTooltip text={t('hints.tasks')} position="bottom">{t('tasks.title')}</HintTooltip>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t('tasks.subtitle')}</p>
          </div>
        </div>
        <button onClick={() => { setEditTask(null); setDialogOpen(true); }}
          className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm active:scale-95">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('tasks.addTask')}</span>
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-muted/50 dark:bg-muted/30 p-1 rounded-xl">
          {['', 'pending', 'completed'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
                statusFilter === s ? 'bg-card dark:bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              {s === '' ? t('common.all') : s === 'pending' ? t('common.active') : t('common.done')}
            </button>
          ))}
        </div>
        <div className="ml-auto flex bg-card rounded-xl border border-border/60 dark:border-border/40 p-0.5">
          <button onClick={() => setViewMode('list')}
            className={cn('p-2 rounded-lg transition-all', viewMode === 'list' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('board')}
            className={cn('p-2 rounded-lg transition-all', viewMode === 'board' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 bg-card rounded-xl animate-pulse" />)}</div>
      ) : (tasks?.length ?? 0) === 0 ? (
        <EmptyState icon={ListTodo} title={t('tasks.noTasks')} description={t('empty.tasksHint')}
          actionLabel={t('tasks.addTask')} onAction={() => { setEditTask(null); setDialogOpen(true); }} />
      ) : viewMode === 'board' ? (
        /* ─── Board view ─── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { status: 'pending', label: t('common.active'), tasks: pendingTasks, color: 'bg-blue-500' },
            { status: 'completed', label: t('common.done'), tasks: completedTasks, color: 'bg-emerald-500' },
          ].map(col => (
            <div key={col.status}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col.status)}
              className={cn('rounded-xl border-2 border-dashed p-3 min-h-[200px] transition',
                dragId ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/10')}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={cn('w-2 h-2 rounded-full', col.color)} />
                <span className="text-sm font-semibold">{col.label}</span>
                <span className="text-xs text-muted-foreground ml-auto">{col.tasks.length}</span>
              </div>
              <div className="space-y-2">
                {col.tasks.map(task => renderTaskCard(task))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ─── Grouped list view ─── */
        <div className="space-y-6">
          {groupTasks(tasks).map(group => {
            const Icon = group.icon;
            return (
              <div key={group.key}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Icon className={cn('w-4 h-4', group.color)} />
                  <span className="text-sm font-semibold">{group.label}</span>
                  <span className="text-xs text-muted-foreground">({group.tasks.length})</span>
                  <div className="flex-1 border-t border-border/40 ml-2" />
                </div>
                <div className="space-y-2">
                  {group.tasks.map((task: any) => {
                    const pr = PRIORITIES.find((p: any) => p.value === task?.priority);
                    const tp = TASK_TYPES.find((tt: any) => tt.value === task?.type);
                    const isDone = task?.status === 'completed';
                    const isOverdue = !isDone && task?.dueDate && new Date(task.dueDate) < new Date();
                    return (
                      <div key={task?.id} className={cn('bg-card rounded-2xl border border-border/60 dark:border-border/40 p-4 flex items-center gap-4 transition hover:shadow-md cursor-pointer', isDone && 'opacity-60')}
                        onClick={() => { setEditTask(task); setDialogOpen(true); }}>
                        <button onClick={(e) => { e.stopPropagation(); toggleComplete(task); }}
                          className={cn('w-6 h-6 rounded-lg border-2 flex items-center justify-center transition flex-shrink-0',
                            isDone ? 'bg-primary border-primary text-white' : 'border-border hover:border-primary')}>
                          {isDone && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm font-medium', isDone && 'line-through')}>{task?.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{tp?.label ?? task?.type}</span>
                            {task?.lead && <span className="text-xs text-muted-foreground">• {task.lead.firstName}</span>}
                            {task?.dueDate && (
                              <span className={cn('text-xs', isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                                • {formatDate(task.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium flex-shrink-0" style={{ backgroundColor: `${pr?.color ?? '#FF9149'}20`, color: pr?.color ?? '#FF9149' }}>
                          {pr?.label ?? task?.priority}
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); setEditTask(task); setDialogOpen(true); }}
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground text-xs">{t('common.edit')}</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(task?.id); }}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive text-xs">×</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {dialogOpen && <TaskDialog task={editTask} onSave={handleSave} onClose={() => { setDialogOpen(false); setEditTask(null); }} />}
    </div>
  );
}
