const db = require('../_lib/db');
const { handleCors } = require('../_lib/cors');
const { authenticateToken } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    authenticateToken(req, res, async () => {
      const userId = req.user.userId;

      const result = await db.query(
        'SELECT id, username, email, full_name, role, is_active FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: result.rows[0] });
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
