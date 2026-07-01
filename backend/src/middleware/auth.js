const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// TESTING MODE: login is temporarily disabled. When there is no valid token we
// fall back to the first active admin so protected routes keep working.
// To restore real auth, revert this file (see git history).
const authenticateToken = async (req, res, next) => {
  try {
    // Support token via Authorization header OR query param (for iframe PDF preview)
    let token = null;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    let userId = null;
    if (token) {
      try {
        userId = jwt.verify(token, process.env.JWT_SECRET).userId;
      } catch {
        userId = null; // TESTING MODE: ignore invalid/expired tokens
      }
    }

    const result = userId
      ? await pool.query(
          'SELECT id, username, email, full_name, role, is_active FROM users WHERE id = $1',
          [userId]
        )
      : await pool.query(
          "SELECT id, username, email, full_name, role, is_active FROM users WHERE role = 'admin' AND is_active = true ORDER BY id LIMIT 1"
        );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Authentication error' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };
