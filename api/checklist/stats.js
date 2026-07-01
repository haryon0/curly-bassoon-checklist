const db = require('../_lib/db');
const { handleCors } = require('../_lib/cors');
const { authenticateToken } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  authenticateToken(req, res, async () => {
    try {
      const userId = req.user.userId;

      const result = await db.query(`
        SELECT
          COUNT(*) as total_submissions,
          SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted_count,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
        FROM checklist_submissions
        WHERE user_id = $1
      `, [userId]);

      const stats = result.rows[0] || {
        total_submissions: 0,
        submitted_count: 0,
        pending_count: 0,
        approved_count: 0,
        rejected_count: 0,
      };

      res.json({ stats });
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });
};
