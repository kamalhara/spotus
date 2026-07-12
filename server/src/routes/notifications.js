const express = require('express');
const router = express.Router();
const { sendNotification, sendBatchNotification } = require('../controllers/notifications.controller');
const { verifyClerkToken } = require('../middleware/auth.middleware');

// Apply auth middleware to all notification routes
router.use(verifyClerkToken);

// POST /api/notifications
router.post('/', sendNotification);

// POST /api/notifications/batch
router.post('/batch', sendBatchNotification);

module.exports = router;
