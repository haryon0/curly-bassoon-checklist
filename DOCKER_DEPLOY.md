# Deploy with Docker on an Ubuntu VPS

Runs the app as two containers:

- **frontend** — nginx serving the built Vite app on port **80**, and proxying `/api` to the backend.
- **backend** — Express API on port 5000 (internal), with `uploads/` and `generated/` persisted to `./data` on the host.

Database stays on **Supabase online** (via `DATABASE_URL`).

---

## 1. Install Docker (once)

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # then log out/in so `docker` works without sudo
```

Docker Compose v2 is included (`docker compose ...`).

## 2. Get the code

```bash
git clone https://github.com/haryon0/curly-bassoon-checklist.git
cd curly-bassoon-checklist
```

## 3. Create the backend env file

`backend/.env` is NOT in git (it holds secrets). Create it on the VPS:

```bash
cp backend/.env.docker.example backend/.env
nano backend/.env      # fill in DATABASE_URL password and JWT_SECRET
```

Generate a JWT secret with:

```bash
openssl rand -base64 48
```

## 4. Build and run

```bash
docker compose up -d --build
```

Check status and logs:

```bash
docker compose ps
docker compose logs -f backend      # should print "Connected to Supabase PostgreSQL database"
```

## 5. Test

```bash
curl http://localhost/api/health      # -> {"status":"ok",...}
```

Then open **http://YOUR_VPS_IP** in a browser. Make sure the VPS firewall allows port 80:

```bash
sudo ufw allow 80/tcp
```

---

## Common commands

```bash
docker compose up -d --build     # rebuild + restart after code changes
docker compose down              # stop
docker compose logs -f           # tail all logs
```

## Where is my data?

Uploaded photos and generated PDFs live on the host at:

```
./data/uploads/
./data/generated/
```

Back these up. They survive `docker compose down` and rebuilds.

## Notes

- **HTTPS** is not set up yet (access is via `http://IP`). When you have a domain,
  the easiest upgrade is to put Caddy in front (automatic Let's Encrypt) or add
  nginx + certbot. Ask and I'll wire it up.
- **Login is currently disabled** (TESTING MODE). To restore real login later,
  revert the auth changes and rebuild.
- The `api/` folder (Vercel serverless) is **not used** in this Docker setup.
