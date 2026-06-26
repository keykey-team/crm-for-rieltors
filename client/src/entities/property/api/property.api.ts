import type {
  Property,
  PropertyPhotoInput,
  PropertyProfile,
  PropertyUpsertInput,
  PropertiesQuery,
} from '../model/types';
import {
  normalizeDocuments,
  normalizeMediaLinks,
  normalizePublications,
} from '../lib/normalize';

function normalizeText(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return value;
  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function normalizeNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  const normalized = value.trim();
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizePhotos(value: PropertyUpsertInput['photos']): PropertyPhotoInput[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((photo): photo is PropertyPhotoInput => Boolean(photo?.cloudStoragePath))
    .map((photo) => ({
      cloudStoragePath: photo.cloudStoragePath.trim(),
      isPublic: photo.isPublic !== false,
    }))
    .filter((photo) => photo.cloudStoragePath.length > 0);
}

function normalizeStringArray(value: string[] | undefined): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function normalizePropertyPayload(payload: Partial<PropertyUpsertInput>): Partial<PropertyUpsertInput> {
  return {
    title: normalizeText(payload.title),
    internalCode: normalizeText(payload.internalCode),
    type: normalizeText(payload.type),
    source: normalizeText(payload.source),
    ownerName: normalizeText(payload.ownerName),
    ownerPhone: normalizeText(payload.ownerPhone),
    developerName: normalizeText(payload.developerName),
    developerContact: normalizeText(payload.developerContact),
    status: normalizeText(payload.status),
    dealTypes: Array.isArray(payload.dealTypes)
      ? payload.dealTypes.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      : undefined,
    address: normalizeText(payload.address),
    district: normalizeText(payload.district),
    city: normalizeText(payload.city),
    rooms: normalizeNumber(payload.rooms),
    bedrooms: normalizeNumber(payload.bedrooms),
    bathrooms: normalizeNumber(payload.bathrooms),
    area: normalizeNumber(payload.area),
    landArea: normalizeNumber(payload.landArea),
    floor: normalizeNumber(payload.floor),
    totalFloors: normalizeNumber(payload.totalFloors),
    price: normalizeNumber(payload.price),
    currency: normalizeText(payload.currency),
    paymentCondition: normalizeText(payload.paymentCondition),
    communicationTypes: normalizeStringArray(payload.communicationTypes),
    tags: normalizeStringArray(payload.tags),
    isPublished: typeof payload.isPublished === 'boolean' ? payload.isPublished : undefined,
    isFeatured: typeof payload.isFeatured === 'boolean' ? payload.isFeatured : undefined,
    publicationNotes: normalizeText(payload.publicationNotes),
    publications: normalizePublications(payload.publications),
    layoutType: normalizeText(payload.layoutType),
    repairType: normalizeText(payload.repairType),
    heatingType: normalizeText(payload.heatingType),
    wallType: normalizeText(payload.wallType),
    realEstateClass: normalizeText(payload.realEstateClass),
    commercialPurpose: normalizeText(payload.commercialPurpose),
    parkingType: normalizeText(payload.parkingType),
    parkingSpaces: normalizeNumber(payload.parkingSpaces),
    yearBuilt: normalizeNumber(payload.yearBuilt),
    ceilingHeight: normalizeNumber(payload.ceilingHeight),
    managerComment: normalizeText(payload.managerComment),
    internalDescription: normalizeText(payload.internalDescription),
    publicDescription: normalizeText(payload.publicDescription),
    description: normalizeText(payload.description),
    documents: normalizeDocuments(payload.documents),
    mediaLinks: normalizeMediaLinks(payload.mediaLinks),
    photos: normalizePhotos(payload.photos),
    priceHistoryReason: normalizeText(payload.priceHistoryReason),
    priceHistoryNote: normalizeText(payload.priceHistoryNote),
  };
}

async function parseJson<T>(res: Response): Promise<T> {
  const raw = await res.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }
  if (!res.ok) {
    const fieldMessage =
      data && typeof data === 'object' && data.fields && typeof data.fields === 'object'
        ? Object.values(data.fields).find((value): value is string => typeof value === 'string' && value.length > 0)
        : undefined;
    const serverMessage =
      typeof data === 'string'
        ? data
        : data && typeof data === 'object'
          ? (data.error || data.message)
          : undefined;
    throw new Error(fieldMessage || serverMessage || 'Request failed');
  }
  return data as T;
}

export async function getProperties(query: PropertiesQuery = {}): Promise<Property[]> {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.type) params.set('type', query.type);
  if (query.status) params.set('status', query.status);
  if (query.dealType) params.set('dealType', query.dealType);
  if (query.publicationChannel) params.set('publicationChannel', query.publicationChannel);
  if (query.publicationStatus) params.set('publicationStatus', query.publicationStatus);
  const suffix = params.toString();
  const res = await fetch(`/api/properties${suffix ? `?${suffix}` : ''}`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as Property[]) : [];
}

export async function createProperty(payload: PropertyUpsertInput): Promise<Property> {
  const res = await fetch('/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalizePropertyPayload(payload)),
  });
  return parseJson<Property>(res);
}

export async function updateProperty(id: string, payload: Partial<PropertyUpsertInput>): Promise<Property> {
  const res = await fetch(`/api/properties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalizePropertyPayload(payload)),
  });
  return parseJson<Property>(res);
}

export async function deleteProperty(id: string): Promise<void> {
  const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete property');
}

export async function getPropertyProfile(id: string): Promise<PropertyProfile> {
  const res = await fetch(`/api/properties/${id}/profile`);
  return parseJson<PropertyProfile>(res);
}
