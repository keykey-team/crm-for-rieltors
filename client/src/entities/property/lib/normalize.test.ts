import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeDateTime, normalizeDocuments, normalizeMediaLinks, normalizePublications } from './normalize';

// ── normalizeDateTime ──────────────────────────────────────────────────────────

test('normalizeDateTime: ISO string round-trips to ISO string', () => {
  const iso = '2026-06-03T09:15:00.000Z';
  assert.equal(normalizeDateTime(iso), iso);
});

test('normalizeDateTime: datetime-local string converts to ISO', () => {
  const result = normalizeDateTime('2026-06-03T09:15');
  assert.ok(typeof result === 'string');
  assert.ok(result.startsWith('2026-06-03T'));
});

test('normalizeDateTime: whitespace-only string returns undefined', () => {
  assert.equal(normalizeDateTime('  '), undefined);
});

test('normalizeDateTime: empty string returns undefined', () => {
  assert.equal(normalizeDateTime(''), undefined);
});

test('normalizeDateTime: non-date string returns undefined', () => {
  assert.equal(normalizeDateTime('not-a-date'), undefined);
});

test('normalizeDateTime: undefined input returns undefined', () => {
  assert.equal(normalizeDateTime(undefined), undefined);
});

// ── normalizeDocuments ────────────────────────────────────────────────────────

test('normalizeDocuments: trims fields and keeps valid items', () => {
  assert.deepEqual(
    normalizeDocuments([
      { title: ' Паспорт ', cloudStoragePath: ' private/a.pdf ', documentType: ' doc_type ' },
      { title: 'Выписка', cloudStoragePath: 'private/b.pdf' },
    ]),
    [
      { title: 'Паспорт', cloudStoragePath: 'private/a.pdf', documentType: 'doc_type' },
      { title: 'Выписка', cloudStoragePath: 'private/b.pdf', documentType: undefined },
    ],
  );
});

test('normalizeDocuments: drops items with empty title or path', () => {
  const result = normalizeDocuments([
    { title: '', cloudStoragePath: 'private/a.pdf' },
    { title: 'OK', cloudStoragePath: '' },
    { title: 'Valid', cloudStoragePath: 'private/c.pdf' },
  ]);
  assert.equal(result?.length, 1);
  assert.equal(result?.[0].title, 'Valid');
});

test('normalizeDocuments: undefined input returns undefined', () => {
  assert.equal(normalizeDocuments(undefined), undefined);
});

// ── normalizeMediaLinks ───────────────────────────────────────────────────────

test('normalizeMediaLinks: trims fields and keeps valid items', () => {
  assert.deepEqual(
    normalizeMediaLinks([
      { title: ' Обзор ', mediaType: ' video ', url: ' https://example.com/v ' },
    ]),
    [{ title: 'Обзор', mediaType: 'video', url: 'https://example.com/v' }],
  );
});

test('normalizeMediaLinks: drops items with empty title or url', () => {
  const result = normalizeMediaLinks([
    { title: '', url: 'https://example.com' },
    { title: 'Valid', url: '' },
    { title: 'OK', url: 'https://example.com/ok' },
  ]);
  assert.equal(result?.length, 1);
  assert.equal(result?.[0].title, 'OK');
});

test('normalizeMediaLinks: undefined input returns undefined', () => {
  assert.equal(normalizeMediaLinks(undefined), undefined);
});

// ── normalizePublications ────────────────────────────────────────────────────

test('normalizePublications: trims fields and converts datetime strings', () => {
  const result = normalizePublications([
    {
      channel: ' instagram ',
      status: ' published ',
      url: ' https://example.com/post ',
      note: ' primary ',
      publishedAt: '2026-06-03T09:15:00.000Z',
      lastSyncedAt: '2026-06-03T12:45:00.000Z',
    },
  ]);
  assert.equal(result?.length, 1);
  const pub = result![0];
  assert.equal(pub.channel, 'instagram');
  assert.equal(pub.status, 'published');
  assert.equal(pub.url, 'https://example.com/post');
  assert.equal(pub.note, 'primary');
  assert.equal(pub.publishedAt, '2026-06-03T09:15:00.000Z');
  assert.equal(pub.lastSyncedAt, '2026-06-03T12:45:00.000Z');
});

test('normalizePublications: datetime-local value converts to ISO string', () => {
  const result = normalizePublications([{ channel: 'olx', status: 'draft', publishedAt: '2026-06-03T09:15' }]);
  assert.ok(typeof result?.[0].publishedAt === 'string');
  assert.ok(result![0].publishedAt!.includes('T'));
  assert.ok(result![0].publishedAt!.endsWith('Z'));
});

test('normalizePublications: empty publishedAt/lastSyncedAt produce undefined fields', () => {
  const result = normalizePublications([{ channel: 'olx', status: 'draft', publishedAt: '', lastSyncedAt: ' ' }]);
  assert.equal(result?.[0].publishedAt, undefined);
  assert.equal(result?.[0].lastSyncedAt, undefined);
});

test('normalizePublications: drops items with missing channel or status', () => {
  const result = normalizePublications([
    { channel: '', status: 'published' },
    { channel: 'olx', status: '' },
    { channel: 'avito', status: 'active' },
  ]);
  assert.equal(result?.length, 1);
  assert.equal(result?.[0].channel, 'avito');
});

test('normalizePublications: undefined input returns undefined', () => {
  assert.equal(normalizePublications(undefined), undefined);
});
