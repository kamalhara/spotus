const express = require('express');
const { auth } = require('../config/firebase');
const { verifyClerkToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/firebase-token', verifyClerkToken, async (req, res, next) => {
  try {
    const firebaseToken = await auth.createCustomToken(req.userId, {
      provider: 'clerk',
    });
    res.status(200).json({ firebaseToken });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
