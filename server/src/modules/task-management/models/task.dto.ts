export interface TaskQuery {
  status?: string;
  type?: string;
  priority?: string;
  userId?: string;
  role?: string;
}

export interface TaskInput {
  dueDate?: unknown;
  assignedToId?: unknown;
  [key: string]: unknown;
}

