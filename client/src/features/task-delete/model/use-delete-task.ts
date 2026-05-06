export async function deleteTask(id: string) {
  const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Delete failed');
}
