const { afterEach, describe, expect, test } = require('@jest/globals');
const {
  createRoomPayload,
  messagePayload,
  notificationPayload,
} = require('../src/utils/validation');

const validRoom = (overrides = {}) => ({
  title: '  Coffee nearby  ',
  description: ' Say hello ',
  category: 'Coffee',
  duration: 3,
  showOnMap: true,
  latitude: 12.9,
  longitude: 77.6,
  accuracy: 15,
  capturedAt: Date.now(),
  ...overrides,
});

describe('createRoomPayload', () => {
  test('normalizes and returns the expected payload structure', () => {
    const payload = createRoomPayload(validRoom());

    expect(payload).toEqual({
      title: 'Coffee nearby',
      description: 'Say hello',
      category: 'Coffee',
      duration: 3,
      showOnMap: true,
      latitude: 12.9,
      longitude: 77.6,
      accuracy: 15,
      capturedAt: expect.any(Number),
    });
  });

  test.each([-1, 251, Number.NaN])(
    'rejects invalid location accuracy: %s',
    (accuracy) => {
      expect(() => createRoomPayload(validRoom({ accuracy }))).toThrow(
        expect.objectContaining({ code: 'LOCATION_UNRELIABLE', status: 422 }),
      );
    },
  );

  test('rejects stale location evidence', () => {
    expect(() =>
      createRoomPayload(validRoom({ capturedAt: Date.now() - 121_000 })),
    ).toThrow(
      expect.objectContaining({ code: 'LOCATION_STALE', status: 422 }),
    );
  });
});

describe('messagePayload', () => {
  const originalBlockedTerms = process.env.BLOCKED_MESSAGE_TERMS;

  afterEach(() => {
    if (originalBlockedTerms === undefined) {
      delete process.env.BLOCKED_MESSAGE_TERMS;
    } else {
      process.env.BLOCKED_MESSAGE_TERMS = originalBlockedTerms;
    }
  });

  test('rejects configured bad words case-insensitively', () => {
    process.env.BLOCKED_MESSAGE_TERMS = 'forbidden,blocked phrase';

    expect(() => messagePayload({ text: 'This contains FORBIDDEN content' }))
      .toThrow(
        expect.objectContaining({ code: 'CONTENT_REJECTED', status: 422 }),
      );
  });

  test('normalizes a message and reply payload', () => {
    expect(
      messagePayload({
        text: '  Hello there  ',
        clientMessageId: 'AbCdEfGhIjKlMnOpQrSt',
        replyTo: {
          id: 'message_1',
          text: ' Previous message ',
          user: ' Ada ',
          imageUrl: '',
        },
      }),
    ).toEqual({
      type: 'text',
      text: 'Hello there',
      imageUrl: null,
      cloudinaryPublicId: null,
      clientMessageId: 'AbCdEfGhIjKlMnOpQrSt',
      replyTo: {
        id: 'message_1',
        text: 'Previous message',
        user: 'Ada',
        imageUrl: null,
      },
    });
  });

  test('accepts a signed Cloudinary image message', () => {
    expect(
      messagePayload({
        type: 'image',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/spotus/photo.jpg',
        cloudinaryPublicId: 'spotus/photo',
      }),
    ).toEqual({
      type: 'image',
      text: '',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/spotus/photo.jpg',
      cloudinaryPublicId: 'spotus/photo',
      replyTo: null,
      clientMessageId: null,
    });
  });

  test('rejects malformed client message IDs', () => {
    expect(() =>
      messagePayload({ text: 'Hello', clientMessageId: 'temp-123' }),
    ).toThrow(
      expect.objectContaining({ code: 'VALIDATION_ERROR', status: 400 }),
    );
  });

  test('rejects image messages hosted outside Cloudinary', () => {
    expect(() =>
      messagePayload({
        type: 'image',
        imageUrl: 'https://example.com/photo.jpg',
        cloudinaryPublicId: 'spotus/photo',
      }),
    ).toThrow(
      expect.objectContaining({ code: 'VALIDATION_ERROR', status: 400 }),
    );
  });
});

describe('notificationPayload', () => {
  test('deduplicates batch recipients and preserves the validated shape', () => {
    expect(
      notificationPayload(
        {
          recipientUserIds: ['user_1', 'user_1', 'user_2'],
          title: 'Room update',
          body: 'Someone joined',
          data: { type: 'room', roomId: 'room_1' },
        },
        { batch: true },
      ),
    ).toEqual({
      recipientUserIds: ['user_1', 'user_2'],
      title: 'Room update',
      body: 'Someone joined',
      data: { type: 'room', roomId: 'room_1' },
    });
  });
});
