export function getPublicUrl(slug: string) {
  if (typeof window === 'undefined') return `/s/${slug}`;
  return `${window.location.origin}/s/${slug}`;
}
