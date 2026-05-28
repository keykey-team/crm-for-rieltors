import { badRequest } from '../../../common/shared-kernel/errors';
import { RankedProperty } from '../models/matching.dto';
import { findLeadForMatching, findPropertiesForMatching } from '../repositories/matching.repository';

const PRICE_TOLERANCE_MULTIPLIER = 0.25;
const BUDGET_LOWER_MULTIPLIER = 0.85;
const BUDGET_UPPER_MULTIPLIER = 1.1;
const SCORE_WEIGHTS = {
  propertyType: 0.15,
  district: 0.15,
  rooms: 0.1,
  area: 0.1,
  needType: 0.1,
  price: 0.4,
} as const;

function splitCsv(value: unknown): string[] {
  if (!value || typeof value !== 'string') return [];
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function calcPriceScore(price: number, budget: number): number {
  const tolerance = budget * PRICE_TOLERANCE_MULTIPLIER;
  if (tolerance <= 0) return 0;
  return Math.max(0, 1 - Math.abs(price - budget) / tolerance);
}

export async function suggestPropertiesForLead(leadId: string, limit = 20): Promise<RankedProperty[]> {
  const normalizedLimit = Number.isFinite(limit) ? Math.max(1, Math.min(100, Math.trunc(limit))) : 20;
  const lead = (await findLeadForMatching(leadId)) as Record<string, unknown> | null;
  if (!lead) throw badRequest('Lead not found');
  const properties = await findPropertiesForMatching();
  return rankLeadMatches(lead, properties, normalizedLimit);
}

export function rankLeadMatches(lead: Record<string, unknown>, properties: any[], limit = 20): RankedProperty[] {
  const leadTypeSet = new Set(splitCsv(lead.propertyType));
  const leadDistrictSet = new Set(splitCsv(lead.districts));
  const budget = numberOrNull(lead.budget);
  const minBudget = budget ? budget * BUDGET_LOWER_MULTIPLIER : null;
  const maxBudget = budget ? budget * BUDGET_UPPER_MULTIPLIER : null;
  const roomsMin = numberOrNull(lead.roomsMin);
  const roomsMax = numberOrNull(lead.roomsMax);
  const areaMin = numberOrNull(lead.areaMin);
  const areaMax = numberOrNull(lead.areaMax);
  const needType = typeof lead.needType === 'string' ? lead.needType.toLowerCase() : null;

  const ranked = properties
    .filter((property) => {
      const propertyType = property.type?.toLowerCase?.() ?? '';
      const propertyDistrict = property.district?.toLowerCase?.() ?? '';
      const status = property.status?.toLowerCase?.() ?? '';

      if (status === 'sold' || status === 'archived') return false;
      if (leadTypeSet.size > 0 && !leadTypeSet.has(propertyType)) return false;
      if (leadDistrictSet.size > 0 && propertyDistrict && !leadDistrictSet.has(propertyDistrict)) return false;
      if (minBudget !== null && property.price < minBudget) return false;
      if (maxBudget !== null && property.price > maxBudget) return false;
      if (roomsMin !== null && (property.rooms === null || property.rooms < roomsMin)) return false;
      if (roomsMax !== null && (property.rooms === null || property.rooms > roomsMax)) return false;
      if (areaMin !== null && (property.area === null || property.area < areaMin)) return false;
      if (areaMax !== null && (property.area === null || property.area > areaMax)) return false;
      if (
        needType &&
        property.dealTypes.length > 0 &&
        !property.dealTypes.map((v: string) => v.toLowerCase()).includes(needType)
      ) return false;

      return true;
    })
    .map((property) => {
      const matchedBy: string[] = [];
      let score = 0;
      let totalWeight = 0;

      const addWeighted = (value: number, weight: number, reason: string) => {
        score += value * weight;
        totalWeight += weight;
        if (value > 0.5) matchedBy.push(reason);
      };

      if (leadTypeSet.size > 0) addWeighted(1, SCORE_WEIGHTS.propertyType, 'propertyType');
      if (leadDistrictSet.size > 0) addWeighted(1, SCORE_WEIGHTS.district, 'district');
      if (roomsMin !== null || roomsMax !== null) addWeighted(1, SCORE_WEIGHTS.rooms, 'rooms');
      if (areaMin !== null || areaMax !== null) addWeighted(1, SCORE_WEIGHTS.area, 'area');
      if (needType) addWeighted(1, SCORE_WEIGHTS.needType, 'needType');

      if (budget !== null) {
        const priceScore = calcPriceScore(property.price, budget);
        addWeighted(priceScore, SCORE_WEIGHTS.price, 'price');
      }

      const normalizedScore = totalWeight > 0 ? Math.max(0, Math.min(1, score / totalWeight)) : 0.5;

      return {
        id: property.id,
        title: property.title,
        type: property.type,
        status: property.status,
        address: property.address,
        district: property.district,
        rooms: property.rooms,
        area: property.area,
        price: property.price,
        currency: property.currency,
        score: Number(normalizedScore.toFixed(4)),
        matchedBy,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ranked;
}
