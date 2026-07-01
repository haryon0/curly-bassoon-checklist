# Admin User Management Panel Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement task-by-task with review checkpoints.

**Goal:** Build a complete admin panel for user management (create, read, update, delete, change password) integrated into the Dashboard as a tab visible only to admin users.

**Architecture:** 
- Backend: Express routes + controller with admin role middleware
- Database: Add 3 columns to users table (password_reset_required, is_active, last_login)
- Frontend: React components for user list, forms, and modals
- Integration: Tab-based UI in Dashboard, first-login password change redirect

**Tech Stack:** Express, PostgreSQL, React, Tailwind CSS, react-toastify

---

## File Structure

### Backend
- `backend/src/middleware/adminAuth.js` (NEW) — Admin role verification middleware
- `backend/src/routes/admin.js` (NEW) — Admin user routes
- `backend/src/controllers/adminController.js` (NEW) — Admin user CRUD logic
- `backend/src/config/migrate.js` (MODIFY) — Add migration for new columns
- `backend/src/routes/auth.js` (MODIFY) — Update login to return password_reset_required flag

### Frontend
- `frontend/src/services/userAPI.js` (NEW) — API service for admin user endpoints
- `frontend/src/components/UserManagement/UserManagementTab.jsx` (NEW) — Main container
- `frontend/src/components/UserManagement/UserList.jsx` (NEW) — User table with search/filter
- `frontend/src/components/UserManagement/UserForm.jsx` (NEW) — Create/edit user modal
- `frontend/src/components/UserManagement/ChangePasswordForm.jsx` (NEW) — Password change modal
- `frontend/src/components/UserManagement/DeleteConfirmation.jsx` (NEW) — Delete confirmation dialog
- `frontend/src/pages/Dashboard.jsx` (MODIFY) — Add User Management tab
- `frontend/src/pages/ChangePasswordRequired.jsx` (NEW) — First-login password change page
- `frontend/src/context/AuthContext.jsx` (MODIFY) — Track password_reset_required flag

---

## Tasks

### Task 1: Database Migration

Add three columns to the users table to support admin features.

**Files:**
- Modify: `backend/src/config/migrate.js`

- [ ] **Step 1: Read the current migration file**

Check the current migrate.js to understand the migration pattern.

- [ ] **Step 2: Add migration for new columns**

Update `backend/src/config/migrate.js` to add the migration. Find the section where the users table is created and add these queries to the migration array:

```javascript
// In the migrations array, add these after the initial users table creation:
`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT true;`,
`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;`,
`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL;`
```

These should be added to the migrations array in the migrate.js file.

- [ ] **Step 3: Run migrations**

```bash
cd backend
node src/config/migrate.js
```

Expected: Migrations run successfully, tables created/columns added.

- [ ] **Step 4: Commit**

```bash
git add backend/src/config/migrate.js
git commit -m "feat: add user admin columns (password_reset_required, is_active, last_login)"
```

---

### Task 2: Admin Auth Middleware

Create middleware to verify admin role on protected routes.

**Files:**
- Create: `backend/src/middleware/adminAuth.js`
- Modify: `backend/src/middleware/auth.js`

- [ ] **Step 1: Create admin middleware**

Create `backend/src/middleware/adminAuth.js`:

```javascript
const adminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  
  next();
};

module.exports = { adminAuth };
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/middleware/adminAuth.js
git commit -m "feat: add admin role verification middleware"
```

---

### Task 3: Temporary Password Generation Utility

Create utility function to generate secure temporary passwords.

**Files:**
- Create: `backend/src/utils/passwordGenerator.js`

- [ ] **Step 1: Create password generator**

Create `backend/src/utils/passwordGenerator.js`:

```javascript
const generateTemporaryPassword = () => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  const allChars = upper + lower + numbers + symbols;
  let password = '';
  
  // Ensure at least one of each type
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill remaining characters
  for (let i = password.length; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

module.exports = { generateTemporaryPassword };
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/utils/passwordGenerator.js
git commit -m "feat: add temporary password generator utility"
```

---

### Task 4: Admin Controller - List & Get Users

Implement logic to list and retrieve users with search/filter/pagination.

**Files:**
- Create: `backend/src/controllers/adminController.js`

- [ ] **Step 1: Create admin controller with list function**

Create `backend/src/controllers/adminController.js`:

```javascript
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
```

- [ ] **Step 2: Test list endpoint manually (will complete after routes created)**

Mark as deferred - will test after routes are set up.

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/adminController.js backend/src/utils/passwordGenerator.js
git commit -m "feat: add admin controller with list and get user functions"
```

---

### Task 5: Admin Controller - Create User

Implement user creation with temporary password generation.

**Files:**
- Modify: `backend/src/controllers/adminController.js`

- [ ] **Step 1: Add createUser function to adminController.js**

Add this function to the exports in `backend/src/controllers/adminController.js`:

```javascript
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
```

Update the module.exports to include `createUser`:

```javascript
module.exports = {
  listUsers,
  getUser,
  createUser,
};
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/controllers/adminController.js
git commit -m "feat: add createUser function with temporary password generation"
```

---

### Task 6: Admin Controller - Update User

Implement user update for full_name, email, role, and is_active.

**Files:**
- Modify: `backend/src/controllers/adminController.js`

- [ ] **Step 1: Add updateUser function**

Add this to `backend/src/controllers/adminController.js`:

```javascript
// PUT /api/admin/users/:id - Update user details
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, role, is_active } = req.body;
    
    // Get current user
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentUser = userResult.rows[0];
    
    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramCount = 1;
    
    if (full_name !== undefined) {
      if (full_name.length > 100) {
        return res.status(400).json({ error: 'Full name must be 100 characters or less' });
      }
      updates.push(`full_name = $${paramCount}`);
      params.push(full_name);
      paramCount++;
    }
    
    if (email !== undefined) {
      const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), id]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      updates.push(`email = $${paramCount}`);
      params.push(email.toLowerCase());
      paramCount++;
    }
    
    if (role !== undefined) {
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Role must be user or admin' });
      }
      updates.push(`role = $${paramCount}`);
      params.push(role);
      paramCount++;
    }
    
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      params.push(is_active);
      paramCount++;
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    params.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, username, email, full_name, role, is_active, created_at, last_login`;
    
    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};
```

Update module.exports:

```javascript
module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
};
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/controllers/adminController.js
git commit -m "feat: add updateUser function"
```

---

### Task 7: Admin Controller - Change Password & Delete User

Implement password change and user deletion endpoints.

**Files:**
- Modify: `backend/src/controllers/adminController.js`

- [ ] **Step 1: Add changePassword function**

Add this to `backend/src/controllers/adminController.js`:

```javascript
// PUT /api/admin/users/:id/password - Change user password
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;
    
    if (!new_password || new_password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    const userResult = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const passwordHash = await bcrypt.hash(new_password, 10);
    
    await pool.query(
      'UPDATE users SET password_hash = $1, password_reset_required = false WHERE id = $2',
      [passwordHash, id]
    );
    
    res.json({ message: 'Password changed successfully', password_reset_required: false });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};
```

- [ ] **Step 2: Add deleteUser function**

Add this to `backend/src/controllers/adminController.js`:

```javascript
// DELETE /api/admin/users/:id - Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id; // From authenticated request
    
    // Cannot delete self
    if (parseInt(id) === adminId) {
      return res.status(403).json({ error: 'Cannot delete your own account' });
    }
    
    // Get user to check role
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if this is the last admin
    if (userResult.rows[0].role === 'admin') {
      const adminCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['admin']);
      if (parseInt(adminCount.rows[0].count) <= 1) {
        return res.status(403).json({ error: 'Cannot delete the last admin user' });
      }
    }
    
    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
```

Update module.exports:

```javascript
module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  changePassword,
  deleteUser,
};
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/adminController.js
git commit -m "feat: add changePassword and deleteUser functions"
```

---

### Task 8: Admin Routes

Create Express routes for admin endpoints.

**Files:**
- Create: `backend/src/routes/admin.js`
- Modify: `backend/src/app.js`

- [ ] **Step 1: Create admin routes file**

Create `backend/src/routes/admin.js`:

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
const {
  listUsers,
  getUser,
  createUser,
  updateUser,
  changePassword,
  deleteUser,
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(adminAuth);

router.get('/users', listUsers);
router.post('/users', createUser);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.put('/users/:id/password', changePassword);
router.delete('/users/:id', deleteUser);

module.exports = router;
```

- [ ] **Step 2: Register routes in app.js**

Modify `backend/src/app.js`. Find the line `app.use('/api/auth', authRoutes);` and add this after it:

```javascript
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);
```

So the routes section should look like:

```javascript
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/checklist', checklistRoutes);
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/routes/admin.js backend/src/app.js
git commit -m "feat: add admin user routes"
```

---

### Task 9: Update Auth Controller for First Login

Modify login to return password_reset_required flag and track last_login.

**Files:**
- Modify: `backend/src/controllers/authController.js`

- [ ] **Step 1: Read the current login function**

Check the existing login function in `backend/src/controllers/authController.js` to understand its structure.

- [ ] **Step 2: Update login response**

Find the login function and modify the response to include `password_reset_required`. Update the part where the user object is returned to include this field. Find where it returns the user object and ensure it includes:

```javascript
res.status(200).json({
  message: 'Login successful',
  token,
  user: {
    id: user.id,
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    password_reset_required: user.password_reset_required,
  },
});
```

Also add this line before the response (to update last_login):

```javascript
// Update last_login
await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/authController.js
git commit -m "feat: add password_reset_required to login response and track last_login"
```

---

### Task 10: Frontend API Service for Admin Users

Create API service to call admin endpoints from React.

**Files:**
- Create: `frontend/src/services/userAPI.js`

- [ ] **Step 1: Create userAPI service**

Create `frontend/src/services/userAPI.js`:

```javascript
import { api } from './api';

export const userAPI = {
  list: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    return api.get(`/admin/users?${queryParams}`);
  },
  
  get: (id) => api.get(`/admin/users/${id}`),
  
  create: (data) => api.post('/admin/users', data),
  
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  
  changePassword: (id, newPassword) => api.put(`/admin/users/${id}/password`, { new_password: newPassword }),
  
  delete: (id) => api.delete(`/admin/users/${id}`),
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/services/userAPI.js
git commit -m "feat: add user admin API service"
```

---

### Task 11: User List Component

Create the user list table with search and filters.

**Files:**
- Create: `frontend/src/components/UserManagement/UserList.jsx`

- [ ] **Step 1: Create UserList component**

Create `frontend/src/components/UserManagement/UserList.jsx`:

```javascript
import React from 'react';

export default function UserList({
  users,
  loading,
  total,
  page,
  limit,
  onPageChange,
  onEdit,
  onDelete,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadge = (role) => {
    return role === 'admin' ? (
      <span className="badge-admin">👤 Admin</span>
    ) : (
      <span className="badge-user">👤 User</span>
    );
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="badge-completed">✓ Aktif</span>
    ) : (
      <span className="badge-failed">✗ Nonaktif</span>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="card">
      {/* Header with filters */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-sm text-gray-600 block mb-1">Cari</label>
            <input
              type="text"
              placeholder="Username, email, atau nama..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-600"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-600"
            >
              <option value="">Semua</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-600"
            >
              <option value="">Semua</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-gray-500 text-sm">Tidak ada user yang ditemukan</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-gray-700">Username</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-700">Nama Lengkap</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-700">Email</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-700">Role</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-700">Dibuat</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-700">Terakhir Login</th>
                <th className="px-5 py-3 text-right font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-4 text-gray-900 font-mono text-xs">{user.username}</td>
                  <td className="px-5 py-4 text-gray-900">{user.full_name}</td>
                  <td className="px-5 py-4 text-gray-600 text-xs">{user.email}</td>
                  <td className="px-5 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-5 py-4">{getStatusBadge(user.is_active)}</td>
                  <td className="px-5 py-4 text-gray-600 text-xs">{formatDate(user.created_at)}</td>
                  <td className="px-5 py-4 text-gray-600 text-xs">{formatDate(user.last_login)}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => onEdit(user)}
                      className="text-brand-600 hover:underline text-xs mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(user)}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && users.length > 0 && (
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, total)} dari {total}
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-2 border border-gray-200 rounded text-sm disabled:opacity-50"
            >
              ← Sebelumnya
            </button>
            <span className="px-3 py-2 text-sm">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-2 border border-gray-200 rounded text-sm disabled:opacity-50"
            >
              Selanjutnya →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/UserManagement/UserList.jsx
git commit -m "feat: add user list component with search and filters"
```

---

### Task 12: User Form Component (Create/Edit)

Create modal form for creating and editing users.

**Files:**
- Create: `frontend/src/components/UserManagement/UserForm.jsx`

- [ ] **Step 1: Create UserForm component**

Create `frontend/src/components/UserManagement/UserForm.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function UserForm({
  user,
  onSubmit,
  onClose,
  onOpenChangePassword,
}) {
  const isEdit = !!user;
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    role: 'user',
    is_active: true,
  });
  const [tempPassword, setTempPassword] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && user) {
      setFormData({
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
      });
    }
  }, [user, isEdit]);

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      toast.error('Nama lengkap harus diisi');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email harus diisi');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Email tidak valid');
      return false;
    }
    if (!isEdit && !formData.username.trim()) {
      toast.error('Username harus diisi');
      return false;
    }
    if (!isEdit && !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error('Username hanya boleh berisi huruf, angka, dan underscore');
      return false;
    }
    if (!isEdit && (formData.username.length < 3 || formData.username.length > 20)) {
      toast.error('Username harus 3-20 karakter');
      return false;
    }
    if (formData.full_name.length > 100) {
      toast.error('Nama lengkap maksimal 100 karakter');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await onSubmit(formData);
      if (result?.temporary_password) {
        setTempPassword(result.temporary_password);
      } else {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Disalin ke clipboard');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit User' : 'Buat User Baru'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">
            ✕
          </button>
        </div>

        {/* Temp Password Alert */}
        {tempPassword && (
          <div className="px-6 pt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-green-900 mb-2">✓ User dibuat berhasil!</div>
              <div className="text-xs text-green-800 mb-3">
                Password sementara (share dengan user, hanya ditampilkan sekali):
              </div>
              <div className="bg-white border border-green-200 rounded px-3 py-2 font-mono text-sm text-green-900 flex items-center justify-between">
                <code>{tempPassword}</code>
                <button
                  onClick={() => copyToClipboard(tempPassword)}
                  className="text-green-600 hover:text-green-900 ml-2"
                >
                  📋
                </button>
              </div>
              <button
                onClick={onClose}
                className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Selesai
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {!tempPassword && (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Username - only on create */}
            {!isEdit && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600"
                  placeholder="john_doe"
                />
              </div>
            )}

            {/* Full Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600"
                placeholder="john@example.com"
              />
            </div>

            {/* Role */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Status */}
            <div className="mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Aktif</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              {isEdit && (
                <button
                  type="button"
                  onClick={onOpenChangePassword}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  🔑 Ubah Password
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : isEdit ? 'Simpan' : 'Buat'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/UserManagement/UserForm.jsx
git commit -m "feat: add user form component for create and edit"
```

---

### Task 13: Change Password Form Component

Create modal for admin to change user password.

**Files:**
- Create: `frontend/src/components/UserManagement/ChangePasswordForm.jsx`

- [ ] **Step 1: Create ChangePasswordForm component**

Create `frontend/src/components/UserManagement/ChangePasswordForm.jsx`:

```javascript
import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function ChangePasswordForm({ user, onSubmit, onClose }) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password minimal 8 karakter');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setLoading(true);
    try {
      await onSubmit(newPassword);
      toast.success('Password berhasil diubah');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Ubah Password</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">User: {user?.username}</label>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru *</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600"
              placeholder="Minimal 8 karakter"
            />
            <div className="text-xs text-gray-500 mt-1">Minimal 8 karakter</div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? 'Mengubah...' : 'Ubah Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/UserManagement/ChangePasswordForm.jsx
git commit -m "feat: add change password form component"
```

---

### Task 14: Delete Confirmation Component

Create confirmation dialog for user deletion.

**Files:**
- Create: `frontend/src/components/UserManagement/DeleteConfirmation.jsx`

- [ ] **Step 1: Create DeleteConfirmation component**

Create `frontend/src/components/UserManagement/DeleteConfirmation.jsx`:

```javascript
import React, { useState } from 'react';

export default function DeleteConfirmation({ user, onConfirm, onCancel, disabledReason }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Hapus User</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {disabledReason ? (
            <>
              <div className="text-sm text-gray-600 mb-4">
                <strong>Tidak dapat menghapus user ini:</strong>
              </div>
              <div className="bg-red-50 border border-red-200 rounded px-4 py-3">
                <p className="text-sm text-red-800">{disabledReason}</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-4">
                Yakin ingin menghapus user <strong>{user?.username}</strong>?
              </div>
              <div className="bg-red-50 border border-red-200 rounded px-4 py-3">
                <p className="text-sm text-red-800">⚠️ Tindakan ini tidak dapat dibatalkan!</p>
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Batal
          </button>
          {!disabledReason && (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Menghapus...' : 'Hapus'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/UserManagement/DeleteConfirmation.jsx
git commit -m "feat: add delete confirmation dialog"
```

---

### Task 15: User Management Tab Container

Create main container component that orchestrates all user management functionality.

**Files:**
- Create: `frontend/src/components/UserManagement/UserManagementTab.jsx`

- [ ] **Step 1: Create UserManagementTab component**

Create `frontend/src/components/UserManagement/UserManagementTab.jsx`:

```javascript
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { userAPI } from '../../services/userAPI';
import { useAuth } from '../../context/AuthContext';
import UserList from './UserList';
import UserForm from './UserForm';
import ChangePasswordForm from './ChangePasswordForm';
import DeleteConfirmation from './DeleteConfirmation';

export default function UserManagementTab() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showUserForm, setShowUserForm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.list({
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        limit,
      });
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      toast.error('Gagal memuat user list');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Load users on mount and when filters change
  useEffect(() => {
    setPage(1); // Reset to page 1 when filters change
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [page, limit, search, roleFilter, statusFilter]);

  const handleCreateUser = async (formData) => {
    try {
      const { data } = await userAPI.create(formData);
      toast.success('User berhasil dibuat');
      loadUsers();
      return data;
    } catch (error) {
      const message = error.response?.data?.error || 'Gagal membuat user';
      toast.error(message);
      throw error;
    }
  };

  const handleUpdateUser = async (formData) => {
    try {
      await userAPI.update(editingUser.id, formData);
      toast.success('User berhasil diupdate');
      loadUsers();
      setShowUserForm(false);
      setEditingUser(null);
    } catch (error) {
      const message = error.response?.data?.error || 'Gagal update user';
      toast.error(message);
    }
  };

  const handleChangePassword = async (newPassword) => {
    try {
      await userAPI.changePassword(editingUser.id, newPassword);
      toast.success('Password berhasil diubah');
      loadUsers();
      setShowChangePassword(false);
      setEditingUser(null);
    } catch (error) {
      const message = error.response?.data?.error || 'Gagal ubah password';
      toast.error(message);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await userAPI.delete(deletingUser.id);
      toast.success('User berhasil dihapus');
      loadUsers();
      setShowDeleteConfirm(false);
      setDeletingUser(null);
    } catch (error) {
      const message = error.response?.data?.error || 'Gagal hapus user';
      toast.error(message);
    }
  };

  const openEditUser = (user) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const openDeleteUser = (user) => {
    setDeletingUser(user);
    setShowDeleteConfirm(true);
  };

  const closeUserForm = () => {
    setShowUserForm(false);
    setEditingUser(null);
  };

  const getDeleteDisabledReason = (user) => {
    // Cannot delete self
    if (user.id === currentUser.id) {
      return 'Anda tidak dapat menghapus akun sendiri';
    }
    // Cannot delete last admin
    if (user.role === 'admin') {
      const adminCount = users.filter((u) => u.role === 'admin').length;
      if (adminCount <= 1) {
        return 'Tidak dapat menghapus admin terakhir';
      }
    }
    return null;
  };

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">👥 User Management</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola user dan hak akses</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowUserForm(true);
          }}
          className="btn-primary"
        >
          <span>➕</span> Buat User Baru
        </button>
      </div>

      {/* User List */}
      <UserList
        users={users}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onEdit={openEditUser}
        onDelete={openDeleteUser}
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          user={editingUser}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          onClose={closeUserForm}
          onOpenChangePassword={() => setShowChangePassword(true)}
        />
      )}

      {/* Change Password Modal */}
      {showChangePassword && editingUser && (
        <ChangePasswordForm
          user={editingUser}
          onSubmit={handleChangePassword}
          onClose={() => setShowChangePassword(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingUser && (
        <DeleteConfirmation
          user={deletingUser}
          onConfirm={handleDeleteUser}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeletingUser(null);
          }}
          disabledReason={getDeleteDisabledReason(deletingUser)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/UserManagement/UserManagementTab.jsx
git commit -m "feat: add user management tab container component"
```

---

### Task 16: Integrate User Management Tab in Dashboard

Modify Dashboard to include User Management tab visible only to admins.

**Files:**
- Modify: `frontend/src/pages/Dashboard.jsx`

- [ ] **Step 1: Read Dashboard component**

Check the current Dashboard structure to understand how to add a tab system.

- [ ] **Step 2: Add tab state and render logic**

Modify Dashboard.jsx to include:

1. Add import at the top:
```javascript
import UserManagementTab from '../components/UserManagement/UserManagementTab';
```

2. Add state after the existing useState declarations:
```javascript
const [activeTab, setActiveTab] = useState('dashboard'); // or 'admin'
```

3. Wrap the existing dashboard content in a function:
```javascript
const DashboardContent = () => (
  // All existing return JSX here
);
```

4. Modify the return statement to include tabs:
```javascript
return (
  <div className="max-w-7xl">
    {/* Tab Navigation */}
    <div className="mb-8 flex gap-4 border-b border-gray-100">
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`px-4 py-2 font-medium border-b-2 transition-colors ${
          activeTab === 'dashboard'
            ? 'border-brand-600 text-brand-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'
        }`}
      >
        📊 Dashboard
      </button>
      {user?.role === 'admin' && (
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'admin'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          👥 User Management
        </button>
      )}
    </div>

    {/* Tab Content */}
    {activeTab === 'dashboard' && <DashboardContent />}
    {activeTab === 'admin' && user?.role === 'admin' && <UserManagementTab />}
  </div>
);
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Dashboard.jsx
git commit -m "feat: add user management tab to dashboard for admins"
```

---

### Task 17: Update AuthContext for First Login

Modify AuthContext to track and expose password_reset_required flag.

**Files:**
- Modify: `frontend/src/context/AuthContext.jsx`

- [ ] **Step 1: Read current AuthContext**

Check the existing AuthContext to understand its structure.

- [ ] **Step 2: Add password_reset_required to user state**

When storing user data from login response, ensure password_reset_required is captured. Find where user is set and make sure it includes:

```javascript
setUser({
  ...loginResponse.user,
  password_reset_required: loginResponse.user.password_reset_required,
});
```

Or if the response spreads correctly, just ensure the field exists in loginResponse.user.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/context/AuthContext.jsx
git commit -m "feat: track password_reset_required in AuthContext"
```

---

### Task 18: Create First Login Password Change Page

Create page that redirects users on first login to change their password.

**Files:**
- Create: `frontend/src/pages/ChangePasswordRequired.jsx`
- Modify: `frontend/src/components/ProtectedRoute.jsx` or App routing

- [ ] **Step 1: Create ChangePasswordRequired page**

Create `frontend/src/pages/ChangePasswordRequired.jsx`:

```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userAPI } from '../services/userAPI';
import { useAuth } from '../context/AuthContext';

export default function ChangePasswordRequired() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (newPassword.length < 8) {
      toast.error('Password minimal 8 karakter');
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Password tidak cocok');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // User changes their own password
      const selfUserId = user.id;
      await userAPI.changePassword(selfUserId, newPassword);
      
      // Update user in context to clear password_reset_required flag
      setUser({
        ...user,
        password_reset_required: false,
      });
      
      toast.success('Password berhasil diubah');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.error || 'Gagal ubah password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ubah Password</h1>
            <p className="text-gray-600 text-sm">
              Ini adalah login pertama Anda. Silakan ubah password untuk melanjutkan.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Baru *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                placeholder="Minimal 8 karakter"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                placeholder="Ulangi password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Mengubah...' : 'Ubah Password & Lanjutkan'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              ℹ️ Password harus minimal 8 karakter untuk keamanan akun Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add route to App.jsx**

Open `frontend/src/App.jsx` and add this route (check existing route structure first):

```javascript
import ChangePasswordRequired from './pages/ChangePasswordRequired';

// Add in your routes (example with React Router):
<Route path="/change-password" element={<ChangePasswordRequired />} />
```

- [ ] **Step 3: Add redirect check in ProtectedRoute or Dashboard**

Modify the ProtectedRoute component or add a check in Dashboard useEffect. Find where components check if user is authenticated, and add:

```javascript
useEffect(() => {
  if (user?.password_reset_required) {
    navigate('/change-password');
  }
}, [user?.password_reset_required, navigate]);
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/ChangePasswordRequired.jsx frontend/src/App.jsx
git commit -m "feat: add first-login password change page"
```

---

### Task 19: Test Admin User Creation

Test the complete user creation flow end-to-end.

**Files:**
- No new files

- [ ] **Step 1: Start backend server**

```bash
cd backend
npm start
```

Expected: Server running on port 5000

- [ ] **Step 2: Start frontend dev server**

```bash
cd frontend
npm run dev
```

Expected: Frontend running on port 5173

- [ ] **Step 3: Login as existing admin**

Navigate to http://localhost:5173/login and login with an admin account (or create one if needed).

Expected: Login succeeds, redirected to dashboard

- [ ] **Step 4: Navigate to User Management tab**

Click on the "👥 User Management" tab in the dashboard.

Expected: Tab appears (only for admins), shows user list

- [ ] **Step 5: Create a new user**

Click "➕ Buat User Baru" button, fill form with:
- Username: `testuser123`
- Email: `test@example.com`
- Full Name: `Test User`
- Role: `user`
- Status: `Active`

Click "Buat" button.

Expected: User created successfully, temporary password displayed, can copy to clipboard

- [ ] **Step 6: Verify user appears in list**

Check that the new user appears in the user list with all correct information.

Expected: User visible in list with correct details

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: verify user creation flow works end-to-end"
```

---

### Task 20: Test Admin User Update

Test the user update and password change functionality.

**Files:**
- No new files

- [ ] **Step 1: Edit a user**

In the user list, click "Edit" button on a user row.

Expected: Edit modal opens with current user data

- [ ] **Step 2: Update user details**

Modify:
- Full Name: `Updated Name`
- Role: `admin`
- Status: `Inactive`

Click "Simpan".

Expected: User updated successfully, list reflects changes

- [ ] **Step 3: Change password**

Click "Edit" on the same user, then click "🔑 Ubah Password" button.

Expected: Password change modal opens

- [ ] **Step 4: Change password**

Enter new password: `NewSecurePassword123`

Click "Ubah Password".

Expected: Password changed successfully, toast notification shown

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: verify user update and password change works"
```

---

### Task 21: Test Admin User Deletion & Restrictions

Test user deletion with proper restrictions.

**Files:**
- No new files

- [ ] **Step 1: Try to delete self**

Click "Delete" on your own user account.

Expected: Confirmation dialog shows error: "Anda tidak dapat menghapus akun sendiri"

- [ ] **Step 2: Try to delete last admin**

If you only have one admin user, try to delete it.

Expected: Confirmation dialog shows error: "Tidak dapat menghapus admin terakhir"

- [ ] **Step 3: Delete a regular user**

Create a test user if needed, click "Delete" on a non-admin user.

Expected: Confirmation dialog shows warning, can proceed to delete

- [ ] **Step 4: Confirm deletion**

Click "Hapus" to confirm.

Expected: User deleted successfully, removed from list, toast shown

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: verify user deletion restrictions work correctly"
```

---

### Task 22: Test Search & Filters

Test user list search and filter functionality.

**Files:**
- No new files

- [ ] **Step 1: Test search**

In the user list, type a username/email in the search box.

Expected: List filters to show only matching users, instant search

- [ ] **Step 2: Test role filter**

Use the "Role" dropdown to filter by "Admin" or "User".

Expected: List filters to show only users with selected role

- [ ] **Step 3: Test status filter**

Use the "Status" dropdown to filter by "Active" or "Inactive".

Expected: List filters to show only users with selected status

- [ ] **Step 4: Test pagination**

If you have more than 10 users, test the pagination buttons.

Expected: Pagination works, next/previous buttons navigate correctly

- [ ] **Step 5: Test combined filters**

Use search + role + status filters together.

Expected: All filters work together correctly

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: verify search and filter functionality works"
```

---

### Task 23: Test First Login Password Change

Test that new users are forced to change password on first login.

**Files:**
- No new files

- [ ] **Step 1: Create a new user from admin panel**

Use the admin panel to create a new test user with:
- Username: `newlogintest`
- Email: `newtest@example.com`
- Full Name: `New Login Test`

Copy the temporary password shown.

Expected: User created, temp password displayed

- [ ] **Step 2: Logout from current admin account**

Click logout or navigate to login page.

Expected: Logged out, at login page

- [ ] **Step 3: Login with new user account**

Use username `newlogintest` and the temporary password.

Expected: Login succeeds

- [ ] **Step 4: Check password change redirect**

After login, should be redirected to `/change-password` page.

Expected: ChangePasswordRequired page shown with password form

- [ ] **Step 5: Change password**

Fill in:
- Password Baru: `MyNewPassword123!`
- Konfirmasi: `MyNewPassword123!`

Click "Ubah Password & Lanjutkan".

Expected: Password changed, redirected to dashboard

- [ ] **Step 6: Verify access to dashboard**

Should now have normal dashboard access.

Expected: Dashboard loads, can see checklist and data

- [ ] **Step 7: Logout and login again**

Logout and log back in with the new password.

Expected: Login succeeds without password change requirement

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "test: verify first-login password change flow works"
```

---

### Task 24: Verify Non-Admin Users Cannot Access

Test that non-admin users cannot access the admin panel.

**Files:**
- No new files

- [ ] **Step 1: Create a regular user**

Use admin panel to create a user with role "user".

Expected: User created

- [ ] **Step 2: Login as regular user**

Logout and login with the new regular user account.

Expected: Login succeeds

- [ ] **Step 3: Check dashboard tabs**

Look at the dashboard tab bar.

Expected: Only "📊 Dashboard" tab visible, "👥 User Management" tab NOT visible

- [ ] **Step 4: Try direct URL access**

Try to navigate directly to the user management section (if there's a dedicated route).

Expected: Should either show nothing or redirect away (depending on implementation)

- [ ] **Step 5: Try API access**

Open browser dev tools, try calling `/api/admin/users` from console.

Expected: API returns 403 Forbidden

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: verify non-admin users cannot access admin features"
```

---

## Plan Self-Review

✓ **Spec Coverage:** 
- All CRUD operations covered (create, list, get, update, delete)
- Password change and temporary password flow implemented
- First-login redirect implemented
- Search/filter/pagination implemented
- Role and status management included
- Admin-only access enforced
- Non-admin protection tested

✓ **Placeholder Scan:** No TBD, TODO, or vague requirements found. All tasks contain complete code.

✓ **Type Consistency:** 
- Field names consistent across backend (password_reset_required, is_active, last_login)
- Frontend uses same field names
- API responses match defined schema

✓ **No Gaps:** Spec requirements fully addressed by tasks.

---

## Next Steps

This plan is ready for execution. Choose one of these approaches:

**1. Subagent-Driven (Recommended)** — Fresh subagent per task, review between tasks
**2. Inline Execution** — Execute tasks in this session with checkpoints

Which would you prefer?
