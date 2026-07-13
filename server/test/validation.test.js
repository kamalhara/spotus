const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createRoomPayload,
  documentId,
  inviteCode,
  messagePayload,
  notificationPayload,
} = require('../src/utils/validation');

test('normalizes a valid room payload', () => {
  const capturedAt = Date.now();
  assert.deepEqual(createRoomPayload({
    title: '  Coffee nearby  ',
    description: ' Say hello ',
    category: 'Coffee',
    duration: 3,
    showOnMap: true,
    latitude: 12.9,
    longitude: 77.6,
    accuracy: 15,
    capturedAt,
  }), {
    title: 'Coffee nearby',
    description: 'Say hello',
    category: 'Coffee',
    duration: 3,
    showOnMap: true,
    latitude: 12.9,
    longitude: 77.6,
    accuracy: 15,
    capturedAt,
  });
});

test('rejects unsupported room durations and coordinates', () => {
  assert.throws(() => createRoomPayload({
    title: 'Test', category: 'Tech', duration: 999, latitude: 0, longitude: 0,
  }), { code: 'VALIDATION_ERROR' });
  assert.throws(() => createRoomPayload({
    title: 'Test', category: 'Tech', duration: 1, latitude: 91, longitude: 0,
  }), { code: 'VALIDATION_ERROR' });
});

test('validates identifiers and invite codes', () => {
  assert.equal(documentId('room_123'), 'room_123');
  assert.equal(inviteCode('ab12cd34'), 'AB12CD34');
  assert.throws(() => documentId('rooms/unsafe'), { code: 'VALIDATION_ERROR' });
});

test('rejects obvious message spam', () => {
  assert.throws(() => messagePayload({ text: 'aaaaaaaaaaaaaa' }), { code: 'CONTENT_REJECTED' });
  assert.throws(() => messagePayload({ text: 'https://a.test https://b.test https://c.test' }), {
    code: 'CONTENT_REJECTED',
  });
});

test('deduplicates notification recipients and limits payload data', () => {
  const result = notificationPayload({
    recipientUserIds: ['user_1', 'user_1', 'user_2'],
    title: 'Room update',
    body: 'Someone joined',
    data: { type: 'room', roomId: 'room_1' },
  }, { batch: true });
  assert.deepEqual(result.recipientUserIds, ['user_1', 'user_2']);
  assert.throws(() => notificationPayload({
    recipientUserId: 'user_1', title: 'x', body: 'y', data: { type: 'unknown' },
  }), { code: 'VALIDATION_ERROR' });
});
