const express = require('express');
const router = express.Router();
const { sendNotification } = require('../controllers/notifications.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

// Apply auth middleware to all notification routes
router.use(verifyFirebaseToken);

// POST /api/notifications
router.post('/', sendNotification);

module.exports = router;
