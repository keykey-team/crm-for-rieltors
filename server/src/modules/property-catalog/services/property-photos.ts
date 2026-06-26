type PropertyPhotoRecord = {
  id?: string;
  cloudStoragePath: string;
  isPublic: boolean;
  order: number;
  createdAt?: Date;
};

type PropertyDocumentRecord = {
  id?: string;
  title: string;
  documentType?: string | null;
  cloudStoragePath: string;
  createdAt?: Date;
};

type PropertyMediaLinkRecord = {
  id?: string;
  title: string;
  mediaType?: string | null;
  url: string;
  createdAt?: Date;
};

type PropertyPublicationRecord = {
  id?: string;
  channel: string;
  status: string;
  url?: string | null;
  note?: string | null;
  publishedAt?: Date | null;
  lastSyncedAt?: Date | null;
  createdAt?: Date;
};

type PropertyWithAssets = {
  photos?: PropertyPhotoRecord[] | null;
  documents?: PropertyDocumentRecord[] | null;
  mediaLinks?: PropertyMediaLinkRecord[] | null;
  publications?: PropertyPublicationRecord[] | null;
};

export function normalizePropertyPhotos(value: unknown) {
  if (!Array.isArray(value)) return undefined;

  return value
    .map((photo) => (photo && typeof photo === 'object' ? (photo as Record<string, unknown>) : null))
    .map((photo) => {
      const cloudStoragePath = typeof photo?.cloudStoragePath === 'string' ? photo.cloudStoragePath.trim() : '';
      if (!cloudStoragePath) return null;
      return {
        cloudStoragePath,
        isPublic: photo?.isPublic !== false,
      };
    })
    .filter((photo): photo is { cloudStoragePath: string; isPublic: boolean } => photo !== null)
    .map((photo, index) => ({ ...photo, order: index }));
}

export function buildCreatePhotosRelation(value: unknown) {
  const photos = normalizePropertyPhotos(value);
  return photos?.length ? { create: photos } : undefined;
}

export function buildUpdatePhotosRelation(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const photos = normalizePropertyPhotos(value) ?? [];
  return {
    deleteMany: {},
    ...(photos.length ? { create: photos } : {}),
  };
}

export function normalizePropertyDocuments(value: unknown) {
  if (!Array.isArray(value)) return undefined;

  return value
    .map((document) => (document && typeof document === 'object' ? (document as Record<string, unknown>) : null))
    .map((document) => {
      const cloudStoragePath = typeof document?.cloudStoragePath === 'string' ? document.cloudStoragePath.trim() : '';
      const title = typeof document?.title === 'string' ? document.title.trim() : '';
      const documentType = typeof document?.documentType === 'string' ? document.documentType.trim() : '';
      if (!cloudStoragePath || !title) return null;
      return {
        cloudStoragePath,
        title,
        ...(documentType ? { documentType } : {}),
      };
    })
    .filter((document): document is { cloudStoragePath: string; title: string; documentType?: string } => document !== null);
}

export function buildCreateDocumentsRelation(value: unknown) {
  const documents = normalizePropertyDocuments(value);
  return documents?.length ? { create: documents } : undefined;
}

export function buildUpdateDocumentsRelation(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const documents = normalizePropertyDocuments(value) ?? [];
  return {
    deleteMany: {},
    ...(documents.length ? { create: documents } : {}),
  };
}

export function normalizePropertyMediaLinks(value: unknown) {
  if (!Array.isArray(value)) return undefined;

  return value
    .map((media) => (media && typeof media === 'object' ? (media as Record<string, unknown>) : null))
    .map((media) => {
      const title = typeof media?.title === 'string' ? media.title.trim() : '';
      const url = typeof media?.url === 'string' ? media.url.trim() : '';
      const mediaType = typeof media?.mediaType === 'string' ? media.mediaType.trim() : '';
      if (!title || !url) return null;
      return {
        title,
        url,
        ...(mediaType ? { mediaType } : {}),
      };
    })
    .filter((media): media is { title: string; url: string; mediaType?: string } => media !== null);
}

export function buildCreateMediaLinksRelation(value: unknown) {
  const mediaLinks = normalizePropertyMediaLinks(value);
  return mediaLinks?.length ? { create: mediaLinks } : undefined;
}

export function buildUpdateMediaLinksRelation(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const mediaLinks = normalizePropertyMediaLinks(value) ?? [];
  return {
    deleteMany: {},
    ...(mediaLinks.length ? { create: mediaLinks } : {}),
  };
}

function parseOptionalDate(value: unknown) {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function normalizePropertyPublications(value: unknown) {
  if (!Array.isArray(value)) return undefined;

  return value
    .map((publication) => (publication && typeof publication === 'object' ? (publication as Record<string, unknown>) : null))
    .map((publication) => {
      const channel = typeof publication?.channel === 'string' ? publication.channel.trim() : '';
      const status = typeof publication?.status === 'string' ? publication.status.trim() : '';
      const url = typeof publication?.url === 'string' ? publication.url.trim() : '';
      const note = typeof publication?.note === 'string' ? publication.note.trim() : '';
      const publishedAt = parseOptionalDate(publication?.publishedAt);
      const lastSyncedAt = parseOptionalDate(publication?.lastSyncedAt);
      if (!channel || !status) return null;
      return {
        channel,
        status,
        ...(url ? { url } : {}),
        ...(note ? { note } : {}),
        ...(publishedAt ? { publishedAt } : {}),
        ...(lastSyncedAt ? { lastSyncedAt } : {}),
      };
    })
    .filter((publication): publication is { channel: string; status: string; url?: string; note?: string; publishedAt?: Date; lastSyncedAt?: Date } => publication !== null);
}

export function buildCreatePublicationsRelation(value: unknown) {
  const publications = normalizePropertyPublications(value);
  return publications?.length ? { create: publications } : undefined;
}

export function buildUpdatePublicationsRelation(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const publications = normalizePropertyPublications(value) ?? [];
  return {
    deleteMany: {},
    ...(publications.length ? { create: publications } : {}),
  };
}

export async function withResolvedPhotoUrls<T extends Record<string, unknown>>(property: T) {
  const { getFileUrl } = await import('../../../common/infrastructure/storage/s3');
  const source = property as T & PropertyWithAssets;
  const photos = await Promise.all(
    (source.photos ?? []).map(async (photo) => ({
      ...photo,
      url: await getFileUrl(photo.cloudStoragePath, photo.isPublic),
    })),
  );
  const documents = await Promise.all(
    (source.documents ?? []).map(async (document) => ({
      ...document,
      url: await getFileUrl(document.cloudStoragePath, false),
    })),
  );
  const mediaLinks = (source.mediaLinks ?? []).map((media) => ({ ...media }));
  const publications = (source.publications ?? []).map((publication) => ({ ...publication }));
  return { ...property, photos, documents, mediaLinks, publications };
}

export async function withResolvedPhotoUrlsList<T extends Record<string, unknown>>(properties: T[]) {
  return Promise.all(properties.map((property) => withResolvedPhotoUrls(property)));
}