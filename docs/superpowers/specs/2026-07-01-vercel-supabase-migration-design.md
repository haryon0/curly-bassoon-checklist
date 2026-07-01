# Migration Design: Local → Vercel + Supabase

**Date:** 2026-07-01  
**Timeline:** ASAP (1-2 weeks, phased approach)  
**Status:** Design approved  
**Scope:** Complete migration of checklist-management app to production cloud infrastructure

---

## Executive Summary

Migrate checklist-management application from local development setup to production:
- **Frontend:** React app → Vercel (auto-deployed from GitHub)
- **Backend:** Express.js server → Vercel Serverless Functions
- **Database:** Local PostgreSQL → Supabase PostgreSQL (managed)
- **File Storage:** Local `/uploads` → Supabase Storage (buckets)

**Key principle:** Minimal code changes. Leverage existing architecture compatibility (Express.js → serverless adapter, PostgreSQL schema unchanged).

---

## Current Architecture

**Frontend:**
- React + Vite
- Runs on `localhost:5173` in development
- Built frontend in `frontend/dist/`

**Backend:**
- Express.js server (`src/app.js`)
- Runs on `localhost:5000`
- REST API with JWT authentication
- Dependencies: `express`, `pg`, `multer`, `pdf-lib`, `sharp`, `bcryptjs`, `jsonwebtoken`

**Database:**
- PostgreSQL 8.11.3 (`checklist_db`)
- Running on `localhost:5432`
- Schema: users, templates, checklists, photos, annotations
- Current state: Empty (fresh start)

**File Storage:**
- Local directories: `/backend/uploads/` (for PDFs, photos)
- Multer-based upload handling

**Authentication:**
- JWT tokens (7-day expiry)
- Stored in browser localStorage
- Backend validates via `JWT_SECRET`

---

## Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL (CDN)                          │
├─────────────────────────────────────────────────────────────┤
│ Frontend                    │ Backend API                    │
│ React + Vite               │ Serverless Functions           │
│ Auto-deploy from GitHub    │ Express.js adapter             │
│ Served via Vercel CDN      │ Routes to /api/[...route]      │
└──────────┬──────────────────────────────┬────────────────────┘
           │                              │
           └──────────────┬───────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
    ┌───▼──────────────┐         ┌──────────▼──────┐
    │ SUPABASE         │         │ SUPABASE STORAGE│
    │ PostgreSQL       │         │ (File buckets)  │
    │ - checklist_db   │         │ - templates     │
    │ - users          │         │ - checklists    │
    │ - templates      │         │ - photos        │
    │ - checklists     │         └─────────────────┘
    │ - photos         │
    └──────────────────┘

All secrets & env vars managed in Vercel Environment Variables
```

---

## Detailed Approach

### 1. Frontend Migration (Vercel)

**Steps:**
1. Connect GitHub repo to Vercel
2. Set environment variable: `VITE_API_URL=https://[project].vercel.app/api`
3. Vercel auto-detects Vite, builds frontend automatically
4. No code changes needed

**Result:** Frontend deployed to `https://[project].vercel.app`

---

### 2. Backend Migration (Vercel Serverless)

**Current Express.js structure:**
```
backend/
├── src/
│   ├── app.js (Express app initialization)
│   ├── config/
│   │   └── db.js (Database connection)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── templates.js
│   │   └── checklists.js
│   └── middleware/
│       └── auth.js
└── package.json
```

**Vercel serverless structure:**
```
api/
├── index.js (Serverless handler + Express app)
└── [...route].js (Route catch-all for API)
```

**Adaptation strategy:**
- Create `/api/index.js` that initializes Express app once
- Export Express app as Vercel handler
- Vercel automatically routes `/api/*` to handler
- No business logic changes

**Key differences (handled by adapter):**
- Server runs stateless (no persistent connections)
- Request/response passed through Vercel runtime
- Cold start optimizations (connection pooling handled by Supabase)

**Code changes:**
- Create: `api/index.js` (~60 lines - Vercel adapter wrapper)
- Update: Database connection string (1 line - Supabase URL)
- Update: CORS `FRONTEND_URL` env var (already dynamic)
- Move: `src/` assets referenced correctly

---

### 3. Database Migration (Supabase)

**Schema:** PostgreSQL 14 (Supabase default)
- Fully compatible with existing schema
- Use existing migration scripts (`src/config/migrate.js`)
- Apply schema to Supabase database

**Connection:**
- Supabase provides connection string: `postgresql://user:pass@host:5432/postgres`
- Replace `DB_*` env vars with single `DATABASE_URL`
- Connection pooling: Supabase PgBouncer included

**Data:** None (fresh start) - no data migration needed

---

### 4. File Storage Migration (Supabase Storage)

**Current flow:**
- Files uploaded via `/api/upload` → saved to `/backend/uploads/`
- Downloaded via `/api/download/:id` → serves from disk

**New flow:**
- Files uploaded via `/api/upload` → stored in Supabase Storage bucket
- Downloaded via `/api/download/:id` → retrieves from bucket (signed URL)
- Storage buckets: `templates` (PDFs), `checklists` (annotations), `photos`

**Changes:**
- Update upload handler: Use `supabase.storage.from('bucket').upload()`
- Update download handler: Generate signed URL, redirect client
- No frontend changes (API contract same)

---

### 5. Environment Variables

**Vercel Environment Variables** (set in Vercel dashboard):

```
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=xxxxx (anon key)
DATABASE_URL=postgresql://postgres:xxxxx@xxxxx.supabase.co:5432/postgres

# JWT
JWT_SECRET=[your-secret-key]
JWT_EXPIRES_IN=7d

# Upload config
MAX_PHOTO_SIZE_MB=5
MAX_PHOTOS=20

# Frontend
FRONTEND_URL=https://[project].vercel.app
```

**No `.env` files in production.** Vercel injects at runtime.

---

## Phased Rollout (1-2 weeks)

### Phase 1: Infrastructure Setup (Day 1-2)

1. Create Supabase account & PostgreSQL database
2. Apply schema to Supabase (run `migrate.js` against Supabase DB)
3. Create Vercel project, link GitHub
4. Generate Supabase API keys (anon + service role)
5. Store credentials in Vercel Environment Variables

**Verification:** Can connect backend code to Supabase DB locally

---

### Phase 2: Backend Deployment (Day 3-4)

1. Create `/api` directory in repo root
2. Implement Vercel serverless adapter (`/api/index.js`)
3. Update database connection to use Supabase
4. Test locally: `vercel dev` (simulates Vercel serverless locally)
5. Deploy to Vercel (git push triggers auto-deploy)

**Verification:** API endpoints respond from Vercel, connect to Supabase DB

---

### Phase 3: Frontend Deployment (Day 5)

1. Update `VITE_API_URL` to point to Vercel backend
2. Test all API calls (auth, templates, checklists)
3. Push to GitHub (triggers Vercel auto-build)

**Verification:** Frontend loads from Vercel, API calls work end-to-end

---

### Phase 4: File Storage (Day 6-7)

1. Create Supabase Storage buckets (`templates`, `checklists`, `photos`)
2. Update upload/download handlers to use Supabase Storage
3. Test file upload, download, deletion flows
4. Configure bucket CORS if needed

**Verification:** Files upload, download, persist across sessions

---

### Phase 5: Production Hardening (Day 7+)

1. Enable Supabase authentication (optional - could use JWT as-is)
2. Setup error tracking (Sentry, Vercel Error Alerts)
3. Configure logging (Vercel logs, Supabase audit logs)
4. Security audit: CORS policies, rate limiting, input validation
5. DNS/custom domain setup (optional)

---

## Fallback & Rollback Strategy

**If deployment stalls:**
- Backend can go live independently (Phase 3) while frontend still uses local development
- Database connection can be tested before full deployment
- File storage is non-blocking (can use local uploads initially)

**Rollback to local development:**
- Change `VITE_API_URL` back to `localhost:5000`
- Restart local backend: `npm run dev`
- No data loss (fresh start)

---

## Testing & Verification

**Before Phase 2 (Backend):**
- ✅ Connect to Supabase DB from local machine
- ✅ Run migrations successfully
- ✅ Query tables (users, templates, checklists)

**Before Phase 3 (Frontend):**
- ✅ All API endpoints respond from `vercel.app/api`
- ✅ JWT auth works end-to-end
- ✅ Database queries successful

**Before Phase 4 (File Storage):**
- ✅ File upload/download works with Supabase Storage
- ✅ Signed URLs generate correctly
- ✅ Permissions/CORS configured

**Before Phase 5 (Production):**
- ✅ Full workflow: login → create checklist → upload photo → download PDF
- ✅ Error handling tested (500, 404, auth failures)
- ✅ Performance acceptable (cold start < 3s)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Vercel cold starts slow | Optimize with connection pooling (Supabase PgBouncer) |
| Database credential leaks | Store only in Vercel; never commit to git |
| File storage costs | Monitor Supabase usage; delete test uploads after testing |
| CORS issues | Test with Vercel URL early; configure buckets correctly |
| API rate limits | Supabase has generous free tier; upgrade if needed |

---

## Success Criteria

- ✅ Frontend accessible at `vercel.app`
- ✅ Backend API responding from `vercel.app/api`
- ✅ All database operations work (create/read/update/delete)
- ✅ File uploads/downloads functional
- ✅ User can complete full checklist workflow end-to-end
- ✅ No API errors or crashes over 24-hour period
- ✅ Performance acceptable (page load < 2s, API response < 500ms)

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|------------|
| 1. Infrastructure | Days 1-2 | Supabase DB + Vercel project ready |
| 2. Backend | Days 3-4 | API endpoints live on Vercel |
| 3. Frontend | Day 5 | Frontend deployed, API integration working |
| 4. File Storage | Days 6-7 | Upload/download functional |
| 5. Hardening | Days 7+ | Monitoring, security, optimization |

**Total ASAP timeline: 1-2 weeks** ✅

---

## Next Steps

1. User reviews this spec
2. Invoke `writing-plans` skill for detailed implementation plan
3. Execute plan phase-by-phase
4. Verify each phase before proceeding
