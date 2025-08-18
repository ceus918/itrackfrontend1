// middleware/authMiddleware.js
module.exports = function requireAuth(req, res, next) {
  if (req.session && req.session.user && req.session.user.name) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
};
