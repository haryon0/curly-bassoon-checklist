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
      const { status, templateId, limit = 10, offset = 0 } = req.query;

      let query = `
        SELECT
          cs.id,
          cs.template_id,
          t.title as template_title,
          cs.status,
          cs.created_at,
          cs.updated_at,
          cs.submitted_at
        FROM checklist_submissions cs
        LEFT JOIN templates t ON cs.template_id = t.id
        WHERE cs.user_id = $1
      `;

      const params = [userId];
      let paramCount = 1;

      if (status) {
        paramCount++;
        query += ` AND cs.status = $${paramCount}`;
        params.push(status);
      }

      if (templateId) {
        paramCount++;
        query += ` AND cs.template_id = $${paramCount}`;
        params.push(templateId);
      }

      query += ` ORDER BY cs.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(parseInt(limit), parseInt(offset));

      const result = await db.query(query, params);

      res.json({
        checklists: result.rows,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    } catch (error) {
      console.error('Get checklists error:', error);
      res.status(500).json({ error: 'Failed to fetch checklists' });
    }
  });
};
