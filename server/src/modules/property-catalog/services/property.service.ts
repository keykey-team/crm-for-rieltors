import { badRequest } from '../../../common/shared-kernel/errors';
import { PropertyPayload, PropertyQuery } from '../models/property.dto';
import {
  createProperty,
  createPropertyUnit,
  deleteProperty,
  deletePropertyUnit,
  findProperties,
  findPropertyUnits,
  updateProperty,
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
  return {
    ...input,
    rooms: parseNullableInt(input.rooms),
    area: parseNullableFloat(input.area),
    floor: parseNullableInt(input.floor),
    totalFloors: parseNullableInt(input.totalFloors),
    price: parseNullableFloat(input.price),
    district: input.district === '' ? null : input.district,
    description: input.description === '' ? null : input.description,
  };
}

export async function listProperties(query: PropertyQuery) {
  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status;
  if (query.type) where.type = query.type;
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { address: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  return findProperties(where);
}

export async function addProperty(input: PropertyPayload) {
  const payload = normalizePropertyPayload(input);
  if (payload.price === undefined || payload.price === null) throw badRequest('price is required');
  return createProperty(payload);
}

export async function changeProperty(id: string, input: PropertyPayload) {
  return updateProperty(id, normalizePropertyPayload(input));
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

