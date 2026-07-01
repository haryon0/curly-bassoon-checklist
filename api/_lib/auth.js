const jwt = require('jsonwebtoken');
const db = require('./db');

// TESTING MODE: login is temporarily disabled. When there is no valid token we
// fall back to the first active admin so protected endpoints keep working.
// To restore real auth, revert this file (see git history).
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  const useAdminFallback = async () => {
    try {
      const result = await db.query(
        "SELECT id, username, email, full_name, role FROM users WHERE role = 'admin' AND is_active = true ORDER BY id LIMIT 1"
      );
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'No admin user available' });
      }
      const admin = result.rows[0];
      req.user = { userId: admin.id, ...admin };
      next();
    } catch (err) {
      console.error('Auth fallback error:', err);
      res.status(500).json({ error: 'Authentication error' });
    }
  };

  if (!token) {
    return useAdminFallback();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // TESTING MODE: ignore invalid/expired tokens, fall back to admin
      return useAdminFallback();
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
