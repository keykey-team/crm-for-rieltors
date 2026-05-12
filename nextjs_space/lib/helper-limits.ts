// Helper message limits per plan (per calendar month)
export const HELPER_LIMITS: Record<string, number> = {
  free: 20,
  pro: 200,
  business: 1000,
};

export function getHelperLimit(plan: string): number {
  return HELPER_LIMITS[plan] ?? HELPER_LIMITS.free;
}

export function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
