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

// POST /api/admin/users - Create new user
const createUser = async (req, res) => {
  try {
    const { username, email, full_name, role = 'user' } = req.body;

    // Validation
    if (!username || !email || !full_name) {
      return res.status(400).json({ error: 'Username, email, and full_name are required' });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username may only contain letters, numbers, and underscores' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be 3-20 characters' });
    }

    if (full_name.length > 100) {
      return res.status(400).json({ error: 'Full name must be 100 characters or less' });
    }

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be user or admin' });
    }

    // Check if email/username already exists
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase(), username.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email or username already registered' });
    }

    // Generate temporary password
    const tempPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, role, is_active, password_reset_required)
       VALUES ($1, $2, $3, $4, $5, true, true)
       RETURNING id, username, email, full_name, role, is_active, created_at`,
      [username.toLowerCase(), email.toLowerCase(), passwordHash, full_name, role]
    );

    const user = result.rows[0];

    res.status(201).json({
      ...user,
      temporary_password: tempPassword,
      password_reset_required: true,
      message: 'User created successfully. Share the temporary password with the user.',
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

module.exports = {
  listUsers,
  getUser,
  createUser,
};
