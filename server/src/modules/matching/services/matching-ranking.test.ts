import assert from 'node:assert/strict';
import test from 'node:test';

import { rankLeadMatches } from './matching.service';

test('rankLeadMatches orders properties by best score', () => {
  const lead = {
    budget: 100000,
    propertyType: 'apartment',
    districts: 'center,pechersk',
    needType: 'buy',
  };

  const ranked = rankLeadMatches(lead, [
    {
      id: 'p1', title: 'Best', type: 'apartment', status: 'active', address: 'A', district: 'center', rooms: 2, area: 55, price: 100000, currency: 'USD', dealTypes: ['buy'], photos: [],
    },
    {
      id: 'p2', title: 'Ok', type: 'apartment', status: 'active', address: 'B', district: 'pechersk', rooms: 2, area: 55, price: 109000, currency: 'USD', dealTypes: ['buy'], photos: [],
    },
    {
      id: 'p3', title: 'Worse', type: 'apartment', status: 'active', address: 'C', district: 'outside', rooms: 2, area: 55, price: 108000, currency: 'USD', dealTypes: ['buy'], photos: [],
    },
  ], 10);

  assert.equal(ranked[0].id, 'p1');
  assert.equal(ranked[1].id, 'p2');
});
