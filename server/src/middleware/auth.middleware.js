const { getAuth } = require('@clerk/express');

const verifyClerkToken = (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'Authentication is required.' },
    });
  }
  req.userId = userId;
  return next();
};

module.exports = { verifyClerkToken };
