export async function deleteLead(id: string) {
  const response = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Delete failed');
}
