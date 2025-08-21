// middleware/authMiddleware.js
// Stateless version: always allow (no session, no authentication)
// For real security, implement token-based authentication here
module.exports = function requireAuth(req, res, next) {
  // Allow all requests (no session, no user check)
  return next();
};
