# Hugging Face Spaces setup (DiabetesInsight API)

> **Free-tier status (important):** Hugging Face no longer offers free **Docker** or **Gradio** Spaces. Creating a new Space shows Docker and Gradio as **locked behind PRO**, with the message *“Gradio and Docker Spaces require a paid plan.”* Only **Static** Spaces remain free — and Static cannot run this FastAPI + XGBoost API.
>
> **Do not use HF Docker as a free hosting path.** For a free Docker backend, follow **[RENDER_SETUP.md](./RENDER_SETUP.md)** (Render free Web Service from GitHub), then set Vercel `BACKEND_URL`. See also [DEPLOY.md](./DEPLOY.md).

This guide remains for anyone who already has a **paid (PRO)** Hugging Face plan and wants Docker Spaces. Everyone else should skip to Render.

| Item | Value |
|---|---|
| Space name | `diabetesinsight-api` |
| Frontend | `https://diabetesinsight.vercel.app` |
| Space URL (after create) | `https://YOUR_HF_USERNAME-diabetesinsight-api.hf.space` |

Replace `YOUR_HF_USERNAME` with your Hugging Face username everywhere below.

---

## Prerequisite: PRO plan

1. Confirm your account can create **Docker** Spaces (PRO or other paid plan that unlocks Docker).
2. If the new-Space form shows Docker/Gradio **locked**, stop here and use [RENDER_SETUP.md](./RENDER_SETUP.md) instead — do not pay solely for this class project if a free path works.

---

## 1. Create or log in to Hugging Face

1. Open [https://huggingface.co/join](https://huggingface.co/join) (new account) or [https://huggingface.co/login](https://huggingface.co/login).
2. Complete signup/login until you see your profile icon in the top-right.
3. Note your **username** (profile → username). You will use it as `YOUR_HF_USERNAME`.

---

## 2. Create the Space

1. Open [https://huggingface.co/new-space](https://huggingface.co/new-space).
2. Fill the form:

| Field | Choose |
|---|---|
| Space name | `diabetesinsight-api` |
| License | MIT (or leave default) |
| Space SDK | **Docker** (requires PRO — not free) |
| Space hardware | **CPU basic** (or whatever your plan includes) |
| Visibility | **Public** |

3. Click **Create Space**.
4. You land on an empty Space repo. Keep this tab open.

---

## 3. Upload the right files

The Space **root** must look like the monorepo root for Docker (not the `spaces/` folder itself).

### What to upload (local → Space)

From your local repo  
`…/CSCI6970_Dashboard/`:

| Local path | Upload as (Space path) | Notes |
|---|---|---|
| `spaces/Dockerfile` | `Dockerfile` | **Rename** — must be at Space root, not inside `spaces/` |
| `spaces/README.md` | `README.md` | Overwrites the default Space README (YAML header is required) |
| `backend/` | `backend/` | Includes `models/final_xgboost_model_bundle.pkl` (~large) |
| `reference/` | `reference/` | Tables / research artifacts the API reads |
| `docs/` | `docs/` | Feature schema and docs |

Do **not** upload: `frontend/`, `.git/`, `node_modules/`, `spaces/` as a folder, or the whole monorepo zip without renaming the Dockerfile.

### How to upload in the UI

1. On the Space page, open the **Files** tab.
2. Use **Add file → Upload files** (or the file browser upload).
3. Upload `Dockerfile` and `README.md` first (from `spaces/`, renamed as above).
4. Upload folders `backend/`, `reference/`, and `docs/` so they sit **next to** `Dockerfile`.
5. Confirm the Space root lists at least:

```text
Dockerfile
README.md
backend/
reference/
docs/
```

6. Commit / save the upload. The Space should start building automatically.

**CLI alternative (optional):** after `hf auth login`, clone the Space repo and copy the five items above into it, then `git add` + `git push`.

---

## 4. Set `CORS_ORIGINS`

1. On the Space page, open **Settings**.
2. Find **Variables and secrets** (or **Repository secrets / Variables**).
3. Add a **variable** (or secret — either works for this value):

| Name | Value |
|---|---|
| `CORS_ORIGINS` | `https://diabetesinsight.vercel.app` |

4. Save. If the Space was already running, use **Factory reboot** / restart so the new env is picked up.
5. Optional: add comma-separated Vercel preview origins later if needed.

---

## 5. Wait for the build and test health

1. Open the Space **App** / **Logs** tab and wait until the Docker build finishes (first build can take several minutes).
2. When the app is Running, open this URL in a browser:

```text
https://YOUR_HF_USERNAME-diabetesinsight-api.hf.space/api/health
```

3. You should see JSON with `"model_loaded": true` (and a healthy status).
4. Cold start after idle can take ~30–60+ seconds — refresh once if the first request times out.

Copy your working Space **origin** (no path, no trailing slash), e.g.:

```text
https://YOUR_HF_USERNAME-diabetesinsight-api.hf.space
```

---

## 6. Point Vercel at the Space

1. Open [https://vercel.com](https://vercel.com) → your DiabetesInsight project.
2. Go to **Settings → Environment Variables**.
3. Set or edit:

| Name | Value | Environment |
|---|---|---|
| `BACKEND_URL` | `https://YOUR_HF_USERNAME-diabetesinsight-api.hf.space` | Production (and Preview if you use it) |

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
| “Gradio and Docker Spaces require a paid plan” / Docker locked | Free account; Docker not free | Use [RENDER_SETUP.md](./RENDER_SETUP.md) — no paid plan required |
| Build: `COPY backend/...` fails / “no such file” | Dockerfile not at Space root, or `backend/` missing | Upload `spaces/Dockerfile` as root `Dockerfile`; upload `backend/`, `reference/`, `docs/` beside it |
| Build OOM / killed / weird pip failures | Memory during `pip install` or image build | Retry build; keep image slim; avoid uploading huge unused folders |
| Space runs but `/api/health` → `model_loaded: false` | Pickle missing under `backend/models/` | Confirm `backend/models/final_xgboost_model_bundle.pkl` is in the Space |
| Browser CORS errors calling the API host directly | `CORS_ORIGINS` wrong or not restarted | Set exact `https://diabetesinsight.vercel.app` (no slash); reboot Space |
| Frontend `/api/*` 502 / wrong host | `BACKEND_URL` wrong, trailing slash, or no redeploy | Fix URL; redeploy Vercel without relying on stale build cache |
| First request after idle fails | Space slept / cold start | Wait and retry; health URL should recover once the container is up |
| 404 on health | Wrong URL or Space not Running | Use `…hf.space/api/health` (not `/health`); check App/Logs |

---

## Quick checklist

- [ ] PRO (or paid) plan unlocks Docker — otherwise use Render free instead
- [ ] Space `diabetesinsight-api` created (Docker, public)
- [ ] Root has `Dockerfile`, `README.md`, `backend/`, `reference/`, `docs/`
- [ ] `CORS_ORIGINS=https://diabetesinsight.vercel.app` set; Space restarted if needed
- [ ] `https://YOUR_HF_USERNAME-diabetesinsight-api.hf.space/api/health` → `model_loaded: true`
- [ ] Vercel `BACKEND_URL` = Space origin (no trailing slash) + Redeploy
