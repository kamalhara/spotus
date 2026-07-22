const express = require('express');
const { verifyClerkToken } = require('../middleware/auth.middleware');
const { deleteAccount } = require('../services/account.service');

const router = express.Router();

router.delete('/', verifyClerkToken, async (req, res, next) => {
  try {
    await deleteAccount(req.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
