# Vercel Environment Variables Setup

Go to: https://vercel.com/dashboard → Select project → Settings → Environment Variables

Add the following environment variables:

## Database Configuration

1. **DATABASE_URL** (Required)
   - Value: `postgresql://postgres:Sam%40ra%232026%21@db.lxednjurpshwzaqcfyrp.supabase.co:5432/postgres`
   - Environments: Production, Preview, Development
   - Note: Password special chars are URL-encoded (@=%40, #=%23, !=%21)

## API Keys

2. **SUPABASE_URL** (Required for file storage)
   - Value: `https://lxednjurpshwzaqcfyrp.supabase.co`
   - Environments: Production, Preview, Development

3. **SUPABASE_KEY** (Required for file storage - use Anon Public Key)
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4ZWRuanVycHNod3phcWNmeXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzcwNTcsImV4cCI6MjA5ODQ1MzA1N30.RjhBU5ckdh_Csq2uc8G9hBfw6gCtHMsmsCykkj2qYj8`
   - Environments: Production, Preview, Development

## Authentication

4. **JWT_SECRET** (Required)
   - Value: Use a strong random string (min 32 chars)
   - Environments: Production, Preview, Development
   - Suggestion: Generate at https://www.uuidgenerator.net/ or use: `your-super-secret-jwt-key-change-this-in-production-12345`

5. **JWT_EXPIRES_IN** (Required)
   - Value: `7d`
   - Environments: Production, Preview, Development

## Upload Configuration

6. **MAX_PHOTO_SIZE_MB** (Required)
   - Value: `5`
   - Environments: Production, Preview, Development

7. **MAX_PHOTOS** (Required)
   - Value: `20`
   - Environments: Production, Preview, Development

## Frontend Configuration

8. **FRONTEND_URL** (Required)
   - Value: `https://checklist-management-green.vercel.app`
   - Environments: Production, Preview, Development

## Build Configuration (Optional)

9. **NODE_ENV** (Optional)
   - Value: `production`
   - Environments: Production only

---

## Setup Steps

1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Click "Add"
5. Enter each variable name and value
6. Select environments where it applies
7. Click "Save"
8. Repeat for all 8 variables
9. After all variables are added, redeploy project

---

## Verification

After adding all variables, go to Deployments → Latest → Redeploy

The deployment should:
- ✅ Install dependencies
- ✅ Build serverless functions
- ✅ Connect to Supabase database
- ✅ Deploy successfully

Then test at: https://checklist-management-green.vercel.app/api/health

Expected response: `{"status":"ok","timestamp":"2026-07-01T..."}`
