import assert from 'node:assert/strict';
import test from 'node:test';

import { createSelectionsService, generateUniquePublicSlug } from './selections.service';

function depsFactory() {
  return {
    slugExists: async () => false,
    createCommunication: async (data: Record<string, unknown>) => data as any,
    findSelectionById: async (id: string) => ({ id, createdById: 'user_1', items: [] }) as any,
    findSelectionBySlug: async () => ({ id: 'sel_1', leadId: 'lead_1', agencyId: 'agency_1', items: [{ id: 'item_1' }] }) as any,
    listSelectionsByUser: async () => [],
    createSelection: async (data: Record<string, unknown>) => ({ id: 'sel_1', ...data }) as any,
    createSelectionItems: async (_items: Array<Record<string, unknown>>) => ({ count: 1 }) as any,
    removeSelectionItem: async () => ({ count: 1 }) as any,
    updateSelection: async () => ({}) as any,
    updateSelectionItem: async (_itemId: string, _data: Record<string, unknown>) => ({}) as any,
    updateSelectionViews: async () => ({}) as any,
    deleteSelection: async () => ({}) as any,
  };
}

test('generateUniquePublicSlug retries on collisions', async () => {
  let calls = 0;
  const slug = await generateUniquePublicSlug(async () => {
    calls += 1;
    return calls < 3;
  });

  assert.equal(slug.length, 12);
  assert.equal(calls, 3);
});

test('createSelection creates unique items', async () => {
  const createdItems: Array<Record<string, unknown>> = [];
  const deps = depsFactory();
  deps.createSelectionItems = async (items) => {
    createdItems.push(...items);
    return { count: items.length } as any;
  };
  const service = createSelectionsService(deps as any);

  await service.createSelection('user_1', 'lead_1', ['p1', 'p1', 'p2'], { title: 'Test' });
  assert.equal(createdItems.length, 2);
  assert.equal(createdItems[0].propertyId, 'p1');
  assert.equal(createdItems[1].propertyId, 'p2');
});

test('getSelection returns accessible selection by id', async () => {
  const deps = depsFactory();
  deps.findSelectionById = async (id: string) => ({ id, createdById: 'user_1', items: [] }) as any;

  const service = createSelectionsService(deps as any);
  const result = await service.getSelection('sel_42', 'user_1', 'agent');

  assert.equal((result as any)?.id, 'sel_42');
});

test('getBySlug returns selection without incrementing views', async () => {
  let viewUpdates = 0;
  const deps = depsFactory();
  deps.updateSelectionViews = async () => {
    viewUpdates += 1;
    return {} as any;
  };

  const service = createSelectionsService(deps as any);
  const result = await service.getBySlug('slug');

  assert.equal((result as any)?.id, 'sel_1');
  assert.equal(viewUpdates, 0);
});

test('recordView increments views once for returned selection', async () => {
  let viewUpdates = 0;
  const deps = depsFactory();
  deps.updateSelectionViews = async () => {
    viewUpdates += 1;
    return {} as any;
  };

  const service = createSelectionsService(deps as any);
  const result = await service.recordView('slug');

  assert.equal((result as any)?.id, 'sel_1');
  assert.equal(viewUpdates, 1);
});

test('recordReaction creates communication touchpoint', async () => {
  let created: Record<string, unknown> | null = null;
  const deps = depsFactory();
  deps.createCommunication = async (data: Record<string, unknown>) => {
    created = data;
    return data as any;
  };

  const service = createSelectionsService(deps as any);
  await service.recordReaction('slug', 'item_1', 'want_to_view', 'please call');

  assert.equal((created as any)?.type, 'selection_reaction');
  assert.equal((created as any)?.leadId, 'lead_1');
  assert.equal((created as any)?.agencyId, 'agency_1');
});

test('updateItem updates CRM-managed reaction fields', async () => {
  let updated: Record<string, unknown> | null = null;
  const deps = depsFactory();
  deps.updateSelectionItem = async (_itemId: string, data: Record<string, unknown>) => {
    updated = data;
    return data as any;
  };

  const service = createSelectionsService(deps as any);
  await service.updateItem('sel_1', 'item_1', {
    agentComment: 'Priority option',
    clientReaction: 'like',
    clientNote: 'Looks good',
  }, 'user_1', 'agent');

  assert.equal((updated as any)?.agentComment, 'Priority option');
  assert.equal((updated as any)?.clientReaction, 'like');
  assert.equal((updated as any)?.clientNote, 'Looks good');
  assert.ok((updated as any)?.reactedAt instanceof Date);
});
