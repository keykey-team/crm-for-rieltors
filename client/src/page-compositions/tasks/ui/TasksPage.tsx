'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, CheckSquare, Check } from 'lucide-react';
import { TaskDialog } from '@/features/task-create';
import { taskApi } from '@/entities/task';
import { PRIORITIES, TASK_TYPES } from '@/shared/lib/constants';
import { formatDate } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from '@/shared/lib/i18n/context';

export function TasksPage() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);

    try {
      const data = await taskApi.getTasks(params.toString());
      setTasks(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSave = async (data: any) => {
    if (editTask) {
      await taskApi.updateTask(editTask.id, data);
    } else {
      await taskApi.createTask(data);
    }
    setDialogOpen(false); setEditTask(null); fetchTasks();
  };

  const toggleComplete = async (task: any) => {
    const newStatus = task?.status === 'completed' ? 'pending' : 'completed';
    await taskApi.updateTask(task?.id, { status: newStatus });
    fetchTasks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('tasks.deleteTask'))) return;
    await taskApi.deleteTask(id);
    fetchTasks();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-primary" /> {t('tasks.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('tasks.subtitle')}</p>
        </div>
        <button onClick={() => { setEditTask(null); setDialogOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> {t('tasks.addTask')}
        </button>
      </div>
      <div className="flex gap-2">
        {['', 'pending', 'completed'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn('px-4 py-2 rounded-xl text-sm font-medium transition',
              statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-white border border-border hover:bg-muted')}>
            {s === '' ? t('common.all') : s === 'pending' ? t('common.active') : t('common.done')}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />)}</div>
      ) : (tasks?.length ?? 0) === 0 ? (
        <div className="text-center py-12 text-muted-foreground">{t('tasks.noTasks')}</div>
      ) : (
        <div className="space-y-2">
          {(tasks ?? []).map((task: any) => {
            const pr = PRIORITIES.find((p: any) => p.value === task?.priority);
            const tp = TASK_TYPES.find((tt: any) => tt.value === task?.type);
            const isDone = task?.status === 'completed';
            const isOverdue = !isDone && task?.dueDate && new Date(task.dueDate) < new Date();
            return (
              <div key={task?.id} className={cn('bg-white rounded-xl p-4 flex items-center gap-4 transition hover:scale-[1.002]', isDone && 'opacity-60')}
                style={{ boxShadow: 'var(--shadow-sm)' }}>
                <button onClick={() => toggleComplete(task)}
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
                <button onClick={() => { setEditTask(task); setDialogOpen(true); }}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground text-xs">{t('common.edit')}</button>
                <button onClick={() => handleDelete(task?.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive text-xs">×</button>
              </div>
            );
          })}
        </div>
      )}
      {dialogOpen && <TaskDialog task={editTask} onSave={handleSave} onClose={() => { setDialogOpen(false); setEditTask(null); }} />}
    </div>
  );
}
