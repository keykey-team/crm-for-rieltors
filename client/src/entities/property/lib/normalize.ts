import type {
  PropertyDocumentInput,
  PropertyMediaLinkInput,
  PropertyPublicationInput,
} from '../model/types';

function normalizeText(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function normalizeDateTime(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export function normalizeDocuments(
  value: PropertyDocumentInput[] | undefined,
): PropertyDocumentInput[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((d): d is PropertyDocumentInput => Boolean(d?.cloudStoragePath && d?.title))
    .map((d) => ({
      title: d.title.trim(),
      cloudStoragePath: d.cloudStoragePath.trim(),
      documentType: normalizeText(d.documentType),
    }))
    .filter((d) => d.cloudStoragePath.length > 0 && d.title.length > 0);
}

export function normalizeMediaLinks(
  value: PropertyMediaLinkInput[] | undefined,
): PropertyMediaLinkInput[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((m): m is PropertyMediaLinkInput => Boolean(m?.title && m?.url))
    .map((m) => ({
      title: m.title.trim(),
      mediaType: normalizeText(m.mediaType),
      url: m.url.trim(),
    }))
    .filter((m) => m.title.length > 0 && m.url.length > 0);
}

export function normalizePublications(
  value: PropertyPublicationInput[] | undefined,
): PropertyPublicationInput[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((p): p is PropertyPublicationInput => Boolean(p?.channel && p?.status))
    .map((p) => ({
      channel: p.channel.trim(),
      status: p.status.trim(),
      url: normalizeText(p.url),
      note: normalizeText(p.note),
      publishedAt: normalizeDateTime(p.publishedAt),
      lastSyncedAt: normalizeDateTime(p.lastSyncedAt),
    }))
    .filter((p) => p.channel.length > 0 && p.status.length > 0);
}
