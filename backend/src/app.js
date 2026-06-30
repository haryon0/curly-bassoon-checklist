require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const templateRoutes = require('./routes/templates');
const checklistRoutes = require('./routes/checklist');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure required directories exist
const dirs = [
  process.env.UPLOAD_DIR || 'uploads',
  path.join(process.env.UPLOAD_DIR || 'uploads', 'templates'),
  path.join(process.env.UPLOAD_DIR || 'uploads', 'photos'),
  process.env.GENERATED_DIR || 'generated',
];
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/checklist', checklistRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: `File too large. Maximum size is ${process.env.MAX_PHOTO_SIZE_MB || 5}MB per photo.` });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ error: `Too many files. Maximum is ${process.env.MAX_PHOTOS || 20} photos.` });
  }
  if (err.message) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Checklist Management API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
