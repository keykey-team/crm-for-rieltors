export async function deleteDeal(id: string) {
  const response = await fetch(`/api/deals/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Delete failed');
}
