const crypto = require('crypto');
const { db, admin } = require('../config/firebase');
const { ApiError } = require('../utils/api-error');

function rateLimitId(userId, action) {
  return crypto.createHash('sha256').update(`${action}:${userId}`).digest('hex');
}

async function consumeRateLimit(userId, action, { limit, windowMs }) {
  const ref = db.collection('_serverRateLimits').doc(rateLimitId(userId, action));
  const now = Date.now();

  const result = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.data();
    const windowStartedAt = data?.windowStartedAt?.toMillis?.() || 0;
    const windowExpired = now - windowStartedAt >= windowMs;
    const count = windowExpired ? 0 : Number(data?.count || 0);

    if (count >= limit) {
      return { allowed: false, retryAfterMs: windowMs - (now - windowStartedAt) };
    }

    transaction.set(ref, {
      action,
      count: count + 1,
      windowStartedAt: windowExpired
        ? admin.firestore.Timestamp.fromMillis(now)
        : data.windowStartedAt,
      expiresAt: admin.firestore.Timestamp.fromMillis(now + windowMs * 2),
    });

    return { allowed: true };
  });

  if (!result.allowed) {
    const retryAfter = Math.max(1, Math.ceil(result.retryAfterMs / 1000));
    throw new ApiError(
      429,
      'RATE_LIMITED',
      'Too many requests. Please wait and try again.',
      { retryAfter },
    );
  }
}

module.exports = { consumeRateLimit };
