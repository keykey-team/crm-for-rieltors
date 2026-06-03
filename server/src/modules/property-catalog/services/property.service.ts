import { badRequest, forbidden } from '../../../common/shared-kernel/errors';
import { isAdminRole } from '../../../common/shared-kernel/roles';
import { PropertyPayload, PropertyQuery } from '../models/property.dto';
import {
  addPropertyPriceHistoryPoint,
  createPropertyWithInitialPrice,
  createPropertyUnit,
  deleteProperty,
  deletePropertyUnit,
  findPropertyActivity,
  findPropertyProfileMetrics,
  findPropertyProfile,
  findPropertyPriceHistory,
  findPropertyPriceStats,
  findProperties,
  findPropertyUnits,
  updatePropertyWithPriceHistory,
  updatePropertyUnit,
} from '../repositories/property.repository';
import {
  buildCreateDocumentsRelation,
  buildCreateMediaLinksRelation,
  buildCreatePhotosRelation,
  buildCreatePublicationsRelation,
  buildUpdateDocumentsRelation,
  buildUpdateMediaLinksRelation,
  buildUpdatePhotosRelation,
  buildUpdatePublicationsRelation,
  withResolvedPhotoUrls,
  withResolvedPhotoUrlsList,
} from './property-photos';

function getRequiredId(value: unknown, field = 'id'): string {
  const id = String(value ?? '').trim();
  if (!id) throw badRequest(`${field} required`);
  return id;
}

function parseNullableInt(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : undefined;
}

function parseNullableFloat(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  return undefined;
}

function normalizePropertyPayload(input: PropertyPayload) {
  const { priceHistoryReason, priceHistoryNote, photos, documents, mediaLinks, publications, ...rest } = input;
  void priceHistoryReason;
  void priceHistoryNote;
  const dealTypes = Array.isArray(input.dealTypes)
    ? input.dealTypes.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : undefined;

  return {
    ...rest,
    ownerName: input.ownerName === '' ? null : input.ownerName,
    ownerPhone: input.ownerPhone === '' ? null : input.ownerPhone,
    developerName: input.developerName === '' ? null : input.developerName,
    developerContact: input.developerContact === '' ? null : input.developerContact,
    rooms: parseNullableInt(input.rooms),
    bedrooms: parseNullableInt(input.bedrooms),
    bathrooms: parseNullableInt(input.bathrooms),
    area: parseNullableFloat(input.area),
    landArea: parseNullableFloat(input.landArea),
    floor: parseNullableInt(input.floor),
    totalFloors: parseNullableInt(input.totalFloors),
    price: parseNullableFloat(input.price),
    dealTypes,
    paymentCondition: input.paymentCondition === '' ? null : input.paymentCondition,
    communicationTypes: normalizeStringArray(input.communicationTypes),
    tags: normalizeStringArray(input.tags),
    isPublished: parseBoolean(input.isPublished),
    isFeatured: parseBoolean(input.isFeatured),
    publicationNotes: input.publicationNotes === '' ? null : input.publicationNotes,
    internalCode: input.internalCode === '' ? null : input.internalCode,
    source: input.source === '' ? null : input.source,
    district: input.district === '' ? null : input.district,
    city: input.city === '' ? null : input.city,
    layoutType: input.layoutType === '' ? null : input.layoutType,
    repairType: input.repairType === '' ? null : input.repairType,
    heatingType: input.heatingType === '' ? null : input.heatingType,
    wallType: input.wallType === '' ? null : input.wallType,
    realEstateClass: input.realEstateClass === '' ? null : input.realEstateClass,
    commercialPurpose: input.commercialPurpose === '' ? null : input.commercialPurpose,
    parkingType: input.parkingType === '' ? null : input.parkingType,
    parkingSpaces: parseNullableInt(input.parkingSpaces),
    yearBuilt: parseNullableInt(input.yearBuilt),
    ceilingHeight: parseNullableFloat(input.ceilingHeight),
    managerComment: input.managerComment === '' ? null : input.managerComment,
    internalDescription: input.internalDescription === '' ? null : input.internalDescription,
    publicDescription: input.publicDescription === '' ? null : input.publicDescription,
    description: input.description === '' ? null : input.description,
    mediaLinks,
    publications,
    documents,
    photos,
  };
}

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function normalizeDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function listProperties(query: PropertyQuery) {
  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status;
  if (query.type) where.type = query.type;
  if (query.dealType) where.dealTypes = { has: query.dealType };
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { address: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  return withResolvedPhotoUrlsList(await findProperties(where));
}

export async function addProperty(input: PropertyPayload, userId?: string) {
  const payload = normalizePropertyPayload(input);
  if (payload.price === undefined || payload.price === null) throw badRequest('price is required');
  const reason = normalizeText(input.priceHistoryReason) ?? 'manual';
  const note = normalizeText(input.priceHistoryNote);
  const { photos, documents, mediaLinks, publications, ...rest } = payload;
  const photoRelation = buildCreatePhotosRelation(photos);
  const documentRelation = buildCreateDocumentsRelation(documents);
  const mediaLinksRelation = buildCreateMediaLinksRelation(mediaLinks);
  const publicationsRelation = buildCreatePublicationsRelation(publications);
  return withResolvedPhotoUrls(
    await createPropertyWithInitialPrice(
      {
        ...rest,
        ...(publicationsRelation ? { publications: publicationsRelation } : {}),
        ...(mediaLinksRelation ? { mediaLinks: mediaLinksRelation } : {}),
        ...(documentRelation ? { documents: documentRelation } : {}),
        ...(photoRelation ? { photos: photoRelation } : {}),
      },
      userId,
      reason,
      note,
    ),
  );
}

export async function changeProperty(id: string, input: PropertyPayload, userId?: string) {
  const payload = normalizePropertyPayload(input);
  const reason = normalizeText(input.priceHistoryReason) ?? 'manual';
  const note = normalizeText(input.priceHistoryNote);
  const { photos, documents, mediaLinks, publications, ...rest } = payload;
  const photoRelation = buildUpdatePhotosRelation(photos);
  const documentRelation = buildUpdateDocumentsRelation(documents);
  const mediaLinksRelation = buildUpdateMediaLinksRelation(mediaLinks);
  const publicationsRelation = buildUpdatePublicationsRelation(publications);
  return withResolvedPhotoUrls(
    await updatePropertyWithPriceHistory(
      id,
      {
        ...rest,
        ...(publicationsRelation ? { publications: publicationsRelation } : {}),
        ...(mediaLinksRelation ? { mediaLinks: mediaLinksRelation } : {}),
        ...(documentRelation ? { documents: documentRelation } : {}),
        ...(photoRelation ? { photos: photoRelation } : {}),
      },
      userId,
      reason,
      note,
    ),
  );
}

export async function removeProperty(id: string) {
  await deleteProperty(id);
  return { success: true };
}

export async function listPropertyUnits(propertyIdInput: unknown) {
  return findPropertyUnits(getRequiredId(propertyIdInput, 'propertyId'));
}

export async function addPropertyUnit(input: Record<string, unknown>) {
  return createPropertyUnit(input);
}

export async function changePropertyUnit(input: Record<string, unknown>) {
  const id = getRequiredId(input.id);
  const { id: _id, ...data } = input;
  return updatePropertyUnit(id, data);
}

export async function removePropertyUnit(idInput: unknown) {
  await deletePropertyUnit(getRequiredId(idInput));
  return { ok: true };
}

export async function listPropertyPriceHistory(
  propertyIdInput: unknown,
  query: { page?: unknown; limit?: unknown; from?: unknown; to?: unknown },
) {
  const propertyId = getRequiredId(propertyIdInput, 'propertyId');
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const from = normalizeDate(query.from);
  const to = normalizeDate(query.to);
  const { items, total } = await findPropertyPriceHistory(propertyId, (page - 1) * limit, limit, from, to);
  return { items, total, page, limit };
}

export async function createPropertyPriceHistoryPoint(
  propertyIdInput: unknown,
  input: Record<string, unknown>,
  userId?: string,
  role?: string,
  agencyId?: string,
) {
  if (!isAdminRole(role)) throw forbidden();
  const propertyId = getRequiredId(propertyIdInput, 'propertyId');
  const price = parseNullableFloat(input.price);
  if (price === undefined || price === null) throw badRequest('price is required');
  const stats = await findPropertyPriceStats(propertyId);
  if (!stats) throw badRequest('Not found');
  return addPropertyPriceHistoryPoint({
    propertyId,
    agencyId: agencyId ?? stats.agencyId,
    price,
    currency: normalizeText(input.currency) ?? stats.currency,
    changedBy: userId ?? null,
    reason: normalizeText(input.reason) ?? 'manual',
    note: normalizeText(input.note),
    createdAt: normalizeDate(input.createdAt),
  });
}

export async function getPropertyPriceStats(propertyIdInput: unknown) {
  const propertyId = getRequiredId(propertyIdInput, 'propertyId');
  const stats = await findPropertyPriceStats(propertyId);
  if (!stats) throw badRequest('Not found');
  return stats;
}

export async function getPropertyProfile(propertyIdInput: unknown) {
  const propertyId = getRequiredId(propertyIdInput, 'propertyId');
  const profile = await findPropertyProfile(propertyId);
  if (!profile) throw badRequest('Not found');

  const [priceStats, activity, metrics] = await Promise.all([
    findPropertyPriceStats(propertyId),
    findPropertyActivity(propertyId, profile.agencyId),
    findPropertyProfileMetrics(propertyId),
  ]);

  return {
    ...profile,
    priceStats,
    activity,
    metrics,
  };
}
