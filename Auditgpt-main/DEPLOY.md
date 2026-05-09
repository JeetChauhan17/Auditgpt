# AuditGPT Deployment Guide

## Architecture
- **Backend** → [Railway](https://railway.app) (FastAPI / Python)
- **Frontend** → [Vercel](https://vercel.com) (React / Vite)

---

## Step 0 — Clean up (do this first, locally)

Delete these files/dirs from your repo — they were Vercel-monorepo hacks:

```bash
rm -rf api/               # Vercel serverless shim — gone
rm -f vercel.json         # Root-level vercel config — gone
rm -rf scripts/           # Duplicate of backend/scripts/ — gone
```

Move fraud_signatures into backend:
```bash
mv fraud_signatures/ backend/fraud_signatures/
```

Commit everything:
```bash
git add -A
git commit -m "chore: clean up vercel monorepo hacks, split backend/frontend"
git push
```

---

## Step 1 — Deploy Backend to Railway

### 1.1 — Create a new Railway project

1. Go to [railway.app](https://railway.app) → **New Project**
2. Choose **Deploy from GitHub repo**
3. Select your repo
4. Railway will auto-detect the `Dockerfile` at root ✅

### 1.2 — Set environment variables in Railway

In your Railway service → **Variables** tab, add:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://your-app.vercel.app` ← fill in after Step 2 |
| *(any other backend env vars your app needs)* | |

> **Note:** `PORT` is automatically injected by Railway — do not set it manually.

### 1.3 — Deploy

Click **Deploy**. Railway will build the Docker image and start the server.

Once deployed, copy your Railway public URL:
```
https://your-app.railway.app
```

Test it:
```
https://your-app.railway.app/health  → {"status": "ok"}
```

---

## Step 2 — Deploy Frontend to Vercel

### 2.1 — Import project

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. **Set Root Directory to `frontend`** ← critical

### 2.2 — Set environment variables in Vercel

In the Vercel project → **Settings → Environment Variables**, add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-app.railway.app/api` |

Set this for **Production**, **Preview**, and **Development** environments.

### 2.3 — Build settings (Vercel should auto-detect, but verify)

| Setting | Value |
|---------|-------|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 2.4 — Deploy

Click **Deploy**. Once done, copy your Vercel URL:
```
https://your-app.vercel.app
```

---

## Step 3 — Wire them together

1. Go back to **Railway** → your service → **Variables**
2. Set `FRONTEND_URL` = `https://your-app.vercel.app`
3. Redeploy the Railway service (Variables tab → **Redeploy**)

---

## Step 4 — Verify

```bash
# Backend health
curl https://your-app.railway.app/health

# Frontend loads and calls backend
open https://your-app.vercel.app
```

Check browser DevTools → Network tab — API calls should go to `railway.app`, not localhost.

---

## Local Development

```bash
# Terminal 1 — Backend
cd <repo-root>
uvicorn backend.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
cp .env.example .env.local   # only once
# .env.local already points to localhost:8000 by default (no edit needed)
npm run dev
```

Frontend at `http://localhost:5173`, backend at `http://localhost:8000`.

---

## Troubleshooting

**CORS errors in browser:**
- Make sure `FRONTEND_URL` in Railway matches your exact Vercel URL (no trailing slash)
- Redeploy Railway after changing env vars

**`Module not found: backend.api.routes`:**
- Railway runs from repo root, so `backend.main:app` resolves correctly
- Check that `backend/__init__.py` exists

**Vercel shows blank page / 404 on refresh:**
- `frontend/vercel.json` handles this with the SPA rewrite rule ✅

**Railway build fails:**
- Check `backend/requirements.txt` has all dependencies
- Try toggling between Dockerfile and nixpacks in Railway service settings
