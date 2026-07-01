# Checklist Management System
## PT. Lombok Torok Developments — MEP Maintenance

Aplikasi web untuk digitalisasi checklist MEP Maintenance. User login, pilih template PDF checklist, upload foto dokumentasi, lalu sistem auto-generate 1 PDF gabungan (template + foto + metadata).

---

## Struktur Folder

```
checklist-management/
├── backend/               # Node.js + Express API
│   ├── src/
│   │   ├── config/        # Database & migration
│   │   ├── middleware/    # Auth (JWT) + Upload (Multer)
│   │   ├── routes/        # Express routers
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # pdfService (pdf-lib)
│   │   └── app.js
│   ├── uploads/           # File uploads (gitignored)
│   ├── generated/         # Generated PDFs (gitignored)
│   ├── .env.example
│   └── package.json
└── frontend/              # React + Vite + TailwindCSS
    ├── src/
    │   ├── context/       # AuthContext
    │   ├── services/      # axios API client
    │   ├── components/    # Layout, ProtectedRoute
    │   └── pages/         # Login, Dashboard, Form, History, dll
    ├── index.html
    └── package.json
```

---

## Prerequisites

- **Node.js** v18+
- **PostgreSQL** v14+
- **npm** v9+

---

## Setup

### 1. Database

```bash
psql -U postgres
CREATE DATABASE checklist_db;
\q
```

### 2. Backend

```bash
cd backend

# Install dependencies
npm install

# Copy dan edit .env
cp .env.example .env
# Edit .env → isi DB_PASSWORD dan JWT_SECRET

# Jalankan migrasi (buat tabel + seed data)
npm run migrate

# Jalankan server
npm run dev
```

Server berjalan di: `http://localhost:5000`

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Aplikasi berjalan di: `http://localhost:5173`

---

## Kredensial Demo

| Field    | Value           |
|----------|-----------------|
| Username | `admin`         |
| Password | `Admin@1234`    |
| Role     | Administrator   |

---

## Variabel Environment (backend/.env)

| Variabel           | Default         | Keterangan                        |
|--------------------|-----------------|-----------------------------------|
| `PORT`             | `5000`          | Port server Express               |
| `DB_HOST`          | `localhost`     | Host PostgreSQL                   |
| `DB_PORT`          | `5432`          | Port PostgreSQL                   |
| `DB_NAME`          | `checklist_db`  | Nama database                     |
| `DB_USER`          | `postgres`      | Username PostgreSQL                |
| `DB_PASSWORD`      | *(wajib diisi)* | Password PostgreSQL                |
| `JWT_SECRET`       | *(wajib diisi)* | Secret key JWT (min 32 karakter)  |
| `JWT_EXPIRES_IN`   | `7d`            | Masa berlaku token                |
| `MAX_PHOTO_SIZE_MB`| `5`             | Batas ukuran foto (MB)            |
| `MAX_PHOTOS`       | `20`            | Batas jumlah foto per checklist   |
| `FRONTEND_URL`     | `http://localhost:5173` | URL frontend (CORS)      |

---

## Upload Template PDF (Admin)

Setelah login sebagai admin, upload PDF ke template via API:

```bash
curl -X POST http://localhost:5000/api/templates/1/upload-pdf \
  -H "Authorization: Bearer <TOKEN>" \
  -F "pdf=@/path/to/template.pdf"
```

Atau gunakan Postman/Insomnia dengan endpoint POST `/api/templates/:id/upload-pdf`.

---

## API Endpoints

### Auth
| Method | Endpoint              | Keterangan          |
|--------|-----------------------|---------------------|
| POST   | `/api/auth/register`  | Daftar user baru    |
| POST   | `/api/auth/login`     | Login               |
| GET    | `/api/auth/me`        | Info user aktif     |

### Templates
| Method | Endpoint                      | Keterangan                    |
|--------|-------------------------------|-------------------------------|
| GET    | `/api/templates`              | List semua template aktif     |
| GET    | `/api/templates/:id`          | Detail template               |
| GET    | `/api/templates/:id/view`     | Stream PDF template (iframe)  |
| POST   | `/api/templates/:id/upload-pdf` | Upload PDF (admin only)     |

### Checklist
| Method | Endpoint                      | Keterangan                    |
|--------|-------------------------------|-------------------------------|
| GET    | `/api/checklist/stats`        | Statistik dashboard           |
| GET    | `/api/checklist/my`           | List checklist user (paginasi)|
| GET    | `/api/checklist/:id`          | Detail checklist + foto       |
| POST   | `/api/checklist/submit`       | Submit checklist + generate PDF |
| DELETE | `/api/checklist/:id`          | Hapus checklist               |
| GET    | `/api/checklist/:id/download` | Download PDF hasil            |

---

## PDF Generation

PDF yang dihasilkan terdiri dari:
1. **Halaman template** — seluruh halaman dari template PDF asli
2. **Halaman foto** — 1 halaman per foto, berisi header, foto (auto-resize ke A4), dan caption
3. **Halaman Submission Details** — ringkasan: judul, template, lokasi, petugas, tanggal, jumlah foto, catatan

---

## Phase 2 (Rencana)

- Migrasi storage ke SharePoint
- Admin panel untuk manajemen template & user
- Export Excel rekap checklist
- Push notification saat PDF selesai

---

## Tech Stack

| Komponen    | Teknologi                          |
|-------------|------------------------------------|
| Backend     | Node.js 18 + Express 4             |
| Frontend    | React 18 + Vite + TailwindCSS 3   |
| Database    | PostgreSQL 14+                     |
| PDF         | pdf-lib + sharp (image processing) |
| Auth        | JWT + bcryptjs                     |
| File Upload | Multer                             |
| HTTP Client | Axios                              |
