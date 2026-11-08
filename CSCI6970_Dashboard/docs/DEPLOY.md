# Deploy

Minimal production layout for DiabetesInsight.

## Pieces

1. FastAPI serves `/api` and loads `backend/models/final_xgboost_model_bundle.pkl`.
2. Next.js proxies `/api/*` via `frontend/src/app/api/[...path]/route.ts` (GET responses cached ~5 minutes on Vercel).
3. GitHub Action (repo-root `.github/workflows/keepalive.yml`) pings Render every ~12 minutes so the free API stays awake.

Do not ship raw participant rows or SEQN.

## Environment

Copy `.env.example`.

| Variable | Where | Purpose |
|---|---|---|
| `BACKEND_URL` | Next.js server | Rewrite target for `/api/*` |
| `NEXT_PUBLIC_API_URL` | Browser (optional) | Leave empty to use same-origin `/api` |
| `CORS_ORIGINS` | FastAPI | Frontend origin(s), comma-separated |

Example production values (Render free — recommended free Docker path):

```env
BACKEND_URL=https://diabetesinsight-api.onrender.com
CORS_ORIGINS=https://diabetesinsight.vercel.app
```

## Docker (API)

From the dashboard root (Render / Railway / local — port **8000**):

```bash
docker build -t diabetesinsight-api -f backend/Dockerfile .
docker run --rm -p 8000:8000 \
  -e CORS_ORIGINS=https://diabetesinsight.vercel.app \
  diabetesinsight-api
```

HF Spaces image (port **7860**, does not replace `backend/Dockerfile`) — **PRO required** on Hugging Face; not a free path:

```bash
docker build -t diabetesinsight-hf -f spaces/Dockerfile .
docker run --rm -p 7860:7860 \
  -e CORS_ORIGINS=https://diabetesinsight.vercel.app \
  diabetesinsight-hf
```

Health check: `GET /api/health` should return `"model_loaded": true`.

## Backend hosting options

| Path | Cost | Notes |
|---|---|---|
| **[Render free Web Service](./RENDER_SETUP.md)** | Free | **Recommended free Docker path.** GitHub → Docker (`backend/Dockerfile`) → public URL → Vercel `BACKEND_URL`. Free instances **sleep** after idle; cold starts often **30–90+ seconds**. |
| Railway / Fly | Free tier varies | Same image: `backend/Dockerfile` from monorepo root. Check current free limits. |
| [Hugging Face Docker Spaces](./HF_SPACES_SETUP.md) | **PRO / paid** | Docker and Gradio Spaces are **locked behind PRO** (“Gradio and Docker Spaces require a paid plan”). Only Static Spaces are free — not usable for this API. **Do not recommend HF Docker as a free path.** |

## Render (free) — recommended

Full click-by-click: **[RENDER_SETUP.md](./RENDER_SETUP.md)**.

1. **New Web Service** on [render.com](https://render.com) from the GitHub repo; root = `CSCI6970_Dashboard`.
2. **Runtime: Docker**, Dockerfile path **`backend/Dockerfile`**, build context = repo root, instance **Free**.
3. **Env** — `CORS_ORIGINS=https://diabetesinsight.vercel.app`.
4. **Health** — wait for Live, then `https://YOUR-SERVICE.onrender.com/api/health` → `"model_loaded": true` (retry after cold start if needed).
5. **Vercel** — set `BACKEND_URL` to that origin (no trailing slash), then **Redeploy**. Leave `NEXT_PUBLIC_API_URL` empty.

Expect sleep after ~15 minutes idle and a slow first request — normal on free Render.

## Hugging Face Spaces (PRO only)

Not free for Docker. If you already have PRO, see **[HF_SPACES_SETUP.md](./HF_SPACES_SETUP.md)**. Otherwise use Render.

## Frontend

```bash
cd frontend
npm ci
BACKEND_URL=https://diabetesinsight-api.onrender.com npm run build
npm run start
```

### Vercel (recommended frontend host)

Deploy **only** the Next.js app on Vercel. Keep FastAPI + XGBoost/SHAP on a container host ([Render free](./RENDER_SETUP.md), Railway, Fly, or HF Docker **if you have PRO**). Vercel serverless is a poor fit for cold-loading the joblib bundle and SHAP.

The Next.js App Router lives under **`frontend/src/app/`** (App Router). On GitHub (`NHANES-Diabetes-Prediction`), that path is **`CSCI6970_Dashboard/frontend`** relative to the repo root. `rootDirectory` is a **Vercel project setting** (not something `vercel.json` can set). If Root Directory is empty / the git repo root, the build fails with: `Couldn't find any pages or app directory`.

1. **Backend first** — prefer [Render free Web Service](./RENDER_SETUP.md) with `backend/Dockerfile`. Set `CORS_ORIGINS` to `https://diabetesinsight.vercel.app`. Confirm `GET /api/health` returns `"model_loaded": true`.
2. **Vercel Root Directory** — must be `CSCI6970_Dashboard/frontend` (Framework: Next.js).
   - Dashboard: **Project Settings → General → Root Directory** = `CSCI6970_Dashboard/frontend` → Save, then Redeploy.
   - CLI (from `frontend/`, with the project linked):  
     `npx vercel project update diabetesinsight --root-directory CSCI6970_Dashboard/frontend --yes`
3. **Env on Vercel** — set `BACKEND_URL` to the public API origin (e.g. `https://diabetesinsight-api.onrender.com`). Leave `NEXT_PUBLIC_API_URL` empty so the browser uses same-origin `/api` via `next.config.ts` rewrites. `BACKEND_URL` is read at **build** time for rewrites — set it before the first production build (or redeploy after changing it).
4. **Gotchas** — model pickle must ship in the API image (`backend/models/`); Docker also needs `reference/` for tables; do not put the API on Vercel; academic disclaimer must stay visible on every main page; free Render sleeps after idle.

## Checklist

- [ ] Model pickle present under `backend/models/`
- [ ] `reference/outputs/tables` readable by the API container or volume-mounted
- [ ] CORS matches the live frontend origin
- [ ] `/api/health` green (retry once after free-tier cold start)
- [ ] `/predict` works with synthetic demo
- [ ] Academic disclaimer visible on every main page
