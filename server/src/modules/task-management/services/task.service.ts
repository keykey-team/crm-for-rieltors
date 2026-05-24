import { badRequest } from '../../../common/shared-kernel/errors';
import { isAdminRole } from '../../../common/shared-kernel/roles';
import { TaskInput, TaskQuery } from '../models/task.dto';
import { createTask, deleteTask, findTasks, updateTask } from '../repositories/task.repository';

function normalizeDueDate(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === '' || value === null) return null;

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) throw badRequest('Invalid dueDate format');
  return parsed.toISOString();
}

function ownershipFilter(role?: string, userId?: string) {
  return isAdminRole(role) ? {} : { assignedToId: userId };
}

export async function listTasks(query: TaskQuery) {
  const where: Record<string, unknown> = ownershipFilter(query.role, query.userId);
  if (query.status) where.status = query.status;
  if (query.type) where.type = query.type;
  if (query.priority) where.priority = query.priority;
  return findTasks(where);
}

export async function addTask(userId: string, input: TaskInput) {
  const dueDate = normalizeDueDate(input.dueDate);
  return createTask({
    ...input,
    ...(dueDate !== undefined ? { dueDate } : {}),
    assignedToId: input.assignedToId ?? userId ?? null,
  });
}

export async function changeTask(id: string, input: TaskInput) {
  const dueDate = normalizeDueDate(input.dueDate);
  return updateTask(id, {
    ...input,
    ...(dueDate !== undefined ? { dueDate } : {}),
  });
}

export async function removeTask(id: string) {
  await deleteTask(id);
  return { success: true };
}

