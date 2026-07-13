const crypto = require('crypto');
const { consumeRateLimit } = require('../services/rate-limit.service');
const { ApiError } = require('../utils/api-error');

async function createImageSignature(req, res, next) {
  try {
    await consumeRateLimit(req.userId, 'sign-image-upload', { limit: 20, windowMs: 10 * 60 * 1000 });
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new ApiError(503, 'UPLOAD_UNAVAILABLE', 'Image uploads are temporarily unavailable.');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'spotus';
    const signature = crypto
      .createHash('sha1')
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');
    res.json({ apiKey, cloudName, folder, signature, timestamp });
  } catch (error) {
    next(error);
  }
}

module.exports = { createImageSignature };
