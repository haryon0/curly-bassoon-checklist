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
