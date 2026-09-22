import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT token containing userId and role
 * @param {string} userId - User's MongoDB ObjectId
 * @param {string} role - 'citizen' or 'admin'
 * @returns {string} Signed JWT token
 */
export const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'civiconnect_super_secret_jwt_key_2025',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};
