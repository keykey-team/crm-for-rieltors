import { taskApi } from '@/entities/task';

export async function deleteTask(id: string) {
  await taskApi.deleteTask(id);
}
