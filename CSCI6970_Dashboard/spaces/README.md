---
title: DiabetesInsight API
emoji: 🩺
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
short_description: FastAPI backend for the DiabetesInsight NHANES research demo
---

# DiabetesInsight API (Hugging Face Space)

Docker Space hosting the FastAPI + XGBoost backend for
[DiabetesInsight](https://diabetesinsight.vercel.app).

Academic research demo only — not a medical diagnostic system.

## Space files

At the Space **root** (next to this README):

| Path | Role |
|---|---|
| `Dockerfile` | Builds the API image (port **7860**) |
| `backend/` | FastAPI app + `models/final_xgboost_model_bundle.pkl` |
| `reference/` | Tables / research artifacts read by the API |
| `docs/` | Feature schema and docs |

Copy those directories from the monorepo root when creating or updating the Space.

## Environment / secrets

In the Space **Settings → Variables and secrets**, set:

| Name | Example | Required |
|---|---|---|
| `CORS_ORIGINS` | `https://diabetesinsight.vercel.app` | Yes (for browser CORS if called cross-origin) |

Comma-separate multiple origins if needed (e.g. preview URLs).

## Health check

After the Space builds, open:

`https://<your-space>.hf.space/api/health`

Expect `"model_loaded": true`.

## Frontend wiring

On Vercel, set `BACKEND_URL` to the Space origin (no trailing slash), e.g.
`https://<user>-diabetesinsight-api.hf.space`, then redeploy so Next.js rewrites pick it up.
