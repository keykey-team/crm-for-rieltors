export type TaskStatus = 'pending' | 'completed' | string;

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  type?: string | null;
  priority?: string | null;
  status: TaskStatus;
  dueDate?: string | null;
  lead?: { id: string; firstName?: string | null } | null;
}

export interface TaskUpsertInput {
  title: string;
  description?: string;
  type?: string;
  priority?: string;
  dueDate?: string;
  status?: TaskStatus;
}

export interface TasksQuery {
  status?: string;
}
