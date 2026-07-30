/**
 * CRM Section permissions.
 * Each section maps to a sidebar href path segment.
 * null permissions = all access (default for admin/director & legacy users).
 */

export const CRM_SECTIONS = [
  { key: 'dashboard', labelKey: 'nav.dashboard' },
  { key: 'deals', labelKey: 'nav.deals' },
  { key: 'leads', labelKey: 'nav.leads' },
  { key: 'properties', labelKey: 'nav.properties' },
  { key: 'tasks', labelKey: 'nav.tasks' },
  { key: 'calendar', labelKey: 'nav.calendar' },
  { key: 'showings', labelKey: 'nav.showings' },
  { key: 'chat', labelKey: 'nav.chat' },
  { key: 'analytics', labelKey: 'nav.analytics' },
  { key: 'automations', labelKey: 'nav.automations' },
  { key: 'templates', labelKey: 'nav.templates' },
  { key: 'knowledge-base', labelKey: 'nav.knowledgeBase' },
  { key: 'activity-log', labelKey: 'nav.activityLog' },
] as const;

export type SectionKey = (typeof CRM_SECTIONS)[number]['key'];

/** All section keys */
export const ALL_SECTION_KEYS: SectionKey[] = CRM_SECTIONS.map(s => s.key);

/**
 * Parse stored permissions string to array.
 * Returns null if user has full access (admin/director or no restrictions set).
 */
export function parsePermissions(raw: string | null | undefined): SectionKey[] | null {
  if (!raw) return null; // null = full access
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return null;
    return arr.filter((k: string) => ALL_SECTION_KEYS.includes(k as SectionKey)) as SectionKey[];
  } catch {
    return null;
  }
}

/**
 * Check if user has access to a specific section.
 * Admin/director always have full access.
 * Agents with null permissions also have full access (backwards compatibility).
 */
export function hasPermission(
  role: string,
  permissionsRaw: string | null | undefined,
  sectionKey: string
): boolean {
  // Admin and director always have full access
  if (role === 'admin' || role === 'director') return true;
  // settings, capabilities, pricing — always accessible
  if (['settings', 'capabilities', 'pricing'].includes(sectionKey)) return true;
  const perms = parsePermissions(permissionsRaw);
  if (!perms) return true; // null = full access (legacy / not restricted)
  return perms.includes(sectionKey as SectionKey);
}

/**
 * Extract section key from a URL path.
 * e.g. /deals/123 -> 'deals', /knowledge-base -> 'knowledge-base'
 */
export function sectionFromPath(path: string): string {
  const clean = path.replace(/^\//, '');
  // Handle multi-segment keys like 'knowledge-base' and 'activity-log'
  if (clean.startsWith('knowledge-base')) return 'knowledge-base';
  if (clean.startsWith('activity-log')) return 'activity-log';
  return clean.split('/')[0] || 'dashboard';
}
