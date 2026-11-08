# Render free Web Service setup (DiabetesInsight API)

Click-by-click guide to host the FastAPI backend on a **free** Render Docker Web Service from GitHub, then point the Vercel frontend at it.

This is the recommended **free** Docker path. Hugging Face Docker Spaces now require a **paid (PRO)** plan — see [HF_SPACES_SETUP.md](./HF_SPACES_SETUP.md). Do not rely on HF Docker for free hosting.

| Item | Value |
|---|---|
| Service name | `diabetesinsight-api` (suggested) |
| Frontend | `https://diabetesinsight.vercel.app` |
| GitHub root | `CSCI6970_Dashboard` (monorepo root) |
| Dockerfile | `backend/Dockerfile` |
| Public URL (after create) | `https://diabetesinsight-api.onrender.com` (or the URL Render shows) |

Replace the example `*.onrender.com` host with **your** service URL everywhere below.

---

## Honest free-tier limits

Render’s free Web Service is usable for demos and class projects, but it is not always-on:

- **Sleep / spin-down** — after ~15 minutes with no traffic, the service often sleeps.
- **Cold starts** — the first request after sleep can take **30–90+ seconds** (Docker wake + Python import + loading the XGBoost/SHAP pickle). A second refresh usually succeeds once the process is up.
- **Build time** — first deploy builds the image from `backend/Dockerfile`; expect several minutes.
- **Ephemeral** — free instances can be recycled; that is fine for a stateless API that reloads the model on boot.

If a health check times out once after idle, wait and retry — that is normal on free Render, not necessarily a bad deploy.

### Keeping it warm (so visitors wait less)

The GitHub repo includes `.github/workflows/keepalive.yml` (at the repository root), which curls `/api/health` every ~12 minutes. After you push, confirm the workflow is enabled under **Actions** (first run may need “Enable workflows”).

The Vercel frontend also:

- warms `/api/health` as soon as the shell loads
- caches successful dashboard GETs for ~5 minutes (session + Vercel)

---

## Before you start

1. Push this monorepo to **GitHub** (the same repo Vercel already uses is ideal).
2. Confirm the repo root contains `backend/Dockerfile`, `backend/`, `reference/`, and `docs/` (build context is the **repo root**, not `backend/` alone).
3. Have access to [https://diabetesinsight.vercel.app](https://diabetesinsight.vercel.app) on Vercel so you can set `BACKEND_URL` later.

---

## 1. Create or log in to Render

1. Open [https://render.com](https://render.com) → **Get Started** / **Log in**.
2. Prefer **Sign in with GitHub** so Render can see your repos.
3. Authorize Render to access the GitHub account/org that owns `CSCI6970_Dashboard` (or grant access to that one repository).

---

## 2. Create a free Web Service

1. From the Render Dashboard, click **New +** → **Web Service**.
2. Choose **Build and deploy from a Git repository** → connect/select the repo that contains this dashboard.
3. Select the **`CSCI6970_Dashboard`** repository (monorepo root).
4. Fill the form:

| Field | Choose |
|---|---|
| Name | `diabetesinsight-api` |
| Region | Any nearby region (default is fine) |
| Branch | `main` (or your default deploy branch) |
| Runtime | **Docker** |
| Dockerfile path | `backend/Dockerfile` |
| Docker build context directory | `.` / repo root (default — **required** so `COPY backend`, `reference`, `docs` work) |
| Instance type | **Free** |

5. Leave the start command empty — the Dockerfile already runs uvicorn on port **8000**. Render detects `EXPOSE` / the listening port from the image.
6. Click **Create Web Service** (or **Deploy**).

Do **not** set Root Directory to `backend/` unless you also change the Dockerfile copy paths — this project’s `backend/Dockerfile` expects the **monorepo root** as build context.

---

## 3. Set `CORS_ORIGINS`

1. Open the new service → **Environment** (or **Environment Variables**).
2. Add:

| Key | Value |
|---|---|
| `CORS_ORIGINS` | `https://diabetesinsight.vercel.app` |

3. Save. Render will redeploy if prompted (or trigger a **Manual Deploy** so the env is live).
4. Optional later: comma-separate Vercel preview origins if you need them.

---

## 4. Wait for the build and copy the public URL

1. Open the service **Logs** / **Events** tab and wait until the deploy is **Live** (first Docker build can take several minutes).
2. At the top of the service page, copy the public URL Render assigned, e.g.:

```text
https://diabetesinsight-api.onrender.com
```

No trailing slash. That origin is your API host.

---

## 5. Test health

1. In a browser, open:

```text
https://YOUR-SERVICE.onrender.com/api/health
```

2. You should see JSON with `"model_loaded": true` (and a healthy status).
3. If the first hit after a long idle fails or spins for a long time, wait ~1 minute and refresh — free cold start + model load.

---

## 6. Point Vercel at Render

1. Open [https://vercel.com](https://vercel.com) → your DiabetesInsight project.
2. Go to **Settings → Environment Variables**.
3. Set or edit:

| Name | Value | Environment |
|---|---|---|
| `BACKEND_URL` | `https://YOUR-SERVICE.onrender.com` | Production (and Preview if you use it) |

Rules:

- **No trailing slash** on `BACKEND_URL`.
- Leave `NEXT_PUBLIC_API_URL` empty so the browser uses same-origin `/api` via Next rewrites.

4. Save the variable.
5. Go to **Deployments** → open the latest production deployment → **⋯ → Redeploy**.
   - Prefer a full rebuild (not “use existing Build Cache” if offered), because `BACKEND_URL` is read at **build** time for rewrites.
6. After redeploy, open `https://diabetesinsight.vercel.app` and try a prediction / health-backed flow.

---

## 7. Common failures

| Symptom | Likely cause | Fix |
|---|---|---|
| Build: `COPY backend/...` fails / “no such file” | Build context is `backend/` instead of repo root, or wrong Dockerfile path | Dockerfile path `backend/Dockerfile`; context = monorepo root (`.`) |
| Deploy Live but `/api/health` hangs then fails | Free instance sleeping / cold start | Wait 30–90s and retry; confirm Logs show uvicorn started |
| Health → `model_loaded: false` | Pickle missing in image | Ensure `backend/models/final_xgboost_model_bundle.pkl` is committed (or otherwise available to the Docker build) |
| Browser CORS errors calling the API host directly | `CORS_ORIGINS` wrong or not redeployed | Set exact `https://diabetesinsight.vercel.app` (no slash); redeploy |
| Frontend `/api/*` 502 / wrong host | `BACKEND_URL` wrong, trailing slash, or no Vercel redeploy | Fix URL; redeploy Vercel without stale build cache |
| Port / “application failed to respond” | Process not listening on the port Render expects | Image must listen on **8000** (as in `backend/Dockerfile`); do not override CMD to a different port unless you match Render’s port settings |
| HF “Docker requires paid plan” | Tried Hugging Face free Docker | Use this Render guide instead |

---

## Quick checklist

- [ ] GitHub repo connected; Web Service **Docker** + Free
- [ ] Dockerfile path `backend/Dockerfile`, build context = `CSCI6970_Dashboard` root
- [ ] `CORS_ORIGINS=https://diabetesinsight.vercel.app` set; service redeployed if needed
- [ ] `https://YOUR-SERVICE.onrender.com/api/health` → `model_loaded: true` (retry after cold start)
- [ ] Vercel `BACKEND_URL` = Render origin (no trailing slash) + Redeploy
- [ ] Expect sleep + slow first request after idle on free tier
