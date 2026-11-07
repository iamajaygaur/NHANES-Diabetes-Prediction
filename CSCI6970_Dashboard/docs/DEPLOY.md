# Deploy

Minimal production layout for DiabetesInsight.

## Pieces

1. FastAPI serves `/api` and loads `backend/models/final_xgboost_model_bundle.pkl`.
2. Next.js serves the UI and rewrites `/api/*` to the API host.

Do not ship raw participant rows or SEQN.

## Environment

Copy `.env.example`.

| Variable | Where | Purpose |
|---|---|---|
| `BACKEND_URL` | Next.js server | Rewrite target for `/api/*` |
| `NEXT_PUBLIC_API_URL` | Browser (optional) | Leave empty to use same-origin `/api` |
| `CORS_ORIGINS` | FastAPI | Frontend origin(s), comma-separated |

Example production values:

```env
BACKEND_URL=https://api.example.com
CORS_ORIGINS=https://app.example.com
```

## Docker (API)

From the dashboard root:

```bash
docker build -t diabetesinsight-api -f backend/Dockerfile .
docker run --rm -p 8000:8000 \
  -e CORS_ORIGINS=https://app.example.com \
  diabetesinsight-api
```

Health check: `GET /api/health` should return `"model_loaded": true`.

## Frontend

```bash
cd frontend
npm ci
BACKEND_URL=https://api.example.com npm run build
npm run start
```

Or deploy the `frontend` app to Vercel/Netlify and set `BACKEND_URL` in the host env.

## Checklist

- [ ] Model pickle present under `backend/models/`
- [ ] `reference/outputs/tables` readable by the API container or volume-mounted
- [ ] CORS matches the live frontend origin
- [ ] `/api/health` green
- [ ] `/predict` works with synthetic demo
- [ ] Academic disclaimer visible on every main page
