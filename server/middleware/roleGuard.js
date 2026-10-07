/**
 * Role-based access control middleware.
 * Use after `protect` (auth) middleware.
 *
 * Usage:  router.get('/counselor/dashboard', protect, requireRole('counselor'), handler)
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
  };
};
