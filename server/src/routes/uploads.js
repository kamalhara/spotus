const express = require('express');
const { createImageSignature } = require('../controllers/uploads.controller');
const { verifyClerkToken } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(verifyClerkToken);
router.post('/image-signature', createImageSignature);

module.exports = router;
