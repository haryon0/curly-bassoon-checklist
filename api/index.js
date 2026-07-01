// Vercel Serverless Handler for Express.js
// This wraps the Express app for Vercel's serverless runtime

const express = require('express');
const cors = require('cors');

// Initialize Express app
const app = express();

// CORS configuration
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: frontendUrl,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database configuration using Supabase connection string
const { Pool } = require('pg');
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
db.on('connect', () => {
  console.log('✅ Database connected successfully');
});

db.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Store db connection in app for routes to access
app.locals.db = db;

// Import routes
const authRoutes = require('../backend/src/routes/auth.js');
const usersRoutes = require('../backend/src/routes/admin.js');
const templatesRoutes = require('../backend/src/routes/templates.js');
const checklistsRoutes = require('../backend/src/routes/checklist.js');

// Mount routes (without /api prefix - catch-all handler strips it)
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/templates', templatesRoutes);
app.use('/checklists', checklistsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel
module.exports = app;
