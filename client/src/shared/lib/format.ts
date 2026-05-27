const LOCALE_MAP: Record<string, string> = { uk: 'uk-UA', en: 'en-US', ru: 'ru-RU' };

function getIntlLocale(locale?: string): string {
  return LOCALE_MAP[locale ?? 'uk'] ?? 'uk-UA';
}

export function formatPrice(price: number | null | undefined, currency = 'USD', locale?: string): string {
  if (price == null) return '—';
  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string | Date | null | undefined, locale?: string): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString(getIntlLocale(locale), {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function formatDateTime(date: string | Date | null | undefined, locale?: string): string {
  if (!date) return '—';
  return new Date(date).toLocaleString(getIntlLocale(locale), {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  return name.split(' ').map((n: string) => n?.[0] ?? '').join('').toUpperCase().slice(0, 2);
}
