# Vercel + Supabase Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate checklist-management application from local development to production infrastructure (Vercel + Supabase) following approved design spec.

**Architecture:** 
- Frontend + Backend on Vercel (serverless)
- Database + Storage on Supabase
- Environment variables managed via Vercel dashboard
- No breaking code changes; adapter pattern for Express.js

**Tech Stack:** Vercel, Supabase, Express.js, React + Vite, PostgreSQL, JWT Auth

---

## Phase 1: Infrastructure Setup (Days 1-2)

### Task 1: Create Supabase Project

**Files:** None (setup via web interface)

- [ ] **Step 1: Go to Supabase**

Navigate to https://supabase.com and sign up/login

- [ ] **Step 2: Create new project**

Click "New Project" → Select region closest to users → Create database password (store securely) → Wait for project to initialize (2-3 minutes)

- [ ] **Step 3: Retrieve connection details**

In Supabase dashboard → Settings → Database → Connection string
Copy the full PostgreSQL connection string (will look like: `postgresql://postgres:PASSWORD@HOST:5432/postgres`)
Store this temporarily - you'll need it in Task 3

- [ ] **Step 4: Retrieve API credentials**

Go to Settings → API → Copy:
- Project URL (e.g., `https://xxxxx.supabase.co`)
- Anon public key (`eyJ...`)
- Service role key (`eyJ...`)

Store all three securely (you'll need them in Task 5)

---

### Task 2: Create Vercel Project

**Files:** None (setup via web interface)

- [ ] **Step 1: Go to Vercel**

Navigate to https://vercel.com and sign up/login with GitHub account

- [ ] **Step 2: Create new project from GitHub**

Click "Add New" → "Project" → Import the GitHub repo `haryon0/curly-bassoon-checklist`

- [ ] **Step 3: Configure project settings**

Name: `checklist-management` (or your preferred name)
Framework preset: `Other` (we'll configure manually)
Root directory: `./` (default)
Build command: (leave empty for now)
Output directory: (leave empty for now)
Environment variables: (we'll add these in Task 5)

Click "Deploy" (it will fail initially, that's expected)

- [ ] **Step 4: Verify project dashboard**

Go to https://vercel.com/dashboard → Find your project → Note the project URL (e.g., `https://checklist-management-xxxxx.vercel.app`)

---

### Task 3: Migrate Database Schema to Supabase

**Files:** None (executing existing migration script)

- [ ] **Step 1: Test local database connection**

In your terminal:
```bash
cd "d:\Antigravity\checklist v2\checklist-management\backend"
npm install
```

- [ ] **Step 2: Update migration script temporarily**

Open `backend/src/config/migrate.js` and check what database it connects to. 
We need to run this against Supabase, not localhost.

Create a temporary `.env.supabase` file in backend/:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres
```

Replace `YOUR_PASSWORD` and `YOUR_HOST` from the Supabase connection string you saved in Task 1, Step 3.

- [ ] **Step 3: Run migration against Supabase**

```bash
cd "d:\Antigravity\checklist v2\checklist-management\backend"
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres" node src/config/migrate.js
```

Expected output: Tables created (users, templates, checklists, photos, annotations)

- [ ] **Step 4: Verify schema in Supabase**

Go to Supabase dashboard → SQL Editor → Run:
```sql
\dt
```

Expected: List of tables (public.users, public.templates, etc.)

- [ ] **Step 5: Commit**

```bash
cd "d:\Antigravity\checklist v2\checklist-management"
git add docs/superpowers/plans/2026-07-01-vercel-supabase-migration-implementation.md
git commit -m "chore: database schema migrated to Supabase

- Applied existing migrations to Supabase PostgreSQL
- All tables created and verified
- Connection tested from backend

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
git push origin main
```

---

### Task 4: Setup Vercel Environment Variables

**Files:** None (configured via Vercel dashboard)

- [ ] **Step 1: Go to Vercel project settings**

https://vercel.com/dashboard → Select your project → Settings → Environment Variables

- [ ] **Step 2: Add Supabase Database URL**

Click "Add" → Name: `DATABASE_URL`
Value: `postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres`
Select environments: `Production`, `Preview`, `Development`
Click "Save"

- [ ] **Step 3: Add JWT Secret**

Click "Add" → Name: `JWT_SECRET`
Value: Generate a random secret (or use existing one from `.env`)
Select: `Production`, `Preview`, `Development`
Click "Save"

- [ ] **Step 4: Add JWT expiry**

Click "Add" → Name: `JWT_EXPIRES_IN`
Value: `7d`
Select: All environments
Click "Save"

- [ ] **Step 5: Add upload configuration**

Add these two variables:

Name: `MAX_PHOTO_SIZE_MB` → Value: `5` → Save
Name: `MAX_PHOTOS` → Value: `20` → Save

- [ ] **Step 6: Add frontend URL**

Name: `FRONTEND_URL`
Value: `https://checklist-management-xxxxx.vercel.app` (use your actual Vercel domain)
Select: All environments
Click "Save"

- [ ] **Step 7: Verify all variables are set**

Go back to Environment Variables page. Should see 6 variables listed.

---

## Phase 2: Backend Deployment (Days 3-4)

### Task 5: Create Vercel Serverless Adapter for Express.js

**Files:**
- Create: `backend/api/index.js`
- Modify: `backend/src/app.js`

- [ ] **Step 1: Understand current Express.js structure**

Open `backend/src/app.js` and read the entire file to understand how Express app is initialized.
Note: It should export the Express app instance or create one internally.

- [ ] **Step 2: Create api directory**

```bash
cd "d:\Antigravity\checklist v2\checklist-management"
mkdir -p api
```

- [ ] **Step 3: Create Vercel handler in api/index.js**

Create file `api/index.js` with:

```javascript
// Vercel Serverless Handler for Express.js
// This wraps the Express app for Vercel's serverless runtime

const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();

// CORS configuration
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: frontendUrl,
  credentials: true,
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database configuration
const { Pool } = require('pg');
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Supabase
});

// Test database connection
db.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Store db connection in app for routes to access
app.locals.db = db;

// Import routes (adjust paths based on your structure)
const authRoutes = require('../src/routes/auth.js');
const usersRoutes = require('../src/routes/users.js');
const templatesRoutes = require('../src/routes/templates.js');
const checklistsRoutes = require('../src/routes/checklists.js');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/checklists', checklistsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Export for Vercel
module.exports = app;
```

- [ ] **Step 4: Create Vercel route handler**

Create file `api/[...route].js`:

```javascript
// Vercel catch-all route handler for API
// Routes all /api/* requests to the Express app

import app from './index.js';

export default function handler(req, res) {
  // Remove /api prefix before passing to Express
  req.url = req.url.replace(/^\/api/, '') || '/';
  
  // Handle the request through Express
  return app(req, res);
}
```

- [ ] **Step 5: Update backend package.json**

Check if `backend/package.json` has these dependencies. If not, they should be installed already:
- `express`
- `pg` (PostgreSQL client)
- `cors`

If missing, run:
```bash
cd backend
npm install express pg cors
```

- [ ] **Step 6: Create vercel.json configuration**

Create file `vercel.json` in project root:

```json
{
  "buildCommand": "cd backend && npm install",
  "outputDirectory": "api",
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret",
    "JWT_EXPIRES_IN": "@jwt_expires_in",
    "MAX_PHOTO_SIZE_MB": "@max_photo_size_mb",
    "MAX_PHOTOS": "@max_photos",
    "FRONTEND_URL": "@frontend_url"
  }
}
```

- [ ] **Step 7: Test locally with Vercel CLI**

```bash
npm install -g vercel
cd "d:\Antigravity\checklist v2\checklist-management"
vercel dev
```

This starts a local server simulating Vercel environment.
Visit: http://localhost:3000/api/health
Expected: `{"status":"ok","timestamp":"..."}`

Press Ctrl+C to stop.

- [ ] **Step 8: Commit**

```bash
cd "d:\Antigravity\checklist v2\checklist-management"
git add api/index.js api/[...route].js vercel.json backend/package.json
git commit -m "feat: implement Vercel serverless adapter for Express backend

- Create Express app wrapper for Vercel serverless runtime
- Configure CORS, database connection, route mounting
- Add Vercel configuration for build/environment
- Add health check endpoint for verification
- Tested locally with vercel dev

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
git push origin main
```

---

### Task 6: Update Backend Routes to Use Supabase Connection

**Files:**
- Modify: `backend/src/routes/auth.js`
- Modify: `backend/src/routes/users.js`
- Modify: `backend/src/routes/templates.js`
- Modify: `backend/src/routes/checklists.js`

- [ ] **Step 1: Check how routes currently access database**

Open each route file and look for how they currently connect to database.
They likely use a local database pool instance or connection logic.

- [ ] **Step 2: Update route imports**

In each route file, change from local db connection to using app.locals.db passed from handler.

Example - in route file (e.g., `auth.js`):

Old code:
```javascript
const db = require('../config/db.js');
// or
const { Pool } = require('pg');
const db = new Pool({ ... });
```

New code:
```javascript
// Database will be injected via app.locals.db from Vercel handler
// Access it in route handlers via req.app.locals.db
```

Then update route handlers:

Old:
```javascript
router.post('/login', (req, res) => {
  db.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
    // ...
  });
});
```

New:
```javascript
router.post('/login', (req, res) => {
  const db = req.app.locals.db;
  db.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
    // ...
  });
});
```

- [ ] **Step 3: Test auth route**

```bash
cd "d:\Antigravity\checklist v2\checklist-management"
vercel dev
```

Open new terminal and test:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

Expected: Either successful login response or auth error (not database connection error)

- [ ] **Step 4: Test other routes similarly**

```bash
# Test users route
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test templates route
curl http://localhost:3000/api/templates

# Test checklists route
curl http://localhost:3000/api/checklists
```

All should connect to Supabase database successfully.

- [ ] **Step 5: Stop local server**

Press Ctrl+C in vercel dev terminal

- [ ] **Step 6: Commit**

```bash
cd "d:\Antigravity\checklist v2\checklist-management"
git add backend/src/routes/*.js
git commit -m "refactor: update routes to use injected Supabase connection

- Routes now access database via req.app.locals.db
- Removed local database initialization from route files
- Works with Vercel serverless environment
- All routes tested and verified

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
git push origin main
```

---

### Task 7: Deploy Backend to Vercel

**Files:** None (deployment via git push)

- [ ] **Step 1: Trigger Vercel deployment**

Push to main branch (you've already done this):
```bash
cd "d:\Antigravity\checklist v2\checklist-management"
git push origin main
```

Vercel automatically detects push and starts deployment.

- [ ] **Step 2: Monitor deployment**

Go to https://vercel.com/dashboard → Select project → Deployments tab
Watch the build progress. It should:
1. Install backend dependencies
2. Build serverless functions
3. Deploy to Vercel edge network

Expected: Green checkmark after 2-3 minutes

- [ ] **Step 3: Test live API endpoint**

Once deployment completes, get your project URL from Vercel dashboard.
Replace `https://checklist-management-xxxxx.vercel.app` below:

```bash
curl https://checklist-management-xxxxx.vercel.app/api/health
```

Expected: `{"status":"ok","timestamp":"..."}`

- [ ] **Step 4: Test database connectivity**

```bash
curl https://checklist-management-xxxxx.vercel.app/api/templates
```

Expected: Returns template list (empty array if no templates yet) - confirms database is connected

- [ ] **Step 5: Verify environment variables in Vercel**

Go to Vercel dashboard → Project Settings → Environment Variables
Confirm all 6 variables are listed and marked as available

No additional commit needed (deployment already committed).

---

## Phase 3: Frontend Deployment (Day 5)

### Task 8: Update Frontend Environment for Production

**Files:**
- Modify: `frontend/.env.production`
- Modify: `frontend/src/services/api.js`

- [ ] **Step 1: Get Vercel project URL**

From Vercel dashboard, your project URL is something like: `https://checklist-management-xxxxx.vercel.app`

- [ ] **Step 2: Update frontend environment**

Edit `frontend/.env.production`:

```
VITE_API_URL=https://checklist-management-xxxxx.vercel.app/api
```

Replace `checklist-management-xxxxx` with your actual Vercel domain.

- [ ] **Step 3: Verify api.js uses environment variable**

Open `frontend/src/services/api.js` and check that it reads API URL from `import.meta.env.VITE_API_URL`

Example (it should look something like this):
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const checklistAPI = {
  list: (params) => fetch(`${API_URL}/checklists`, { ... }),
  // ...
};
```

If not, update it to use the environment variable.

- [ ] **Step 4: Test build locally**

```bash
cd "d:\Antigravity\checklist v2\checklist-management\frontend"
npm run build
```

Expected: Build completes successfully, creates `dist/` folder with HTML/JS/CSS

- [ ] **Step 5: Verify dist folder**

```bash
ls -la frontend/dist/
```

Should see: `index.html`, `assets/` folder with JS/CSS bundles

- [ ] **Step 6: Commit**

```bash
cd "d:\Antigravity\checklist v2\checklist-management"
git add frontend/.env.production frontend/src/services/api.js
git commit -m "config: update frontend for Vercel production environment

- Set VITE_API_URL to Vercel backend endpoint
- Frontend will call https://checklist-management-xxxxx.vercel.app/api
- Verified build works locally

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
git push origin main
```

---

### Task 9: Configure Vercel Frontend Build Settings

**Files:** None (configured via Vercel dashboard)

- [ ] **Step 1: Go to Vercel project settings**

https://vercel.com/dashboard → Select your project → Settings

- [ ] **Step 2: Update build settings**

Find "Build & Development Settings" section:

- Framework Preset: `Vite`
- Build Command: `cd frontend && npm run build`
- Output Directory: `frontend/dist`
- Development Command: `cd frontend && npm run dev`
- Install Command: `npm install`

Save changes.

- [ ] **Step 3: Set environment variable for frontend build**

Go to Environment Variables (if not already there) and add:
- Name: `VITE_API_URL`
- Value: `https://checklist-management-xxxxx.vercel.app/api`
- Select environments: `Production`, `Preview`, `Development`

- [ ] **Step 4: Redeploy to apply new build settings**

Go to Deployments tab → Click on latest deployment → Click "Redeploy"

Wait for deployment to complete (should be faster now, ~1-2 minutes)

- [ ] **Step 5: Test deployed frontend**

Visit: `https://checklist-management-xxxxx.vercel.app`

You should see:
- Login page loads
- No console errors
- Can see the app interface

No additional commit (redeploy doesn't require commit).

---

### Task 10: End-to-End Frontend + Backend Integration Test

**Files:** None (testing existing deployment)

- [ ] **Step 1: Test login flow**

Visit: `https://checklist-management-xxxxx.vercel.app/login`

Try login with test credentials (if they exist in database).
Watch browser DevTools → Network tab to confirm API calls go to your Vercel endpoint.

- [ ] **Step 2: Test API connectivity**

In browser console (F12 → Console):
```javascript
fetch('https://checklist-management-xxxxx.vercel.app/api/health')
  .then(r => r.json())
  .then(data => console.log('API OK:', data))
  .catch(e => console.error('API Error:', e))
```

Expected: `API OK: {status: "ok", timestamp: "..."}`

- [ ] **Step 3: Test dashboard load (if already logged in)**

After successful login, navigate to dashboard.
Verify:
- Data loads from backend
- No CORS errors in console
- API responses are fast (< 500ms)

- [ ] **Step 4: Check Vercel logs**

Go to Vercel dashboard → Deployments → Latest → Logs
Look for any errors or warnings.
Should see successful database connections, no exceptions.

- [ ] **Step 5: Note any issues**

If there are errors:
- CORS error → Update CORS settings in api/index.js
- Database error → Check DATABASE_URL in Vercel env vars
- API 404 → Check routes are mounted correctly

Fix issues and recommit if needed.

---

## Phase 4: File Storage Migration (Days 6-7)

### Task 11: Create Supabase Storage Buckets

**Files:** None (setup via Supabase web interface)

- [ ] **Step 1: Go to Supabase Storage**

Supabase dashboard → Storage → Buckets tab

- [ ] **Step 2: Create templates bucket**

Click "New bucket"
- Name: `templates`
- Public: Yes (so files can be downloaded)
- Click "Create bucket"

- [ ] **Step 3: Create checklists bucket**

Click "New bucket"
- Name: `checklists`
- Public: Yes
- Click "Create bucket"

- [ ] **Step 4: Create photos bucket**

Click "New bucket"
- Name: `photos`
- Public: Yes
- Click "Create bucket"

- [ ] **Step 5: Verify all three buckets exist**

Go to Storage → Buckets, should see three empty buckets: `templates`, `checklists`, `photos`

---

### Task 12: Update Backend File Upload/Download Routes

**Files:**
- Modify: `backend/src/routes/checklists.js` (or file handling routes)
- Create: `backend/src/config/supabase.js`

- [ ] **Step 1: Create Supabase client configuration**

Create file `backend/src/config/supabase.js`:

```javascript
// Supabase client for file storage operations

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = supabase;
```

- [ ] **Step 2: Update route to use Supabase Storage for uploads**

In your file upload route (likely in `checklists.js` or similar), update upload handler:

Old code (using local multer):
```javascript
router.post('/upload', multer({ dest: './uploads' }).single('file'), (req, res) => {
  const filePath = req.file.path;
  res.json({ filename: req.file.filename });
});
```

New code (using Supabase Storage):
```javascript
const supabase = require('../config/supabase.js');

router.post('/upload', multer({ storage: multer.memoryStorage() }).single('file'), async (req, res) => {
  try {
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const { data, error } = await supabase.storage
      .from('checklists')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (error) throw error;
    
    res.json({ 
      filename: fileName,
      path: data.path,
      url: supabase.storage.from('checklists').getPublicUrl(data.path).data.publicUrl
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

- [ ] **Step 3: Update route to use Supabase Storage for downloads**

Old code (serving from disk):
```javascript
router.get('/download/:filename', (req, res) => {
  const filePath = path.join('./uploads', req.params.filename);
  res.download(filePath);
});
```

New code (using Supabase signed URLs):
```javascript
router.get('/download/:filename', async (req, res) => {
  try {
    const { data, error } = await supabase.storage
      .from('checklists')
      .createSignedUrl(req.params.filename, 3600); // 1 hour expiry

    if (error) throw error;
    
    res.redirect(data.signedUrl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

- [ ] **Step 4: Add Supabase credentials to Vercel**

Go to Vercel dashboard → Settings → Environment Variables
Add:
- Name: `SUPABASE_URL` → Value: `https://xxxxx.supabase.co` (from Supabase dashboard)
- Name: `SUPABASE_KEY` → Value: Your anon public key
- Select: All environments

- [ ] **Step 5: Install Supabase client library**

```bash
cd "d:\Antigravity\checklist v2\checklist-management\backend"
npm install @supabase/supabase-js
```

- [ ] **Step 6: Test locally**

```bash
cd "d:\Antigravity\checklist v2\checklist-management"
vercel dev
```

Create a test file and try upload:
```bash
curl -F "file=@test.txt" http://localhost:3000/api/uploads/upload
```

Expected: File uploaded to Supabase Storage, response includes filename and signed URL

- [ ] **Step 7: Commit**

```bash
cd "d:\Antigravity\checklist v2\checklist-management"
git add backend/src/config/supabase.js backend/src/routes/*.js backend/package.json
git commit -m "feat: migrate file storage to Supabase Storage

- Created Supabase client configuration
- Updated upload routes to store in Supabase buckets
- Updated download routes to generate signed URLs
- Removed local file system dependencies
- Tested with local vercel dev environment

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
git push origin main
```

---

### Task 13: Deploy and Test File Storage

**Files:** None (deployment via git push)

- [ ] **Step 1: Trigger Vercel redeploy**

Changes are automatically deployed when you push to main. Check Vercel dashboard for deployment status.

- [ ] **Step 2: Test file upload in production**

Visit your deployed app: `https://checklist-management-xxxxx.vercel.app`

Navigate to any flow that uploads files (e.g., create checklist → upload photo).
Upload a test file.

Expected:
- File uploads successfully
- No console errors
- File appears in Supabase Storage bucket (check via Supabase dashboard)

- [ ] **Step 3: Test file download**

Try downloading the file from the app.
Verify:
- Link works and downloads file
- Download is fast (< 2 seconds)
- No signed URL expiry errors

- [ ] **Step 4: Verify Supabase Storage buckets**

Go to Supabase dashboard → Storage → Buckets
Click each bucket to see files that were uploaded.
Should see test files there.

- [ ] **Step 5: Verify no local uploads directory is used**

Check that no files are being stored in `backend/uploads/` on the server.
Only Supabase Storage should have files.

---

## Phase 5: Production Hardening (Days 7+)

### Task 14: Setup Error Tracking and Monitoring

**Files:**
- Create: `backend/src/config/sentry.js`
- Modify: `api/index.js`

- [ ] **Step 1: Choose error tracking service**

Option A: Sentry (recommended)
- Free tier: 5,000 events/month
- Sign up at https://sentry.io

Option B: Vercel Error Tracking (built-in, free)
- Built into Vercel dashboard, no setup needed

Using **Sentry** (Option A):

- [ ] **Step 2: Create Sentry project**

Go to sentry.io → Create Account → New Project
Select platform: Node.js
Get your DSN (looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)

- [ ] **Step 3: Add Sentry to Vercel environment**

Vercel dashboard → Settings → Environment Variables
Add:
- Name: `SENTRY_DSN` → Value: Your Sentry DSN
- Select: All environments

- [ ] **Step 4: Create Sentry configuration**

Create `backend/src/config/sentry.js`:

```javascript
// Sentry error tracking configuration

const Sentry = require("@sentry/node");

function initSentry(app) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.errorHandler());
}

module.exports = { initSentry, Sentry };
```

- [ ] **Step 5: Install Sentry SDK**

```bash
cd "d:\Antigravity\checklist v2\checklist-management\backend"
npm install @sentry/node
```

- [ ] **Step 6: Integrate Sentry into API handler**

Update `api/index.js` to initialize Sentry:

At the top:
```javascript
const { initSentry } = require('../src/config/sentry.js');
// ... other imports ...

// Initialize Sentry
if (process.env.SENTRY_DSN) {
  initSentry(app);
}

// ... rest of app initialization ...
```

- [ ] **Step 7: Test error tracking**

Create a test error endpoint temporarily:

In `api/index.js`:
```javascript
app.get('/api/test-error', (req, res) => {
  throw new Error('Test error for Sentry');
});
```

Visit: `https://checklist-management-xxxxx.vercel.app/api/test-error`

Go to Sentry dashboard → Issues, should see the test error

- [ ] **Step 8: Remove test endpoint**

Delete the `/api/test-error` route from `api/index.js`

- [ ] **Step 9: Commit**

```bash
cd "d:\Antigravity\checklist v2\checklist-management"
git add backend/src/config/sentry.js api/index.js backend/package.json
git commit -m "feat: add Sentry error tracking for production

- Initialize Sentry SDK in serverless handler
- Capture unhandled errors and exceptions
- Environment-aware configuration
- Tested with manual error injection

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
git push origin main
```

---

### Task 15: Security Audit and CORS Configuration

**Files:**
- Modify: `api/index.js`

- [ ] **Step 1: Review current CORS settings**

In `api/index.js`, CORS should allow:
```javascript
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: frontendUrl,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
```

This restricts to only your frontend domain. Good!

- [ ] **Step 2: Add request size limits**

Ensure these are in place:
```javascript
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

This prevents malicious large payloads.

- [ ] **Step 3: Add security headers**

Install helmet (security headers middleware):
```bash
cd "d:\Antigravity\checklist v2\checklist-management\backend"
npm install helmet
```

Update `api/index.js` to use helmet:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

- [ ] **Step 4: Add request rate limiting**

Install express-rate-limit:
```bash
npm install express-rate-limit
```

Add to `api/index.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

- [ ] **Step 5: Update .env with security settings**

No specific env vars needed, but verify JWT_SECRET is strong (not default).
If weak, update in Vercel dashboard.

- [ ] **Step 6: Test CORS from different origin**

```bash
curl -X OPTIONS https://checklist-management-xxxxx.vercel.app/api/health \
  -H "Origin: https://evil.com" \
  -v
```

Expected: No `Access-Control-Allow-Origin` header (request blocked)

```bash
curl -X OPTIONS https://checklist-management-xxxxx.vercel.app/api/health \
  -H "Origin: https://checklist-management-xxxxx.vercel.app" \
  -v
```

Expected: `Access-Control-Allow-Origin: https://checklist-management-xxxxx.vercel.app` (request allowed)

- [ ] **Step 7: Commit**

```bash
cd "d:\Antigravity\checklist v2\checklist-management"
git add api/index.js backend/package.json
git commit -m "security: add helmet, rate limiting, and CORS hardening

- Install helmet for security headers (X-Frame-Options, CSP, etc.)
- Add rate limiting (100 requests per 15 minutes)
- Strict CORS policy (only allow frontend domain)
- Request size limits to prevent DoS
- Tested CORS origin validation

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
git push origin main
```

---

### Task 16: Performance Optimization and Monitoring

**Files:** None (monitoring via Vercel + Supabase dashboards)

- [ ] **Step 1: Check Vercel performance metrics**

Go to https://vercel.com/dashboard → Select project → Analytics tab

Monitor:
- Page Load Time
- Core Web Vitals (LCP, FID, CLS)
- Function execution time

Expected: All green (acceptable performance)

- [ ] **Step 2: Check Supabase database performance**

Supabase dashboard → Database → Performance
Look for slow queries or connection issues.

- [ ] **Step 3: Monitor storage costs**

Supabase dashboard → Billing
Check file storage usage and egress costs.

If costs are high (unexpected), review:
- File sizes being uploaded
- Delete old/test files
- Consider compression

- [ ] **Step 4: Enable Vercel caching**

In `vercel.json`, add cache control headers:
```json
{
  "headers": [
    {
      "source": "/api/templates",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ]
}
```

- [ ] **Step 5: Setup uptime monitoring (optional)**

Use free service like Uptime Robot:
- Go to https://uptimerobot.com
- Add monitor for `https://checklist-management-xxxxx.vercel.app/api/health`
- Check every 5 minutes
- Get alerts if down

- [ ] **Step 6: Document monitoring setup**

Create a file `docs/operations/monitoring.md`:

```markdown
# Production Monitoring Setup

## Error Tracking
- Service: Sentry
- Dashboard: https://sentry.io/organizations/your-org/issues/
- Alert: Email on errors

## Performance
- Vercel Analytics: https://vercel.com/dashboard/checklist-management/analytics
- Supabase Metrics: https://app.supabase.com/project/your-project/settings/reports

## Uptime
- Service: Uptime Robot
- Check interval: 5 minutes
- Alert: Email if down > 5 minutes

## Cost Monitoring
- Vercel: Free tier included
- Supabase: Free tier 500MB storage, $5/month per 1GB
- Monitor at: https://app.supabase.com/project/your-project/settings/billing
```

- [ ] **Step 7: Commit**

```bash
cd "d:\Antigravity\checklist v2\checklist-management"
git add docs/operations/monitoring.md
git commit -m "docs: add production monitoring and performance guide

- Document Sentry error tracking setup
- Document Vercel analytics and performance monitoring
- Document Supabase metrics and cost tracking
- Add uptime monitoring setup instructions

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
git push origin main
```

---

### Task 17: Rollback Plan and Disaster Recovery

**Files:** None (documentation only)

- [ ] **Step 1: Create rollback documentation**

Create `docs/operations/rollback.md`:

```markdown
# Rollback Procedures

## Quick Rollback to Previous Deployment

If production is broken, quickly revert to last known good version:

### Via Vercel Dashboard
1. Go to https://vercel.com/dashboard → Deployments
2. Find the last successful deployment (green checkmark)
3. Click on it → Click "Promote to Production"
4. Done! Should be live in 10 seconds

### Via Git
```bash
git log --oneline origin/main | head -5
git revert <broken-commit-hash>
git push origin main
# Vercel auto-deploys, watch deployment status
```

## Database Rollback

If database is corrupted:

### Backup & Restore
1. Go to Supabase dashboard → Backups
2. Find last good backup (should be automatic daily)
3. Click "Restore" → Confirm

### Manual Restore (if no backup)
```sql
-- In Supabase SQL Editor
-- Restore from transaction logs (if enabled)
-- Or re-run migrations from scratch
```

## File Storage Rollback

If files are corrupted/deleted:

1. Supabase Storage has automatic versioning
2. Go to Supabase → Storage → Buckets
3. Files show modification history
4. Click file → "Restore from backup" (if available)

## Testing Rollback

Do this monthly:
```bash
# 1. Promote previous deployment
# 2. Test: curl https://checklist-management-xxxxx.vercel.app/api/health
# 3. Run full smoke test flow
# 4. Promote latest deployment back
```

## Disaster Recovery Checklist

- [ ] Database backups: Enabled
- [ ] File storage: Protected
- [ ] Environment variables: Stored securely
- [ ] Monitoring: Active
- [ ] Team: Knows rollback procedure
- [ ] Monthly rollback test: Scheduled
```

- [ ] **Step 2: Create incident response guide**

Create `docs/operations/incident-response.md`:

```markdown
# Incident Response Guide

## Critical Issues (Needs Immediate Action)

### API Down (5xx errors)
1. Check Vercel logs: https://vercel.com/dashboard → Deployments → Latest → Logs
2. Check error tracking: https://sentry.io → Issues
3. Check database: Supabase → Health
4. Rollback to previous deployment if needed

### Database Connection Errors
1. Check Supabase status: https://status.supabase.com
2. Check credentials in Vercel env vars
3. Verify DATABASE_URL is correct
4. Restart serverless functions (redeploy)

### File Upload Failures
1. Check Supabase Storage status
2. Check bucket permissions
3. Verify SUPABASE_KEY is valid
4. Check file size limits (max 50MB)

## Non-Critical Issues

### Performance Degradation
1. Check Vercel Analytics for bottlenecks
2. Check Supabase connection pool
3. Check query performance (slow queries)
4. Enable caching if not already

### CORS Errors
1. Check FRONTEND_URL in Vercel env vars
2. Verify browser origin matches FRONTEND_URL
3. Check CORS headers in api/index.js

## Escalation
- Critical: Contact Vercel support, Supabase support
- Non-critical: Log in Sentry, schedule fix
```

- [ ] **Step 3: Test rollback procedure**

```bash
# 1. Note current deployment URL
CURRENT_DEPLOY=$(curl -s https://checklist-management-xxxxx.vercel.app/api/health | head -1)
echo "Current: $CURRENT_DEPLOY"

# 2. Go to Vercel dashboard and promote previous deployment
# (Do this manually via dashboard for safety)

# 3. Wait 30 seconds for deployment

# 4. Test new deployment
curl https://checklist-management-xxxxx.vercel.app/api/health

# 5. Promote latest back to production
# (Do this manually via dashboard)

# 6. Wait 30 seconds, verify it's back

echo "Rollback test complete"
```

- [ ] **Step 4: Commit documentation**

```bash
cd "d:\Antigravity\checklist v2\checklist-management"
git add docs/operations/rollback.md docs/operations/incident-response.md
git commit -m "docs: add rollback and incident response procedures

- Document Vercel rollback via dashboard
- Document Vercel rollback via git
- Document database restore procedures
- Document file storage recovery
- Add incident response guide for common issues
- Monthly rollback test procedure

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
git push origin main
```

---

## Post-Migration Verification Checklist

Run this after all phases are complete:

- [ ] **Frontend loads:** Visit `https://checklist-management-xxxxx.vercel.app` → App loads
- [ ] **Login works:** Enter credentials → Redirected to dashboard
- [ ] **API connects:** All API calls complete successfully
- [ ] **Database works:** Create/read/update/delete data → Persists correctly
- [ ] **File upload:** Upload file → Appears in Supabase Storage bucket
- [ ] **File download:** Download file → Works without errors
- [ ] **Error tracking:** Intentional error → Appears in Sentry dashboard
- [ ] **Performance:** Core Web Vitals green in Vercel Analytics
- [ ] **Security:** CORS blocks cross-origin requests
- [ ] **Rate limiting:** 100+ rapid requests → Request gets limited
- [ ] **Monitoring:** Uptime Robot shows 100% uptime
- [ ] **Costs:** Verify within budget (free tier for both Vercel + Supabase)

---

## Summary

✅ **Complete migration path from local → production**
- Infrastructure setup: Days 1-2
- Backend deployment: Days 3-4
- Frontend deployment: Day 5
- File storage: Days 6-7
- Hardening: Day 7+

✅ **All critical functionality verified**
✅ **Production monitoring in place**
✅ **Rollback procedures documented**
✅ **Ready for production traffic**

