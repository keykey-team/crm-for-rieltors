import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { confirmAction } from '@/shared/lib/confirm-action';
import type { Task, TaskUpsertInput } from '@/entities/task';
import { createTask, deleteTask, getTasks, updateTask } from '@/entities/task';
import { groupTasksByDeadline } from './group-tasks';

export function useTasksPage(t: (k: string) => string) {
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setEditTask(null);
      setDialogOpen(true);
    }
  }, [searchParams]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const list = await getTasks({ status: statusFilter || undefined });
    list.sort((a: Task, b: Task) => {
      const aDone = a.status === 'completed' ? 1 : 0;
      const bDone = b.status === 'completed' ? 1 : 0;
      return aDone - bDone;
    });
    setTasks(list);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSave = useCallback(async (data: TaskUpsertInput) => {
    if (editTask) await updateTask(editTask.id, data);
    else await createTask(data);

    setDialogOpen(false);
    setEditTask(null);
    fetchTasks();
  }, [editTask, fetchTasks]);

  const toggleComplete = useCallback(async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask(task.id, { status: newStatus });
    fetchTasks();
  }, [fetchTasks]);

  const handleDelete = useCallback(async (id: string) => {
    const ok = await confirmAction(t('tasks.deleteTask'), { confirm: t('common.delete'), cancel: t('common.cancel') });
    if (!ok) return;

    await deleteTask(id);
    fetchTasks();
  }, [fetchTasks, t]);

  const handleDrop = useCallback(async (status: string) => {
    if (!dragId) return;
    const task = tasks.find((item) => item.id === dragId);
    if (!task || task.status === status) {
      setDragId(null);
      return;
    }
    await updateTask(dragId, { status });
    setDragId(null);
    fetchTasks();
  }, [dragId, fetchTasks, tasks]);

  const pendingTasks = useMemo(() => tasks.filter((task) => task.status === 'pending'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((task) => task.status === 'completed'), [tasks]);
  const groupedTasks = useMemo(() => groupTasksByDeadline(tasks, t), [tasks, t]);

  return {
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
  };
}
