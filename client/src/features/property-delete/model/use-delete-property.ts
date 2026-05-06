export async function deletePropertie(id: string) {
  const response = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Delete failed');
}
