const { ApiError } = require('./api-error');

const ALLOWED_CATEGORIES = new Set([
  'Music',
  'Coffee',
  'Art',
  'Books',
  'Tech',
  'Food',
  'Fashion',
  'Sports',
  'Local Events',
]);

function requiredString(value, field, maxLength) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} is required`);
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      `${field} must be ${maxLength} characters or fewer`,
    );
  }
  return normalized;
}

function optionalString(value, field, maxLength) {
  if (value == null || value === '') return '';
  if (typeof value !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be text`);
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      `${field} must be ${maxLength} characters or fewer`,
    );
  }
  return normalized;
}

function coordinate(value, field, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} is invalid`);
  }
  return number;
}

function locationEvidence(body) {
  const accuracy = Number(body.accuracy);
  const capturedAt = Number(body.capturedAt);
  if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 250) {
    throw new ApiError(
      422,
      'LOCATION_UNRELIABLE',
      'Your location is not accurate enough to create a room. Try again outdoors.',
    );
  }
  if (!Number.isFinite(capturedAt) || Math.abs(Date.now() - capturedAt) > 2 * 60 * 1000) {
    throw new ApiError(422, 'LOCATION_STALE', 'Refresh your location and try again.');
  }
  return { accuracy, capturedAt };
}

function createRoomPayload(body = {}) {
  const title = requiredString(body.title, 'Title', 60);
  const description = optionalString(body.description, 'Description', 280);
  const category = requiredString(body.category, 'Category', 40);
  if (!ALLOWED_CATEGORIES.has(category)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Category is not supported');
  }

  const duration = Number(body.duration);
  if (![1, 3, 12, 24].includes(duration)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Duration is not supported');
  }

  return {
    title,
    description,
    category,
    duration,
    showOnMap: body.showOnMap !== false,
    latitude: coordinate(body.latitude, 'Latitude', -90, 90),
    longitude: coordinate(body.longitude, 'Longitude', -180, 180),
    ...locationEvidence(body),
  };
}

function inviteCode(value) {
  const code = requiredString(value, 'Invite code', 8).toUpperCase();
  if (!/^[A-Z0-9]{6,8}$/.test(code)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invite code is invalid');
  }
  return code;
}

function documentId(value, field = 'Room') {
  const id = requiredString(value, field, 128);
  if (id.includes('/')) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} is invalid`);
  }
  return id;
}

function messagePayload(body = {}) {
  const isImage = body.type === 'image';
  const text = isImage ? '' : requiredString(body.text, 'Message', 1000);
  const imageUrl = isImage ? requiredString(body.imageUrl, 'Image URL', 500) : null;
  const cloudinaryPublicId = isImage
    ? requiredString(body.cloudinaryPublicId, 'Cloudinary public ID', 300)
    : null;

  if (isImage && !/^https:\/\/.+\.cloudinary\.com\//i.test(imageUrl)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Image URL is invalid');
  }
  const normalized = text.toLowerCase();
  const blockedTerms = (process.env.BLOCKED_MESSAGE_TERMS || '')
    .split(',')
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);
  if (blockedTerms.some((term) => normalized.includes(term))) {
    throw new ApiError(422, 'CONTENT_REJECTED', 'This message violates the community guidelines.');
  }
  if ((text.match(/https?:\/\//gi) || []).length > 2 || /(.)\1{11,}/i.test(text)) {
    throw new ApiError(422, 'CONTENT_REJECTED', 'This message looks like spam.');
  }

  let replyTo = null;
  if (body.replyTo) {
    replyTo = {
      id: documentId(body.replyTo.id, 'Reply'),
      text: optionalString(body.replyTo.text, 'Reply text', 160),
      user: optionalString(body.replyTo.user, 'Reply user', 60),
      imageUrl: optionalString(body.replyTo.imageUrl, 'Reply image', 500) || null,
    };
  }
  const clientMessageId = body.clientMessageId
    ? documentId(body.clientMessageId, 'Client message')
    : null;
  if (clientMessageId && !/^[A-Za-z0-9]{20}$/.test(clientMessageId)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Client message is invalid');
  }
  return {
    type: isImage ? 'image' : 'text',
    text,
    imageUrl,
    cloudinaryPublicId,
    replyTo,
    clientMessageId,
  };
}

function notificationPayload(body = {}, { batch = false } = {}) {
  const title = requiredString(body.title, 'Title', 80);
  const messageBody = requiredString(body.body, 'Body', 180);
  const data = body.data == null ? {} : body.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Notification data must be an object');
  }
  if (JSON.stringify(data).length > 2048) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Notification data is too large');
  }
  const allowedTypes = new Set(['message', 'room', 'nearby_room']);
  if (!allowedTypes.has(data.type)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Notification type is invalid');
  }

  if (batch) {
    if (!Array.isArray(body.recipientUserIds) || body.recipientUserIds.length === 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Recipients are required');
    }
    const recipientUserIds = [...new Set(body.recipientUserIds.map((id) => documentId(id, 'Recipient')))];
    if (recipientUserIds.length > 100) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'A maximum of 100 recipients is allowed');
    }
    return { recipientUserIds, title, body: messageBody, data };
  }
  return {
    recipientUserId: documentId(body.recipientUserId, 'Recipient'),
    title,
    body: messageBody,
    data,
  };
}

module.exports = {
  createRoomPayload,
  documentId,
  inviteCode,
  messagePayload,
  notificationPayload,
};
