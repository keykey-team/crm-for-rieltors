import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePriceTrend } from './calculatePriceTrend';

const point = (price: number, createdAt: string) => ({ id: createdAt, propertyId: 'p1', price, currency: 'USD', createdAt });

test('returns down when latest price is lower', () => {
  assert.equal(calculatePriceTrend([point(50000, '2026-01-01'), point(45000, '2026-02-01')]), 'down');
});

test('returns up when latest price is higher', () => {
  assert.equal(calculatePriceTrend([point(45000, '2026-01-01'), point(47000, '2026-02-01')]), 'up');
});

test('returns stable for single point', () => {
  assert.equal(calculatePriceTrend([point(47000, '2026-02-01')]), 'stable');
});
