'use client';
import { Plus, CheckSquare, Check, ListTodo, List, LayoutGrid, GripVertical } from 'lucide-react';
import { EmptyState } from '@/shared/ui/empty-state';
import { CreateTaskDialog } from '@/features/create-task';
import { PRIORITIES, TASK_TYPES } from '@/shared/lib/constants';
import { formatDate } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from '@/shared/lib/i18n/context';
import { HintTooltip } from '@/shared/ui/hint-tooltip';
import { useTasksPage } from '@/widgets/tasks/model/use-tasks-page';

export function TasksClient() {
  const { t } = useTranslation();
  const {
    tasks,
    loading,
    statusFilter,
    setStatusFilter,
    dialogOpen,
    setDialogOpen,
    editTask,
    setEditTask,
    viewMode,
    setViewMode,
    dragId,
    setDragId,
    pendingTasks,
    completedTasks,
    groupedTasks,
    handleSave,
    toggleComplete,
    handleDelete,
    handleDrop,
  } = useTasksPage(t);

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
          {groupedTasks.map(group => {
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
      {dialogOpen && <CreateTaskDialog task={editTask} onSave={handleSave} onClose={() => { setDialogOpen(false); setEditTask(null); }} />}
    </div>
  );
}
