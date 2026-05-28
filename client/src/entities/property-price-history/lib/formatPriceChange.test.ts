import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPriceChange } from './formatPriceChange';

test('formats positive change', () => {
  assert.match(formatPriceChange(100, 110, 'USD'), /^\+10\.0% \(\+10 USD\)$/);
});

test('formats negative change', () => {
  assert.match(formatPriceChange(200, 150, 'USD'), /^-25\.0% \(-50 USD\)$/);
});
