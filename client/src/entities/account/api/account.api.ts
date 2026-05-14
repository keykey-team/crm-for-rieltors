export async function updateUserPlan(plan: 'free' | 'pro' | 'business'): Promise<void> {
  const res = await fetch('/api/users/plan', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }),
  });
  if (!res.ok) throw new Error('Failed to update plan');
}
