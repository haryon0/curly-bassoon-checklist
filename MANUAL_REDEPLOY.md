# Manual Redeploy Instructions

Jika Vercel belum auto-deploy setelah push, ikuti langkah ini:

## Step 1: Buka Vercel Dashboard

https://vercel.com/dashboard

## Step 2: Pilih Project

Klik project: **checklist-management-green**

## Step 3: Buka Deployments Tab

Di sidebar, klik **Deployments**

## Step 4: Cari Deployment Terbaru

Lihat list deployment. Cari yang paling atas (paling baru).

## Step 5: Klik Redeploy

Hover di atas deployment → Klik **3 dots (...)**  → Pilih **Redeploy**

Atau langsung klik deployment → Tombol **Redeploy** (biasanya di atas)

## Step 6: Tunggu Deployment Selesai

Status akan berubah:
- 🟡 "Building..." → Sedang build
- 🟡 "Deploying..." → Sedang deploy
- 🟢 "Ready" → Selesai! ✅

Biasanya 2-3 menit.

## Step 7: Verify Environment Variables

Sebelum redeploy, pastikan sudah setup env vars:

https://vercel.com/dashboard → Project → **Settings** → **Environment Variables**

Harus ada:
- ✅ DATABASE_URL
- ✅ SUPABASE_URL
- ✅ SUPABASE_KEY
- ✅ JWT_SECRET
- ✅ JWT_EXPIRES_IN
- ✅ MAX_PHOTO_SIZE_MB
- ✅ MAX_PHOTOS
- ✅ FRONTEND_URL

Jika ada yang missing, add sekarang sebelum redeploy.

## Step 8: Test Deployment

Setelah status "Ready" (hijau):

Buka: https://checklist-management-green.vercel.app/api/health

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-07-01T..."
}
```

Jika error, lihat **Logs**:
Deployments → Latest deployment → Klik → Scroll ke bawah → Lihat error message

## Troubleshooting

### Error: "Database connection refused"
- Check DATABASE_URL di Vercel env vars
- Pastikan password di-encode: @ = %40, # = %23, ! = %21
- Vercel harus bisa reach db.lxednjurpshwzaqcfyrp.supabase.co

### Error: "Module not found"
- Check backend/package.json
- Pastikan dependencies: pg, express, cors, dll
- Redeploy lagi

### Error: "404 Not Found"
- Check route path di api/index.js
- Pastikan routes di-mount dengan benar
- Check logs untuk detail

## Jika Masih Error

Lihat full logs:
1. Vercel dashboard → Deployments
2. Klik deployment → "View Logs"
3. Scroll dan cari error message
4. Share error message untuk debugging
