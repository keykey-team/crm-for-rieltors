import { badRequest, forbidden } from '../../../common/shared-kernel/errors';
import { isAdminRole } from '../../../common/shared-kernel/roles';
import { PropertyPayload, PropertyQuery } from '../models/property.dto';
import {
  addPropertyPriceHistoryPoint,
  createPropertyWithInitialPrice,
  createPropertyUnit,
  deleteProperty,
  deletePropertyUnit,
  findPropertyPriceHistory,
  findPropertyPriceStats,
  findProperties,
  findPropertyUnits,
  updatePropertyWithPriceHistory,
  updatePropertyUnit,
} from '../repositories/property.repository';

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

function normalizePropertyPayload(input: PropertyPayload) {
  const { priceHistoryReason, priceHistoryNote, ...rest } = input;
  void priceHistoryReason;
  void priceHistoryNote;
  const dealTypes = Array.isArray(input.dealTypes)
    ? input.dealTypes.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : undefined;

  return {
    ...rest,
    rooms: parseNullableInt(input.rooms),
    area: parseNullableFloat(input.area),
    floor: parseNullableInt(input.floor),
    totalFloors: parseNullableInt(input.totalFloors),
    price: parseNullableFloat(input.price),
    dealTypes,
    district: input.district === '' ? null : input.district,
    description: input.description === '' ? null : input.description,
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
  return findProperties(where);
}

export async function addProperty(input: PropertyPayload, userId?: string) {
  const payload = normalizePropertyPayload(input);
  if (payload.price === undefined || payload.price === null) throw badRequest('price is required');
  const reason = normalizeText(input.priceHistoryReason) ?? 'manual';
  const note = normalizeText(input.priceHistoryNote);
  return createPropertyWithInitialPrice(payload, userId, reason, note);
}

export async function changeProperty(id: string, input: PropertyPayload, userId?: string) {
  const payload = normalizePropertyPayload(input);
  const reason = normalizeText(input.priceHistoryReason) ?? 'manual';
  const note = normalizeText(input.priceHistoryNote);
  return updatePropertyWithPriceHistory(id, payload, userId, reason, note);
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
