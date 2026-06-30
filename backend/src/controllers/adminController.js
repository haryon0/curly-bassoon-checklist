const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { generateTemporaryPassword } = require('../utils/passwordGenerator');

// GET /api/admin/users - List all users with search, filter, pagination
const listUsers = async (req, res) => {
  try {
    const { search = '', role = '', status = '', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT id, username, email, full_name, role, is_active, created_at, last_login FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Search filter
    if (search) {
      query += ` AND (username ILIKE $${paramCount} OR email ILIKE $${paramCount} OR full_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Role filter
    if (role && (role === 'admin' || role === 'user')) {
      query += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    // Status filter
    if (status === 'active') {
      query += ` AND is_active = true`;
    } else if (status === 'inactive') {
      query += ` AND is_active = false`;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM users WHERE 1=1${
      search ? ` AND (username ILIKE $1 OR email ILIKE $1 OR full_name ILIKE $1)` : ''
    }${role ? ` AND role = ${search ? '$2' : '$1'}` : ''}${
      status === 'active' ? ' AND is_active = true' : status === 'inactive' ? ' AND is_active = false' : ''
    }`;
    const countParams = search ? [`%${search}%`] : [];
    if (role) countParams.push(role);

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    res.json({
      users: result.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
};

// GET /api/admin/users/:id - Get user details
const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, username, email, full_name, role, is_active, created_at, last_login FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

module.exports = {
  listUsers,
  getUser,
};
