const { requireAuth } = require('@clerk/express');

// Export Clerk's requireAuth middleware. 
// It automatically returns 401 Unauthorized if the token is invalid or missing.
const verifyClerkToken = requireAuth();

module.exports = { verifyClerkToken };
