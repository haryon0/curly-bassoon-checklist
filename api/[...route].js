// Vercel catch-all route handler for API
// Routes all /api/* requests to the Express app

const app = require('./index.js');

export default function handler(req, res) {
  // Remove /api prefix before passing to Express
  req.url = req.url.replace(/^\/api/, '') || '/';

  // Handle the request through Express
  return app(req, res);
}
