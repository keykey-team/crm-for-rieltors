import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizePropertyDocuments, normalizePropertyMediaLinks, normalizePropertyPhotos, normalizePropertyPublications } from './property-photos';

test('normalizePropertyPhotos filters invalid items and reindexes order', () => {
  assert.deepEqual(
    normalizePropertyPhotos([
      { cloudStoragePath: ' public/uploads/a.webp ', isPublic: true, order: 99 },
      null,
      { cloudStoragePath: '' },
      { cloudStoragePath: 'public/uploads/b.webp', isPublic: false },
    ]),
    [
      { cloudStoragePath: 'public/uploads/a.webp', isPublic: true, order: 0 },
      { cloudStoragePath: 'public/uploads/b.webp', isPublic: false, order: 1 },
    ],
  );
});

test('normalizePropertyPhotos returns undefined for non-array payloads', () => {
  assert.equal(normalizePropertyPhotos(undefined), undefined);
  assert.equal(normalizePropertyPhotos('not-an-array'), undefined);
});

test('normalizePropertyDocuments filters invalid items and trims fields', () => {
  assert.deepEqual(
    normalizePropertyDocuments([
      { title: ' Паспорт БТИ ', documentType: ' document_type ', cloudStoragePath: ' private/docs/a.pdf ' },
      { title: '', cloudStoragePath: 'private/docs/b.pdf' },
      { title: 'Договор', cloudStoragePath: '' },
      null,
      { title: 'Выписка', cloudStoragePath: 'private/docs/c.pdf' },
    ]),
    [
      { title: 'Паспорт БТИ', documentType: 'document_type', cloudStoragePath: 'private/docs/a.pdf' },
      { title: 'Выписка', cloudStoragePath: 'private/docs/c.pdf' },
    ],
  );
});

test('normalizePropertyMediaLinks filters invalid items and trims fields', () => {
  assert.deepEqual(
    normalizePropertyMediaLinks([
      { title: ' YouTube обзор ', mediaType: ' video ', url: ' https://example.com/video ' },
      { title: '', mediaType: 'tour_3d', url: 'https://example.com/tour' },
      { title: '3D', url: '' },
    ]),
    [
      { title: 'YouTube обзор', mediaType: 'video', url: 'https://example.com/video' },
    ],
  );
});

test('normalizePropertyPublications filters invalid items and trims fields', () => {
  assert.deepEqual(
    normalizePropertyPublications([
      {
        channel: ' instagram ',
        status: ' published ',
        url: ' https://example.com/post ',
        note: ' primary ',
        publishedAt: '2026-06-03T09:15',
        lastSyncedAt: '2026-06-03T12:45:00.000Z',
      },
      { channel: '', status: 'draft' },
      { channel: 'olx', status: '' },
    ]),
    [
      {
        channel: 'instagram',
        status: 'published',
        url: 'https://example.com/post',
        note: 'primary',
        publishedAt: new Date('2026-06-03T09:15'),
        lastSyncedAt: new Date('2026-06-03T12:45:00.000Z'),
      },
    ],
  );
});