"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProperties = listProperties;
exports.addProperty = addProperty;
exports.changeProperty = changeProperty;
exports.removeProperty = removeProperty;
exports.listPropertyUnits = listPropertyUnits;
exports.addPropertyUnit = addPropertyUnit;
exports.changePropertyUnit = changePropertyUnit;
exports.removePropertyUnit = removePropertyUnit;
const errors_1 = require("../../../common/shared-kernel/errors");
const property_repository_1 = require("../repositories/property.repository");
function getRequiredId(value, field = 'id') {
    const id = String(value ?? '').trim();
    if (!id)
        throw (0, errors_1.badRequest)(`${field} required`);
    return id;
}
function parseNullableInt(value) {
    if (value === undefined)
        return undefined;
    if (value === null || value === '')
        return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : undefined;
}
function parseNullableFloat(value) {
    if (value === undefined)
        return undefined;
    if (value === null || value === '')
        return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}
function normalizePropertyPayload(input) {
    const dealTypes = Array.isArray(input.dealTypes)
        ? input.dealTypes.filter((item) => typeof item === 'string' && item.trim().length > 0)
        : undefined;
    return {
        ...input,
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
async function listProperties(query) {
    const where = {};
    if (query.status)
        where.status = query.status;
    if (query.type)
        where.type = query.type;
    if (query.dealType)
        where.dealTypes = { has: query.dealType };
    if (query.search) {
        where.OR = [
            { title: { contains: query.search, mode: 'insensitive' } },
            { address: { contains: query.search, mode: 'insensitive' } },
        ];
    }
    return (0, property_repository_1.findProperties)(where);
}
async function addProperty(input) {
    const payload = normalizePropertyPayload(input);
    if (payload.price === undefined || payload.price === null)
        throw (0, errors_1.badRequest)('price is required');
    return (0, property_repository_1.createProperty)(payload);
}
async function changeProperty(id, input) {
    return (0, property_repository_1.updateProperty)(id, normalizePropertyPayload(input));
}
async function removeProperty(id) {
    await (0, property_repository_1.deleteProperty)(id);
    return { success: true };
}
async function listPropertyUnits(propertyIdInput) {
    return (0, property_repository_1.findPropertyUnits)(getRequiredId(propertyIdInput, 'propertyId'));
}
async function addPropertyUnit(input) {
    return (0, property_repository_1.createPropertyUnit)(input);
}
async function changePropertyUnit(input) {
    const id = getRequiredId(input.id);
    const { id: _id, ...data } = input;
    return (0, property_repository_1.updatePropertyUnit)(id, data);
}
async function removePropertyUnit(idInput) {
    await (0, property_repository_1.deletePropertyUnit)(getRequiredId(idInput));
    return { ok: true };
}
