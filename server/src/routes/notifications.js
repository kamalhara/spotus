const express = require('express');
const router = express.Router();
const { sendNotification } = require('../controllers/notifications.controller');
const { verifyClerkToken } = require('../middleware/auth.middleware');

// Apply auth middleware to all notification routes
router.use(verifyClerkToken);

// POST /api/notifications
router.post('/', sendNotification);

module.exports = router;
