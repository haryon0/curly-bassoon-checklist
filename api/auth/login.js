const jwt = require('jsonwebtoken');
const { handleCors } = require('../_lib/cors');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { login: loginField, password } = req.body;

    if (!loginField || !password) {
      return res.status(400).json({ error: 'Username/email and password are required' });
    }

    // TESTING MODE: Accept any username/password for now
    console.log(`🔐 Test login: ${loginField} / ${password}`);

    const token = jwt.sign(
      { userId: 1, username: loginField, role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful (TEST MODE)',
      token,
      user: {
        id: 1,
        username: loginField,
        email: `${loginField}@test.com`,
        full_name: 'Test User',
        role: 'admin',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};
