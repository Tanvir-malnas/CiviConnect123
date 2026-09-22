/**
 * Admin Authorization Middleware
 * Must be placed AFTER `protect` middleware
 * Verifies that the authenticated user has the 'admin' role
 */
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Forbidden: Access restricted to municipal administrators only.',
    });
  }
};
